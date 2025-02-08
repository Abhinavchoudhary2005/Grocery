const Product = require("../modules/product");

const displayProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (err) {
    res.send("server error...");
  }
};

module.exports = { displayProduct };
