import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-8">
      <h1 className="text-5xl font-bold text-center text-green-700 mb-12">
        Contact Us
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-green-600">
            Get in Touch
          </h2>
          <p className="text-gray-700 mb-4">
            Feel free to contact us for any queries or support. We would love to
            hear from you!
          </p>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <FaPhone className="text-3xl text-green-500" />
              <span className="text-lg text-gray-600">+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-3xl text-green-500" />
              <span className="text-lg text-gray-600">info@company.com</span>
            </div>
            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-3xl text-green-500" />
              <span className="text-lg text-gray-600">
                123, Tech Street, Bangalore, India
              </span>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-green-600">
            Send Us a Message
          </h2>
          <form>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered w-full focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                placeholder="Write your message here"
                className="textarea textarea-bordered w-full focus:border-green-500 focus:ring-green-500"
                rows="5"
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn bg-green-600 hover:bg-green-700 text-white w-full"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
