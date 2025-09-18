const Order = require("../modules/order");
const User = require("../modules/user");
const Product = require("../modules/product");

const addToCart = async (req, res) => {
  const {
    _id,
    image,
    name,
    old_price,
    new_price,
    category,
    weight,
    postedByUserId,
  } = req.body;

  if (!_id || !image || !name || !old_price || !new_price) {
    return res.status(400).send({ error: "All product fields are required." });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    let productExists = false;

    for (let i = 0; i < user.cart.length; i++) {
      const item = user.cart[i];

      if (item._id.toString() === _id.toString()) {
        user.cart.set(i, {
          ...user.cart[i],
          quantity: user.cart[i].quantity + 1,
          totalPrice: (user.cart[i].quantity + 1) * new_price,
        });
        productExists = true;
        break;
      }
    }

    if (!productExists) {
      const product = {
        _id,
        image,
        name,
        old_price,
        new_price,
        category,
        weight,
        quantity: 1,
        totalPrice: new_price,
        postedByUserId,
      };

      user.cart.push(product);
    }

    let totalCartValue = user.cart.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    user.set({ totalCartValue });

    const savedUser = await user.save();

    res.status(200).send({
      message: "Item added to cart successfully",
      cart: savedUser.cart,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).send({
      error: "An error occurred while adding the item to cart.",
      details: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res
      .status(200)
      .send({ cart: user.cart, totalCartValue: user.totalCartValue });
  } catch (error) {
    res.status(500).send({
      error: "An error occurred while fetching the cart.",
      details: error.message,
    });
  }
};

const removeProduct = async (req, res) => {
  const { _id } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    // Find the product index in the cart
    const index = user.cart.findIndex(
      (item) => item._id.toString() === _id.toString()
    );

    if (index === -1) {
      return res.status(404).send({ error: "Product not found in cart." });
    }

    const item = user.cart[index];

    // Decrement quantity or remove the product
    if (item.quantity > 1) {
      item.quantity -= 1;
      item.totalPrice = item.quantity * item.new_price;
      user.cart.set(index, item);
    } else {
      user.cart.splice(index, 1);
    }

    // Update total cart value
    const totalCartValue = user.cart.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    user.set({ totalCartValue });

    const savedUser = await user.save();

    res.status(200).send({
      message: "Product successfully updated.",
      cart: savedUser.cart,
      totalCartValue: user.totalCartValue,
    });
  } catch (error) {
    console.error("Remove Product Error:", error);
    res.status(500).send({
      error: "An error occurred while removing the product.",
      details: error.message,
    });
  }
};

const order = async (req, res) => {
  try {
    const { products, shippingDetails } = req.body;
    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products in the order." });
    }

    const userId = req.user._id;
    const sellerOrders = new Map();
    const deliveryChargePerSeller = 30;

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product || !product.available) {
        return res
          .status(404)
          .json({ error: `Product not found: ${item.product}` });
      }

      const sellerId = product.postedByUserId;
      if (!sellerOrders.has(sellerId)) {
        sellerOrders.set(sellerId, { products: [], totalAmount: 0 });
      }

      const sellerOrder = sellerOrders.get(sellerId);
      sellerOrder.products.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        weight: product.quantity,
      });
      sellerOrder.totalAmount += product.new_price * item.quantity;
    }

    const orderResponses = [];
    for (const [sellerId, orderDetails] of sellerOrders.entries()) {
      orderDetails.totalAmount += deliveryChargePerSeller;

      const newOrder = new Order({
        user: userId,
        sellerId: sellerId,
        products: orderDetails.products,
        totalAmount: orderDetails.totalAmount,
        deliveryCharge: deliveryChargePerSeller,
        shippingDetails,
        paymentStatus: "Pending",
        orderStatus: "Processing",
      });

      await newOrder.save();
      orderResponses.push(newOrder);
    }

    return res
      .status(201)
      .json({ message: "Orders placed successfully!", orders: orderResponses });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getorder = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user is populated from middleware

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const emptyCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    user.cart = [];
    user.totalCartValue = 0;

    await user.save();

    res.status(200).send({ message: "Cart emptied successfully.", cart: [] });
  } catch (error) {
    console.error("Empty Cart Error:", error);
    res.status(500).send({
      error: "An error occurred while emptying the cart.",
      details: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeProduct,
  getorder,
  order,
  emptyCart,
};
