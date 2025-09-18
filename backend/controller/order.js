const Order = require("../modules/order");

const ReceivedOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch received orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};

module.exports = { ReceivedOrders, updateStatus };
