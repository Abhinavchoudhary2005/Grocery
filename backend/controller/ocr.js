const User = require("../modules/user");
const Product = require("../modules/product");

const ocr = async (req, res) => {
  const { detectedItems } = req.body;

  if (!detectedItems || detectedItems.length === 0) {
    return res.status(400).send({ error: "No items detected." });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    let addedProducts = [];

    // Search for each detected item in the database
    for (const item of detectedItems) {
      const product = await Product.findOne({
        name: { $regex: item, $options: "i" },
      });

      if (product) {
        let productExists = false;

        // Check if product already exists in the user's cart
        for (let i = 0; i < user.cart.length; i++) {
          const cartItem = user.cart[i];

          if (
            cartItem.name === product.name &&
            cartItem.category === product.category
          ) {
            // Update product quantity and total price if exists
            user.cart.set(i, {
              ...user.cart[i],
              quantity: user.cart[i].quantity + 1,
              totalPrice: (user.cart[i].quantity + 1) * product.new_price,
            });
            productExists = true;
            break;
          }
        }

        // If product doesn't exist, add it to the cart
        if (!productExists) {
          const newProduct = {
            _id: product._id,
            name: product.name,
            image: product.image,
            old_price: product.old_price,
            new_price: product.new_price,
            category: product.category,
            quantity: 1,
            totalPrice: product.new_price,
          };
          user.cart.push(newProduct);
        }

        addedProducts.push({ name: product.name, quantity: 1 });
      }
    }

    // Recalculate total cart value
    let totalCartValue = user.cart.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    user.set({ totalCartValue });

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
