import React, { useState, useContext } from "react";
import { FiX } from "react-icons/fi";
import { Productcontext } from "../context/Productcontext";
import Card from "./Card";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { allProduct } = useContext(Productcontext);

  const filteredProducts = searchTerm
    ? allProduct.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSearchClick = (product) => {
    setSearchTerm("");
    setIsSearchOpen(false);
    setSelectedProduct(product);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search"
        className="input input-bordered w-72"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsSearchOpen(true);
        }}
      />

      {isSearchOpen && filteredProducts.length > 0 && (
        <div className="absolute left-0 top-12 mt-2 w-72 bg-white shadow-lg rounded-lg z-10">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => handleSearchClick(product)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {product.name}
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="relative bg-gray-200 p-4 rounded-lg shadow-lg w-96 flex justify-center items-center">
            <button
              className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              onClick={() => setSelectedProduct(null)}
            >
              <FiX className="text-gray-600 text-xl" />
            </button>
            <Card key={selectedProduct._id} product={selectedProduct} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
