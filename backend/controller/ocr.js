const User = require("../modules/user");
const Product = require("../modules/product");

const ocr = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res
      .status(401)
      .send({ error: "Unauthorized: User not authenticated" });
  }

  const { detectedItems } = req.body;

  if (
    !detectedItems ||
    !Array.isArray(detectedItems) ||
    detectedItems.length === 0
  ) {
    return res.status(400).send({ error: "No items detected." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    let addedProducts = [];

    for (const item of detectedItems) {
      const [quantity, name, unit] = item;
      const parsedQuantity = parseFloat(quantity);

      if (isNaN(parsedQuantity) || parsedQuantity <= 0) continue;

      // Find all products matching the name (case-insensitive)
      const products = await Product.find({
        name: { $regex: `^${name}$`, $options: "i" },
      });

      if (products.length > 0) {
        // Select the product with the lowest price
        const product = products.reduce((prev, curr) =>
          prev.new_price < curr.new_price ? prev : curr
        );

        let productExists = false;

        for (let i = 0; i < user.cart.length; i++) {
          const cartItem = user.cart[i];

          if (cartItem.name.toLowerCase() === product.name.toLowerCase()) {
            user.cart.set(i, {
              ...cartItem,
              quantity: cartItem.quantity + parsedQuantity,
              totalPrice:
                (cartItem.quantity + parsedQuantity) * product.new_price,
            });
            productExists = true;
            break;
          }
        }

        if (!productExists) {
          user.cart.push({
            _id: product._id,
            name: product.name,
            image: product.image,
            old_price: product.old_price,
            new_price: product.new_price,
            category: product.category,
            weight: product.quantity,
            quantity: parsedQuantity,
            totalPrice: parsedQuantity * product.new_price,
          });
        }

        addedProducts.push({
          name: product.name,
          quantity: parsedQuantity,
          unit,
        });
      }
    }

    user.totalCartValue = user.cart.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
    const savedUser = await user.save();

    res.status(200).send({
      message: "Items added to cart successfully",
      cart: savedUser.cart,
      addedProducts,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).send({
      error: "An error occurred while adding the items to cart.",
      details: error.message,
    });
  }
};

module.exports = { ocr };
