import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast("Please login to view your orders.", { icon: "⚠️" });
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/cart/getorder`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Order ID: {order._id}
              </h2>
              <p className="text-gray-600 mb-2">
                Order Date:{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-600 mb-2 font-semibold">
                Total Amount: ₹{order.totalAmount.toFixed(2)}
              </p>
              <h3 className="font-medium mt-4">Products:</h3>
              <ul className="list-disc ml-6">
                {order.products.map((productItem) => (
                  <li
                    key={productItem.productId || Math.random()}
                    className="text-gray-600"
                  >
                    {productItem.productId
                      ? `${productItem.weight} of ${productItem.productName} x ${productItem.quantity}`
                      : "Product information not available"}
                  </li>
                ))}
              </ul>
              <h3 className="font-medium mt-4">Shipping Details:</h3>
              <p className="text-gray-600">
                {order.shippingDetails?.name || "N/A"},{" "}
                {order.shippingDetails?.address || "N/A"},{" "}
                {order.shippingDetails?.city || "N/A"}, Pincode:{" "}
                {order.shippingDetails?.pincode || "N/A"}, Contact:{" "}
                {order.shippingDetails?.phone || "N/A"}
              </p>
              <h3 className="font-medium mt-4">Order Status:</h3>
              <p className="text-gray-600">{order.orderStatus}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
