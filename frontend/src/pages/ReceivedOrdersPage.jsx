import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as jwt_decode from "jwt-decode";

const ReceivedOrdersPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);

  // Decode token to get seller ID and role
  const userRole = token ? jwt_decode.jwtDecode(token).role : null;

  useEffect(() => {
    if (userRole !== "SELLER") {
      toast.error("You are not authorized to view this page.");
      navigate("/");
    } else {
      fetchOrders();
    }
  }, [navigate, userRole]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/orders/recivedOrders`,
        {
          headers: { Authorization: `${token}` },
          method: "GET",
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data.orders);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/orders/updateStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ orderId, status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("Failed to update status");
      toast.success("Order status updated");
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Received Orders</h1>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">Order Id: {order._id}</h2>
              <p className="text-gray-500 font-bold">
                Total: ₹{order.totalAmount}
              </p>
              <p className="text-gray-500 font-bold">
                Status: {order.orderStatus}
              </p>
              <p className="text-gray-500 font-bold">
                Customer: {order.shippingDetails.name}
              </p>
              <p className="text-gray-500 font-bold">
                Phone: {order.shippingDetails.phone}
              </p>
              <p className="text-gray-500 font-bold">
                Address: {order.shippingDetails.address},{" "}
                {order.shippingDetails.city}, {order.shippingDetails.pincode}
              </p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Products:</h3>
                <ul className="list-disc list-inside">
                  {order.products.map(
                    ({ productName, quantity, weight }, index) => (
                      <li key={index} className="text-gray-500">
                        {weight} of {productName} X {quantity}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="mt-2">
                <select
                  className="border p-2 rounded"
                  value={order.orderStatus}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No received orders yet.</p>
      )}
    </div>
  );
};

export default ReceivedOrdersPage;
