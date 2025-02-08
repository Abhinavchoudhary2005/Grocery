const Product = require("../modules/product");

const uploadProduct = async (req, res) => {
  try {
    const { name, category, new_price, old_price, quantity } = req.body;
    const image = req.file.filename;

    const newProduct = new Product({
      name,
      category,
      new_price,
      old_price,
      image,
      quantity,
      postedBy: req.user.name,
      postedByUserId: req.user._id,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ success: true, message: "Product uploaded successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error uploading product: ${error.message}`,
    });
  }
};

module.exports = { uploadProduct };
