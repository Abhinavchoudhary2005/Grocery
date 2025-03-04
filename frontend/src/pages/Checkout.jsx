import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContex.jsx";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cart, totalCartValue, triggerCartChange } = useContext(CartContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [subtotal, setSubtotal] = useState(totalCartValue);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const deliveryChargePerSeller = 30;
  const uniqueSellers = new Set(cart.map((item) => item.postedByUserId));
  const totalDeliveryCharge = uniqueSellers.size * deliveryChargePerSeller;

  useEffect(() => {
    if (!token) {
      toast.warn("Please login to proceed with checkout.");
      navigate("/login");
    }
    setSubtotal(totalCartValue);
  }, [token, totalCartValue, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (
      !shippingInfo.name ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.pincode ||
      !shippingInfo.phone
    ) {
      toast.error("Please fill out all the shipping details.");
      return;
    }

    const products = cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const userId = JSON.parse(atob(token.split(".")[1])).id; // Extract user ID from JWT

    const orderDetails = {
      user: userId,
      products,
      shippingDetails: shippingInfo,
      deliveryCharge: totalDeliveryCharge,
      totalAmount: subtotal + totalDeliveryCharge,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/cart/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(orderDetails),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place the order.");
      }

      toast.success("Order placed successfully!");
      triggerCartChange();
      navigate("/orders");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={shippingInfo.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={shippingInfo.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={shippingInfo.pincode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Delivery Charge</span>
              <span>₹{totalDeliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Total</span>
              <span>₹{(subtotal + totalDeliveryCharge).toFixed(2)}</span>
            </div>
          </div>
          <button
            className="bg-green-600 text-white w-full py-3 mt-4 rounded-lg hover:bg-green-700"
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
