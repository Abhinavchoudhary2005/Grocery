import React, { useState, useContext, useEffect } from "react";
import { StarIcon, QrCodeIcon } from "lucide-react";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContex";
import { QRCodeCanvas } from "qrcode.react";

const Modal = ({ isOpen, onClose, recipeUrl }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-lg w-80"
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
      >
        <QRCodeCanvas value={recipeUrl} size={128} className="mx-auto" />
        <p className="text-sm text-blue-500 mt-2 underline text-center">
          <a href={recipeUrl} target="_blank" rel="noopener noreferrer">
            View Recipe
          </a>
        </p>
        <button
          onClick={onClose}
          className="mt-3 bg-green-500 text-white p-2 rounded-full w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Card = ({ product }) => {
  const [cartCount, setCartCount] = useState(0);
  const [recipeUrl, setRecipeUrl] = useState("");
  const [showQRCodeModal, setShowQRCodeModal] = useState(false); // Track if modal is open
  const { cart, fetchCart } = useContext(CartContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cartItem = cart.find((item) => item._id === product._id);
    if (cartItem) {
      setCartCount(cartItem.quantity);
    }
  }, [cart, product._id]);

  const handleAddToCart = async () => {
    if (!token) {
      toast.dismiss();
      toast.error("You must be logged in to add items to the cart.");
      return;
    }

    const cartItem = {
      _id: product._id,
      image: product.image,
      name: product.name,
      old_price: product.old_price,
      new_price: product.new_price,
      category: product.category,
      quantity: cartCount + 1,
      weight: product.quantity,
      postedByUserId: product.postedByUserId,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/cart/addtocart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(cartItem),
        }
      );

      const responseData = await res.json();

      if (!res.ok) {
        toast.dismiss();
        toast.error(responseData.error || "Failed to add item to cart.");
        return;
      }

      setCartCount(cartCount + 1);
      fetchCart();
      toast.dismiss();
      toast.success("Item added to cart successfully.");
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while adding the item to cart.");
    }
  };

  const handleDecrement = async () => {
    if (cartCount <= 0) return;

    const cartItem = {
      _id: product._id,
      quantity: cartCount - 1,
    };

    try {
      const endpoint = `${import.meta.env.VITE_API_KEY}/cart/removeProduct`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(cartItem),
      });

      const responseData = await res.json();

      if (!res.ok) {
        toast.dismiss();
        toast.error(responseData.error || "Failed to remove item from cart.");
        return;
      }

      setCartCount(cartCount - 1);
      fetchCart();

      toast.dismiss();
      if (cartCount - 1 === 0) {
        toast.info("Item removed from cart.");
      } else {
        toast.success("Item updated successfully.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while removing the item from cart.");
    }
  };

  const fetchRecipe = async () => {
    if (showQRCodeModal) {
      setShowQRCodeModal(false);
      setRecipeUrl("");
      return;
    }

    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${product.name}`
      );

      const data = await res.json();

      if (data.meals && data.meals.length > 0) {
        setRecipeUrl(data.meals[0].strSource || data.meals[0].strYoutube);
        setShowQRCodeModal(true); // Open the modal
      } else {
        toast.dismiss();
        toast.error(
          "No recipe found using this product as an ingredient. Try searching with a different item."
        );
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to fetch recipe.");
    }
  };

  return (
    <div className="card w-72 bg-white shadow-lg rounded-2xl p-4 hover:shadow-2xl transition-shadow duration-300">
      <figure className="flex justify-center">
        <img
          src={
            product.image.startsWith("http")
              ? product.image
              : `${import.meta.env.VITE_API_KEY}/images/${product.image}`
          }
          alt={product.name}
          className="h-40 w-40 object-cover rounded-lg"
        />
      </figure>
      <div className="text-center mt-4">
        <h2 className="text-xl font-bold text-green-700">{product.name}</h2>
        <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>

        <div className="flex justify-center items-center gap-2 my-2">
          <span className="text-lg font-bold text-green-700">
            ₹{product.new_price}
          </span>
          {product.old_price && (
            <span className="text-sm line-through text-red-500">
              ₹{product.old_price}
            </span>
          )}
        </div>

        <div className="flex justify-center items-center text-yellow-500 gap-1 mb-3">
          {[...Array(5)].map((_, index) => (
            <StarIcon key={index} size={16} fill="currentColor" />
          ))}
          <span className="text-sm text-gray-500">(22 Reviews)</span>
        </div>

        <div className="flex justify-center items-center text-yellow-500 gap-1 mb-3">
          Posted By:
          <span className="text-sm text-gray-500">{product.postedBy}</span>
        </div>

        <div className="flex justify-center items-center text-yellow-500 gap-1 mb-3">
          Posted On:
          <span className="text-sm text-gray-500">
            {new Date(product.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {cartCount === 0 ? (
          <button
            className="btn btn-success w-full mt-2"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              className="btn btn-outline btn-success"
              onClick={handleDecrement}
            >
              -
            </button>
            <span className="text-lg font-bold text-green-500">
              {cartCount}
            </span>
            <button
              className="btn btn-outline btn-success"
              onClick={handleAddToCart}
            >
              +
            </button>
          </div>
        )}

        <div className="flex justify-center items-center gap-2 mt-3">
          <button
            className="btn btn-outline btn-info flex items-center gap-2"
            onClick={fetchRecipe}
          >
            <QrCodeIcon size={16} />
            {showQRCodeModal ? "Close QR Code" : "Get Recipe"}
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        recipeUrl={recipeUrl}
      />
    </div>
  );
};

export default Card;
