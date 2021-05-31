const express = require("express");
const router = express.Router();

// Model
const Category = require("../Models/Categories");

// Routes

router.get("/", async (req, res) => {
  const data = await Category.find();
  if (data.length) {
    res.send(data);
  } else {
    res.send("No Data Is Found");
  }
});

router.get("/:id", async (req, res) => {
  const catId = req.params.id;
  const data = await Category.findById(catId);
  if (data) {
    res.send(data);
  } else {
    res.send("No Data Is Found");
  }
});

router.post("/", (req, res) => {
  const data = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
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

router.delete("/:id", (req, res) => {
  const catId = req.params.id;
  if (!catId) {
    res.status(404).send({ success: false, error: "No id" });
  }
  Category.findByIdAndRemove(catId)
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
  const catId = req.params.id;
  if (!catId) {
    res.status(404).send({ success: false, error: "No id" });
  }
  Category.findByIdAndUpdate(
    catId,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
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

module.exports = router;
