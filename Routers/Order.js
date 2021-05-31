const express = require("express");
const router = express.Router();

// Model
const Order = require("../Models/Orders");
const OrderItem = require("../Models/OrderItems");

// Routes

router.get("/", async (req, res) => {
  const data = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (data.length) {
    res.send(data);
  } else {
    res.send("No Data Is Stored");
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

router.get("/:id", async (req, res) => {
  const data = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  if (data) {
    res.send(data);
  } else {
    res.send("No Data Is Stored");
  }
});

router.post("/", async (req, res) => {
  const ids = Promise.all(
    req.body.orderItems.map(async (orders) => {
      const od = await new OrderItem({
        quantity: orders.quantity,
        product: orders.product,
      });
      const newOd = await od.save();
      return newOd._id;
    })
  );

  const orderItemIds = await ids;

  const total = await Promise.all(
    orderItemIds.map(async (orders) => {
      const or = await OrderItem.findById(orders).populate("product", "price");
      return or.product.price * or.quantity;
    })
  );

  const totalPrice = await total.reduce((a, b) => a + b, 0);

  const data = new Order({
    orderItems: orderItemIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  data
    .save()
    .then((i) => {
      if (i) {
        res.send(i);
      } else {
        res.send("No Data Is Found");
      }
    })
    .catch((err) => {
      res.status(404).send({ success: false, error: err });
    });
});

router.put("/:id", (req, res) => {
  Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  )
    .then((i) => {
      if (i) {
        res.send(i);
      } else {
        res.send("No Data Is Found");
      }
    })
    .catch((err) => {
      res.status(404).send({ success: false, error: err });
    });
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (i) => {
      if (i) {
        await i.orderItems.map(async (item) => {
          await OrderItem.findByIdAndRemove(item);
        });
        return res.send("successfully deleted");
      } else {
        res.send("No Data Is Found");
      }
    })
    .catch((err) => {
      res.status(404).send({ success: false, error: err });
    });
});

router.get("/count", async (req, res) => {
  const data = await Order.countDocuments((count) => count);
  if (data) {
    res.send({ count: data });
  } else {
    res.send("No Data Is Stored");
  }
});

router.get("/totalSales", async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (data) {
    res.send({ totalsales: data.pop().totalsales });
  } else {
    res.send("No Data Is Stored");
  }
});

module.exports = router;
