import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "../lib/axios";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { clearCart } = useCartStore();
  const [error, setError] = useState(null);
  useEffect(() => {
    const handleCheckoutSuccess = async (orderId) => {
      try {
        await axios.post("/payments/checkout-success", {
          razorpayId: orderId,
        });
        clearCart();
      } catch (error) {
        console.log(error);
      } finally {
        setIsProcessing(false);
      }
    };
    const orderId = new URLSearchParams(window.location.search).get("order_id");
    if (orderId) {
      handleCheckoutSuccess(orderId);
    } else {
      setIsProcessing(false);
      setError("No order ID found in the URL");
    }
  }, [clearCart]);

  if (isProcessing) return <LoadingSpinner />;

  if (error) return `Error:${error}`;
  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />

      <div className="max-w-md w-full bg-gray-200 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-amber-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-amber-500 mb-2">
            Purchase Successful!
          </h1>
          <p className="text-gray-900 text-center mb-2">
            Thank you for your order.{"We 're"} processing it now.
          </p>
          <p className="text-amber-900 text-center text-sm mb-6">
            Check your email for order details and update
          </p>
          <div className="bg-gray-300 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-900 ">Order number</span>
              <span className="text-sm font-semibold text-amber-900">
                #12345
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900 ">Estimated delivery</span>
              <span className="text-sm font-semibold text-amber-900">
                {" "}
                3-5 business days
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
              Thanks for trusting us!
            </button>
            <HandHeart className="mr-2 text-fuchsia-600" size={18} />
            <Link
              to={"/"}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
