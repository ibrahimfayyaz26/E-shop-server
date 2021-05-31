const mongoose = require("mongoose");

const OrderItem = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

OrderItem.virtual("id").get(function () {
  return this._id.toHexString();
});

OrderItem.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("OrderItem", OrderItem);
