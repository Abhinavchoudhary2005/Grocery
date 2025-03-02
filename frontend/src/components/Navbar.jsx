import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiLogOut,
  FiLogIn,
  FiInfo,
  FiPhoneCall,
  FiPlusCircle,
  FiCamera,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContex.jsx";
import { Productcontext } from "../context/Productcontext";
import logo from "../assets/logo.png";
import * as jwt_decode from "jwt-decode";

// Categories for your navigation
const categories = [
  { name: "Vegetable", image: "🥦" },
  { name: "Fruits", image: "🍎" },
  { name: "Dairy", image: "🧀" },
  { name: "Grains", image: "🌾" },
  { name: "Beverages", image: "🥤" },
];

const Navbar = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false); // For loading state
  const categoryButtonRef = useRef(null);
  const categoryListRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { cart, fetchCart } = useContext(CartContext);
  const { allProduct } = useContext(Productcontext);
  const userRole = token ? jwt_decode.jwtDecode(token).role : null;

  // Handle Category dropdown
  const handleCategoryClick = () => setIsCategoryOpen((prev) => !prev);
  const handleCategorySelect = (category) => {
    navigate(`/category/${category.name.toLowerCase()}`);
    setIsCategoryOpen(false);
    toast.success(`Selected category: ${category.name}`);
  };

  // Handle User menu
  const handleUserMenuClick = () => setIsUserMenuOpen((prev) => !prev);

  // Close dropdowns when clicked outside
  const handleClickOutside = (event) => {
    if (
      categoryButtonRef.current &&
      !categoryButtonRef.current.contains(event.target) &&
      categoryListRef.current &&
      !categoryListRef.current.contains(event.target)
    ) {
      setIsCategoryOpen(false);
    }

    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setIsUserMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Successfully logged out");
    navigate("/Auth");
  };

  // Handle image upload and text detection using Google Vision API
  const handleImageUpload = async (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;

    setLoading(true);
    try {
      fileInput.value = "";
      // Step 1: OCR - Extract text from image
      const ocrResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${
          import.meta.env.VITE_GOOGLE_VISION_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: await fileToBase64(file) },
                features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );

      const ocrData = await ocrResponse.json();
      let detectedText = ocrData.responses?.[0]?.fullTextAnnotation?.text || "";

      if (!detectedText) {
        toast.error("No text detected in image.");
        setLoading(false);
        return;
      }

      console.log("Detected Text:", detectedText);

      // Step 2: Call Backend to Process Text with AI
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/vertex-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detectedText,
            allProductNames: allProduct.map((p) => ({
              name: p.name,
              quantity: p.quantity,
            })),
          }),
        }
      );

      const data = await response.json();
      console.log("AI Extracted Data:", data);

      if (!data) {
        toast.error("Failed to extract product details.");
        setLoading(false);
        return;
      }

      // Handle extracted data (same as before)
      const formattedItems = [];
      const notSoldItems = [];

      data.forEach(([quantity, name, unit]) => {
        const match = allProduct.find((p) =>
          name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (match) {
          formattedItems.push([quantity, match.name, unit || match.quantity]);
        } else {
          notSoldItems.push(name);
        }
      });

      if (formattedItems.length === 0) {
        toast.error("No matching products found in store.");
        setLoading(false);
        return;
      }

      const notSoldItemsText =
        notSoldItems?.length > 0
          ? `\n\nProducts not available:\n${notSoldItems.join(", ")}`
          : "";

      const userConfirmed = window.confirm(
        `Items to be added:\n${formattedItems
          .map(([q, n, u]) => `${q} X ${u} of ${n}`)
          .join("\n")}${notSoldItemsText}\n\nConfirm adding to cart?`
      );

      if (!userConfirmed) {
        toast("Operation cancelled.");
        setLoading(false);
        return;
      }

      console.log(formattedItems);

      const backendResponse = await fetch(
        `${import.meta.env.VITE_API_KEY}/ocr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ detectedItems: formattedItems }),
        }
      );

      if (backendResponse.ok) {
        toast.success("Items added to cart successfully!");
        fetchCart();
      } else {
        toast.error("Failed to add items to cart.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing the image.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data prefix
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <>
      <div className="navbar bg-white shadow-lg px-4 fixed top-0 left-0 w-full z-50">
        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/`)}>
          <a className="text-lg font-bold text-green-600 flex items-center">
            <img
              src={logo}
              alt="Grocery Store Logo"
              className="w-28 h-16 mr-2 transform scale-150"
            />
          </a>
        </div>

        <div
          className="flex-none flex justify-center relative"
          ref={categoryButtonRef}
        >
          <button
            onClick={handleCategoryClick}
            className="btn btn-outline btn-primary gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            Category
          </button>

          {isCategoryOpen && (
            <div
              ref={categoryListRef}
              className="absolute left-0 top-14 mt-2 w-48 bg-white shadow-lg rounded-lg z-10"
            >
              {categories.map((category) => (
                <div
                  key={category.name}
                  onClick={() => handleCategorySelect(category)}
                  className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                >
                  <span className="mr-2">{category.image}</span>
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-none mx-4 hidden sm:block">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-72"
          />
        </div>

        <div className="flex-none">
          <div className="flex items-center gap-4">
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <FiShoppingCart className="text-gray-800 w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-3 -right-2 w-[1.3rem] h-[1.3rem] bg-green-500 flex items-center justify-center rounded-full text-white text-[0.8rem] font-semibold">
                  {cart.length}
                </span>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <div
                className="avatar placeholder cursor-pointer"
                onClick={handleUserMenuClick}
              >
                <div className="bg-green-200 text-green-800 rounded-full w-8 h-8 flex items-center justify-center">
                  <FiUser className="text-green-800 w-6 h-6" />
                </div>
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 mt-2 w-44 bg-white shadow-lg rounded-lg z-10">
                  <div
                    onClick={() => navigate("/orders")}
                    className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <FiPackage className="mr-2 ml-2" /> Orders
                  </div>
                  <div
                    onClick={() => navigate("/profile")}
                    className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <FiUser className="mr-2 ml-2" /> My Profile
                  </div>
                  <div
                    onClick={() => navigate("/contact")}
                    className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <FiPhoneCall className="mr-2 ml-2" /> Contact Us
                  </div>
                  <div
                    onClick={() => navigate("/aboutus")}
                    className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <FiInfo className="mr-2 ml-2" /> About Us
                  </div>
                  {userRole === "SELLER" && (
                    <div
                      onClick={() => navigate("/sell")}
                      className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                    >
                      <FiPlusCircle className="mr-2 ml-2" /> Sell Product
                    </div>
                  )}
                  {userRole === "SELLER" && (
                    <div
                      onClick={() => navigate("/listed-products")}
                      className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                    >
                      <FiPackage className="mr-2 ml-2" /> Listed Products
                    </div>
                  )}
                  {token ? (
                    <div
                      onClick={handleLogout}
                      className="flex items-center p-2 hover:bg-gray-200 cursor-pointer text-red-600"
                    >
                      <FiLogOut className="mr-2 ml-2" /> Logout
                    </div>
                  ) : (
                    <div
                      onClick={() => navigate("/Auth")}
                      className="flex items-center p-2 hover:bg-gray-200 cursor-pointer text-green-600"
                    >
                      <FiLogIn className="mr-2 ml-2" /> Login
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scan or Upload Option */}
            <div className="relative cursor-pointer">
              <label htmlFor="image-upload" className="cursor-pointer">
                <FiCamera className="text-gray-800 w-6 h-6" />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-[4rem]"></div>

      {loading && (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-700 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
};

export default Navbar;
