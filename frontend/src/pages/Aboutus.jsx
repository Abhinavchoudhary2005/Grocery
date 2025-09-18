import React from "react";
import { Users, Star, HeartHandshake, Globe } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="bg-base-200 min-h-screen p-8 pt-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary">About Us</h1>
          <p className="text-lg text-gray-600 mt-4">
            Passionate about delivering the best products and services to our
            customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Mission Card */}
          <div className="card bg-white shadow-lg hover:shadow-2xl rounded-xl p-6">
            <div className="flex justify-center mb-4">
              <HeartHandshake className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Our Mission</h3>
            <p className="text-gray-600 text-center">
              To create a seamless and delightful shopping experience by
              offering quality products and services.
            </p>
          </div>

          {/* Vision Card */}
          <div className="card bg-white shadow-lg hover:shadow-2xl rounded-xl p-6">
            <div className="flex justify-center mb-4">
              <Globe className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Our Vision</h3>
            <p className="text-gray-600 text-center">
              To become a trusted global brand known for innovation, integrity,
              and customer satisfaction.
            </p>
          </div>

          {/* Values Card */}
          <div className="card bg-white shadow-lg hover:shadow-2xl rounded-xl p-6">
            <div className="flex justify-center mb-4">
              <Star className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Our Values</h3>
            <p className="text-gray-600 text-center">
              Integrity, innovation, and excellence define who we are and guide
              everything we do.
            </p>
          </div>

          {/* Team Card */}
          <div className="card bg-white shadow-lg hover:shadow-2xl rounded-xl p-6">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-primary-focus" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Our Team</h3>
            <p className="text-gray-600 text-center">
              A passionate and diverse group of professionals dedicated to
              driving meaningful change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
