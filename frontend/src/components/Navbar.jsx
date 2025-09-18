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
  FiInbox,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContex.jsx";
import logo from "../assets/logo.png";
import * as jwt_decode from "jwt-decode";
import SearchBar from "./SearchBar.jsx";
import OCR from "./OCR.jsx";

// Categories for your navigation
const categories = [
  { name: "Vegetable", image: "🥦" },
  { name: "Fruits", image: "🍎" },
  { name: "Dairy", image: "🧀" },
  { name: "Grains", image: "🌾" },
  { name: "Bakery", image: "🥐" },
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
            <span className="hidden sm:inline">Category</span>
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
          <SearchBar />
        </div>

        <div className="flex-none ml-3">
          <div className="flex items-center gap-4">
            {/* Scan or Upload Option */}
            <OCR />

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
                    <>
                      <div
                        onClick={() => navigate("/sell")}
                        className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        <FiPlusCircle className="mr-2 ml-2" /> Sell Product
                      </div>
                      <div
                        onClick={() => navigate("/listed-products")}
                        className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        <FiPackage className="mr-2 ml-2" /> Listed Products
                      </div>
                      <div
                        onClick={() => navigate("/recivedOrders")}
                        className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        <FiInbox className="mr-2 ml-2" /> Received Orders
                      </div>
                    </>
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
