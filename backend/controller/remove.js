const fs = require("fs");
const path = require("path");
const Product = require("../modules/product");

const deleteImageFile = (imagePath) => {
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(`Failed to delete image file at ${imagePath}:`, err);
    } else {
      console.log(`Image file at ${imagePath} deleted successfully.`);
    }
  });
};

const removeProduct = async (req, res) => {
  const { productId } = req.params;

  const _id = productId;
  try {
    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    const result = await Product.deleteOne({ _id });
    if (result.deletedCount === 0) {
      res.status(404).send({ error: "Product not found" });
    } else {
      // Delete the associated image file
      const imagePath = path.join(__dirname, "../upload/images", product.image);
      deleteImageFile(imagePath);
      res.status(200).send({ message: "Product deleted successfully" });
    }
  } catch (err) {
    res
      .status(500)
      .send({ error: "An error occurred while deleting the product" });
  }
};

module.exports = { removeProduct };
