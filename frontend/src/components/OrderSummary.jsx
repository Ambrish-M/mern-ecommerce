import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { loadRazorpayScript } from "../utils/loadRazorpayScript";
import toast from "react-hot-toast";

motion;

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
  const { user } = useUserStore();

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formatedSavings = savings.toFixed(2);
  const handlePayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load Razorpay script.");
      return;
    }
    try {
      const res = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
      });

      const order = res.data;

      const options = {
        key: "rzp_test_pfc76EbxXjLA5Y",
        amount: order.amount,
        currency: "INR",
        name: user.name,
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post("/payments/checkout-success", {
              razorpayId: response.razorpay_order_id,
            });

            window.location.href = `/purchase-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
          } catch (err) {
            console.error("Checkout success error:", err);
            toast.error("Error finalizing your order. Please contact support.");
          }
        },

        modal: {
          ondismiss: function () {
            window.location.href = "/purchase-cancel";
          },
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#10b981",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-200 overflow-hidden p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-amber-600">Order summary </p>

      <div className="space-y-4">
        <div className="space-y-2 ">
          <dl className="flex items-center justify-between">
            <dt className="text-base font-normal text-gray-200">
              Original Price
            </dt>
            <dd className="text-base font-medium text-white ">
              ₹{formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-200">Savings</dt>
              <dd className="text-base font-medium text-amber-600">
                ₹{formatedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-center gap-4">
              <dt className="text-base font-normal text-gray-00 ">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-amber-600">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
            <dt className="text-base font-bold text-white ">Total</dt>
            <dd className="text-base font-bold text-amber-600">
              ₹{formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flext w-full items-center justify-center rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium
            text-white  hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>

        <div className="flex items-center justify-center gap-2 ">
          <span className="text-sm font-normal text-white">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 underline hover:text-amber-500 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
