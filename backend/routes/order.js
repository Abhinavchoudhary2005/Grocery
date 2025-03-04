const express = require("express");
const { ReceivedOrders, updateStatus } = require("../controller/order");

const router = express.Router();

router.route("/recivedOrders").get(ReceivedOrders);
router.route("/updateStatus").put(updateStatus);

module.exports = router;
