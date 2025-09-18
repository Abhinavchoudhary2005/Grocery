import React, { useEffect, useState } from "react";
import {
  FaTruck,
  FaLeaf,
  FaCarrot,
  FaCreditCard,
  FaStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero_customer.png";

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Vegetable", image: "🥦" },
    { name: "Fruits", image: "🍎" },
    { name: "Dairy", image: "🧀" },
    { name: "Grains", image: "🌾" },
    { name: "Bakery", image: "🥐" },
  ];

  const testimonials = [
    {
      name: "Rohan Sharma",
      role: "Happy Customer",
      review: "Excellent service! Fresh and organic produce every time.",
      image: "https://randomuser.me/api/portraits/men/51.jpg",
    },
    {
      name: "Priya Verma",
      role: "Happy Customer",
      review: "The best quality fruits and vegetables. Highly recommend!",
      image: "https://randomuser.me/api/portraits/women/52.jpg",
    },
    {
      name: "Amit Patel",
      role: "Happy Customer",
      review: "Fast delivery and very reasonable prices. Super impressed!",
      image: "https://randomuser.me/api/portraits/men/53.jpg",
    },
    {
      name: "Neha Iyer",
      role: "Happy Customer",
      review:
        "Great experience shopping here. The quality is always top-notch!",
      image: "https://randomuser.me/api/portraits/women/54.jpg",
    },
    {
      name: "Kunal Mehta",
      role: "Happy Customer",
      review: "Amazing variety and super fresh! Loved it!",
      image: "https://randomuser.me/api/portraits/men/55.jpg",
    },
    {
      name: "Ananya Kapoor",
      role: "Happy Customer",
      review: "A hassle-free shopping experience with top-quality groceries.",
      image: "https://randomuser.me/api/portraits/women/56.jpg",
    },
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = left, -1 = right

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev + 3 >= testimonials.length && direction === 1) {
          setDirection(-1);
          return prev - 1;
        } else if (prev <= 0 && direction === -1) {
          setDirection(1);
          return prev + 1;
        }
        return prev + direction;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-100 to-white p-14">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8">
          {/* Left Content */}
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Discover the Joy of Eating{" "}
              <span className="text-green-600">Fresh and Healthy</span>{" "}
              <FaLeaf className="inline-block text-green-600" />
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Experience the goodness of nature with our top-quality groceries,
              handpicked and delivered to your doorstep with care.
            </p>
            <button className="mt-6 btn btn-success text-white font-semibold rounded-lg px-6 py-3 shadow-md hover:shadow-lg transition-all">
              Shop Now
            </button>
          </div>

          {/* Right Content */}
          <div className="relative lg:w-1/2 flex justify-center">
            <img
              src={heroImage}
              alt="Grocery Bag"
              className="w-full max-w-sm rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-black">Our Features</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center py-6">
            <FaCarrot className="text-green-500 text-6xl mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Fresh And Organic
            </h3>
            <p className="text-gray-600">
              We provide fresh, organic, and high-quality produce directly
              sourced from trusted farmers.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center py-6">
            <FaTruck className="text-green-500 text-6xl mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Free Delivery
            </h3>
            <p className="text-gray-600">
              Enjoy free delivery for all your orders with guaranteed on-time
              service.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center py-6">
            <FaCreditCard className="text-green-500 text-6xl mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Easy Payment
            </h3>
            <p className="text-gray-600">
              Make secure and quick payments using multiple payment options
              available.
            </p>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="py-12 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-black">Popular Categories</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6 px-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-gray-100 rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer hover:bg-green-100 transition-all"
              onClick={() =>
                navigate(`/category/${category.name.toLowerCase()}`)
              }
            >
              <div className="text-6xl">{category.image}</div>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-12 bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-black">What People Say</h2>
        </div>
        <div className="max-w-6xl mx-auto overflow-hidden relative px-4">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * (100 / 3)}%)` }}
          >
            {[...testimonials, ...testimonials].map((testimonial, i) => (
              <div
                key={i}
                className="w-1/3 flex-shrink-0 bg-white shadow-lg rounded-lg p-6 mx-2"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mt-4">{testimonial.review}</p>
                <div className="flex mt-4 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
