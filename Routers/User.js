const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Model
const User = require("../Models/Users");

// Routes

router.get("/", async (req, res) => {
  const data = await User.find().select("-passwordHash");
  if (data.length) {
    res.send(data);
  } else {
    res.send("No Data Is Stored");
  }
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  const data = await User.findById(userId).select("-passwordHash");
  if (data) {
    res.send(data);
  } else {
    res.send("No Data Is Found");
  }
});

router.post("/register", (req, res) => {
  const data = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  data
    .save()
    .then((i) => {
      if (i) {
        res.send({
          msg: "user authenticated",
          email: i.email,
          user: i,
        });
      } else {
        res.send("No Data Is Found");
      }
    })
    .catch((err) => {
      res.status(404).send({ success: false, error: err });
    });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.DBPASSWORD;
  if (!user) {
    res.status(404).send("Email not found");
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign({ userId: user.id, admin: user.isAdmin }, secret, {
      expiresIn: "1d",
    });
    res.send({ msg: "user authenticated", email: user.email, token });
  } else {
    res.send("wrong password");
  }
});

router.get("/count", async (req, res) => {
  const data = await User.countDocuments((count) => count);
  if (data) {
    res.send({ count: data });
  } else {
    res.send("No Data Is Stored");
  }
});

router.delete("/:id", (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(404).send({ success: false, error: "No id" });
  }
  User.findByIdAndRemove(userId)
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

module.exports = router;
