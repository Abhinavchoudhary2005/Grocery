import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContex.jsx";
import BeatLoader from "react-spinners/BeatLoader.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, totalCartValue, triggerCartChange } =
    useContext(CartContext);
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [localCart, setLocalCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const deliveryChargePerSeller = 30;

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        toast.error("Error fetching cart!");
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [fetchCart]);

  useEffect(() => {
    setLocalCart(cart);
    setSubtotal(totalCartValue);
  }, [cart, totalCartValue]);

  const calculateTotalDeliveryCharge = () => {
    const sellers = new Set(localCart.map((item) => item.postedByUserId));
    return sellers.size * deliveryChargePerSeller;
  };

  const totalDeliveryCharge = calculateTotalDeliveryCharge();

  const handleUpdateCart = async (item, newQuantity) => {
    const updatedItem = { ...item, quantity: newQuantity };
    const updatedCart = localCart.map((cartItem) =>
      cartItem._id === item._id ? updatedItem : cartItem
    );
    setLocalCart(updatedCart);

    try {
      let endpoint =
        newQuantity < item.quantity
          ? `${import.meta.env.VITE_API_KEY}/cart/removeProduct`
          : `${import.meta.env.VITE_API_KEY}/cart/addtocart`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(updatedItem),
      });

      const responseData = await res.json();
      if (!res.ok) {
        toast.error(responseData.error || "Failed to update cart.");
        setLocalCart(cart);
        return;
      }
      triggerCartChange();
    } catch (error) {
      toast.error(
        error.message || "An error occurred while updating the cart."
      );
      setLocalCart(cart);
    }
  };

  const handleEmptyCart = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/cart/empty`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!res.ok) {
        toast.error("Failed to empty cart.");
        return;
      }

      setLocalCart([]);
      triggerCartChange();
      toast.success("Cart emptied successfully!");
    } catch (error) {
      toast.error("Error emptying cart.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BeatLoader color="#53d8d8" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-black">
          <h1 className="text-2xl font-semibold mb-4">
            Please login to create a Cart
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      {localCart.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <h1 className="text-2xl text-black text-center">
            Cart is empty <br /> Add items to Cart
          </h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Selected Items
            </h2>
            <div className="space-y-4">
              {localCart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={
                        item.image.startsWith("http")
                          ? item.image
                          : `${import.meta.env.VITE_API_KEY}/images/${
                              item.image
                            }`
                      }
                      alt={item.name}
                      className="w-16 h-16 object-cover mr-4 rounded"
                    />

                    <div>
                      <h3 className="text-lg font-medium text-green-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.weight}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-semibold text-green-700">
                      ₹{item.new_price.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        className="bg-gray-200 p-2 rounded-full"
                        onClick={() =>
                          handleUpdateCart(item, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="text-lg font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="bg-gray-200 p-2 rounded-full"
                        onClick={() =>
                          handleUpdateCart(item, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white shadow-md rounded-lg h-auto lg:mt-14 sm:mt-0">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)} </span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Delivery charge</span>
                <span>₹{totalDeliveryCharge.toFixed(2)} </span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Total</span>
                <span>₹{(subtotal + totalDeliveryCharge).toFixed(2)} </span>
              </div>
            </div>

            <button
              className="bg-green-600 text-white w-full py-3 mt-4 rounded-lg hover:bg-green-700"
              onClick={() => navigate("/checkout")}
            >
              Proceed To Checkout
            </button>
            <button
              className="bg-red-600 text-white w-full py-3 mt-4 rounded-lg hover:bg-red-700"
              onClick={handleEmptyCart}
            >
              Empty Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
