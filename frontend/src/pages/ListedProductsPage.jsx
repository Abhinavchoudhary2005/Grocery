import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash } from "react-icons/fi";
import { Productcontext } from "../context/Productcontext";
import * as jwt_decode from "jwt-decode";

const ListedProductsPage = () => {
  const navigate = useNavigate();
  const { allProduct, deleteProduct } = useContext(Productcontext); // Use context to access products and delete method
  const token = localStorage.getItem("token");

  // Decode the token to get user data
  const userRole = token ? jwt_decode.jwtDecode(token).role : null;
  const userId = token ? jwt_decode.jwtDecode(token)._id : null; // Get the user ID from the token

  // Redirect if the user is not a seller
  useEffect(() => {
    if (userRole !== "SELLER") {
      toast.error("You are not authorized to view this page.");
      navigate("/"); // Redirect non-sellers
    }
  }, [navigate, userRole]);

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    const isDeleted = await deleteProduct(productId, token);
    if (isDeleted) {
      toast.success("Product deleted successfully");
    } else {
      toast.error("Failed to delete product.");
    }
  };

  // Filter only the products listed by the logged-in seller using the decoded userId
  const filteredProducts = allProduct.filter(
    (product) => product.postedByUserId === userId // Compare with the userId from the token
  );

  return (
    <div className="container mx-auto p-8 h-auto">
      <h1 className="text-3xl font-bold mb-6">My Listed Products</h1>
      {filteredProducts.length > 0 ? (
        <div className="space-y-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p>{product.category}</p>
                <p className="text-gray-500">Price: ₹{product.new_price}</p>
                <p className="text-gray-500">Quantity: {product.quantity}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="btn btn-outline btn-error"
                >
                  <FiTrash className="mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You haven't listed any products yet.</p>
      )}
    </div>
  );
};

export default ListedProductsPage;
