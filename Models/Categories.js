const mongoose = require("mongoose");

const Category = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
});

Category.virtual("id").get(function () {
  return this._id.toHexString();
});

Category.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Category", Category);
