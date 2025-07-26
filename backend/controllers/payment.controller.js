import { razorpay } from "../config/razorpay.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();

const createNewCoupon = async (userId) => {
  const code = `SAVE${Math.floor(1000 + Math.random() * 9000)}`;
  const discountPercentage = 10;

  // Optional: avoid replacing active coupon if it already exists
  const existing = await Coupon.findOne({ userId, isActive: true });
  if (existing) return;

  await Coupon.updateOne(
    { userId },
    {
      $set: {
        code,
        discountPercentage,
        isActive: true,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    // Calculate total in paise
    let totalAmount = 0;
    products.forEach((product) => {
      const amount = Math.round(product.price * 100); // Convert to paise
      totalAmount += amount * product.quantity;
    });

    const originalAmount = totalAmount; // in paise

    // Apply coupon if available
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(products),
      },
    });

    // Create new reward coupon if original amount ≥ ₹20,000
    if (originalAmount >= 200000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({
      id: order.id,
      amount: totalAmount / 100, // Send rupees
      currency: "INR",
    });
  } catch (error) {
    console.error("Error in createCheckoutSession:", error);
    res.status(500).json({
      message: "Error in processing checkout",
      error: error.message,
    });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { razorpayId } = req.body;

    if (!razorpayId) {
      return res.status(400).json({ error: "`razorpay_order_id` is required" });
    }

    const orderData = await razorpay.orders.fetch(razorpayId);

    if (!orderData) {
      return res.status(404).json({ error: "Order not found in Razorpay" });
    }

    const { userId, couponCode, products } = orderData.notes;

    if (!userId || !products) {
      return res
        .status(400)
        .json({ error: "Missing userId or products in order notes" });
    }

    const parsedProducts = JSON.parse(products);

    // Create order only if it doesn't exist (safe upsert)
    const result = await Order.updateOne(
      { razorpayOrderId: razorpayId },
      {
        $setOnInsert: {
          user: userId,
          products: parsedProducts.map((product) => ({
            product: product.product || product._id || product.id,
            quantity: product.quantity,
            price: product.price,
          })),
          totalAmount: orderData.amount / 100,
          razorpayOrderId: razorpayId,
        },
      },
      { upsert: true }
    );

    // If an order was newly inserted
    if (result.upsertedCount > 0) {
      // Clear cart
      await User.findByIdAndUpdate(userId, { cartItems: [] });

      // Deactivate coupon if used
      if (couponCode) {
        await Coupon.findOneAndUpdate(
          { code: couponCode, userId },
          { isActive: false }
        );
      }

      return res.status(201).json({
        success: true,
        message: "New order created successfully",
        razorpayOrderId: razorpayId,
      });
    } else {
      // Order already existed
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        razorpayOrderId: razorpayId,
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};
