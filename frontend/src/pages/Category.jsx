import React, { useContext, useEffect, useState } from "react";
import { Productcontext } from "../context/Productcontext";
import Card from "../components/Card";

const Category = ({ category }) => {
  const { allProduct } = useContext(Productcontext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      let products = allProduct.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );

      if (sortOrder === "lowToHigh") {
        products.sort((a, b) => a.new_price - b.new_price);
      }

      if (sortOrder === "highToLow") {
        products.sort((a, b) => b.new_price - a.new_price);
      }

      setFilteredProducts(products);
      setTimeout(function () {
        setIsLoading(false);
      }, 500);
    };

    fetchData();
  }, [allProduct, category, sortOrder]);

  return (
    <div className="p-14 bg-green-50">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h2>

      <div className="mb-4 flex justify-end">
        <select
          className="border border-gray-300 p-2 rounded-md"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="default">Sort by</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product._id} product={product} />
            ))
          ) : (
            <p className="text-gray-600">
              No products available in this category.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Category;
