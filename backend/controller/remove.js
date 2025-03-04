const cloudinary = require("cloudinary").v2;
const Product = require("../modules/product");

// Configure Cloudinary (ensure these env variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Delete the product from the database
    const result = await Product.deleteOne({ _id: productId });
    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Product not found" });
    }

    // If product image is from Cloudinary, delete it
    if (product.cloudinary) {
      const imageUrl = product.image;
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(`grocery_products/${publicId}`);
      console.log(`Cloudinary image ${publicId} deleted successfully.`);
    }

    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res
      .status(500)
      .send({ error: "An error occurred while deleting the product" });
  }
};

module.exports = { removeProduct };
