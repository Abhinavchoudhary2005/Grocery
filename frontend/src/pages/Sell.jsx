import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Productcontext } from "../context/Productcontext";

// Define categories for selection
const categories = ["Vegetable", "Fruits", "Dairy", "Grains", "Bakery"];

const units = ["kg", "g", "liter", "ml"];

const SellPage = () => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [normalPrice, setNormalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantityValue, setQuantityValue] = useState("0");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const { fetchProducts } = useContext(Productcontext);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Handle image file selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    const quantity = `${quantityValue} ${quantityUnit}`;

    // Validate form fields
    if (
      !productName ||
      !category ||
      !normalPrice ||
      !discountedPrice ||
      !quantity ||
      !quantityValue ||
      !quantityUnit ||
      !image
    ) {
      toast.error("Please fill in all the fields.");
      setLoading(false);
      return;
    }

    if (normalPrice <= 0 || discountedPrice <= 0) {
      toast.error("Price cannot be negative or zero");
      setLoading(false);
      return;
    }

    if (quantityValue <= 0) {
      toast.error("Quantity cannot be negative or zero");
      setLoading(false);
      return;
    }

    // Prepare the data to be sent in FormData
    const productData = new FormData();
    productData.append("name", productName); // Match with backend field names
    productData.append("category", category);
    productData.append("old_price", normalPrice); // Match with backend field names
    productData.append("new_price", discountedPrice); // Match with backend field names
    productData.append("quantity", quantity);
    productData.append("image", image);

    // Make the API call to upload the product
    fetch(`${import.meta.env.VITE_API_KEY}/admin/upload/product`, {
      method: "POST",
      body: productData,
      headers: {
        Authorization: `${token}`,
      },
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          // If the response isn't JSON, return the raw text error
          if (!contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            throw new Error(errorText || "Unknown error");
          }
        }
      })
      .then((data) => {
        toast.success("Product listed successfully!");
        fetchProducts();
        navigate("/listed-products");
      })
      .catch((error) => {
        toast.error(`Failed: ${error.message}`);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Sell Your Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter product name"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Old Price (Normal Price) */}
        <div>
          <label
            htmlFor="old_price"
            className="block text-sm font-semibold text-gray-700"
          >
            Normal Price (Old Price)
          </label>
          <input
            type="number"
            id="old_price"
            value={normalPrice}
            onChange={(e) => setNormalPrice(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter normal price"
          />
        </div>

        {/* New Price (Discounted Price) */}
        <div>
          <label
            htmlFor="new_price"
            className="block text-sm font-semibold text-gray-700"
          >
            Discounted Price (New Price)
          </label>
          <input
            type="number"
            id="new_price"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter discounted price"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold">Quantity</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter quantity"
            />
            <select
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="select select-bordered"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-semibold text-gray-700"
          >
            Upload Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "List Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellPage;
