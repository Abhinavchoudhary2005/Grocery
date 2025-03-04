import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaArrowRight,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold">Nature's Basket</h2>
          <p className="mt-2 text-sm">
            Groco is India's leading online grocery store, delivering fresh
            produce, essentials, and organic products at your doorstep.
          </p>
          <div className="flex justify-center md:justify-start gap-3 mt-4">
            <a
              href="#"
              className="p-2 bg-white text-green-600 rounded-full hover:bg-green-800 hover:text-white"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="p-2 bg-white text-green-600 rounded-full hover:bg-green-800 hover:text-white"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="p-2 bg-white text-green-600 rounded-full hover:bg-green-800 hover:text-white"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="p-2 bg-white text-green-600 rounded-full hover:bg-green-800 hover:text-white"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold">Contact Us</h3>
          <p className="mt-2 flex items-center justify-center md:justify-start gap-2">
            <FaPhoneAlt /> +91 98765 43210
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaPhoneAlt /> +91 87654 32109
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaEnvelope /> support@Nature.in
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaMapMarkerAlt /> Mumbai, India
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center justify-center md:justify-start hover:text-gray-200 cursor-pointer">
              <FaArrowRight className="mr-2" /> Privacy Policy
            </li>
            <li className="flex items-center justify-center md:justify-start hover:text-gray-200 cursor-pointer">
              <FaArrowRight className="mr-2" /> Terms & Conditions
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-semibold">Subscribe for Updates</h3>
          <p className="mt-2 text-sm">
            Get exclusive deals and offers straight to your inbox!
          </p>
          <input
            type="email"
            placeholder="Your email"
            className="mt-2 p-2 w-full border rounded text-black"
          />
          <button className="mt-2 w-full p-2 bg-white text-green-600 rounded hover:bg-green-500 hover:text-white">
            Subscribe
          </button>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center mt-10 border-t pt-6">
        <p>
          Created by{" "}
          <span className="text-yellow-400 font-semibold">Web Wizards</span>{" "}
          with ❤️
        </p>
      </div>
    </footer>
  );
};

export default Footer;
