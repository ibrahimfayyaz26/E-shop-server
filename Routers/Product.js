const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const file_type = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = file_type[file.mimetype];
    const err = new Error("wrong image format");
    if (isValid) {
      err = null;
    }
    cb(err, "public/uploads");
  },
  filename: function (req, file, cb) {
    const extension = file_type[file.mimetype];
    const fileName = file.originalname.split(" ").join();
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

// Model
const Product = require("../Models/Products");
const Category = require("../Models/Categories");

// Routes
router.post("/", upload.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(500).send("wrong category id");
  }

  if (!req.file) {
    res.status(500).send("no image included");
  }

  const fileName = req.file.filename;

  const back = `${req.protocol}://${req.get("host")}/public/uploads/`;

  const data = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${back}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
    category: req.body.category,
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
  const prodId = req.params.id;
  if (!prodId) {
    res.status(404).send({ success: false, error: "No id" });
  }
  Product.findByIdAndRemove(prodId)
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

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(500).send("wrong category id");
  }

  Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      price: req.body.price,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
      category: req.body.category,
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

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const data = await Product.find(filter).populate("category");
  if (data.length) {
    res.send(data);
  } else {
    res.send("No Data Is Stored");
  }
});

router.get("/count", async (req, res) => {
  const data = await Product.countDocuments((count) => count);
  if (data) {
    res.send({ count: data });
  } else {
    res.send("No Data Is Stored");
  }
});

router.get("/isFeatured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const data = await Product.find({ isFeatured: true }).limit(count);
  if (data) {
    res.send(data);
  } else {
    res.send("No Data Is Stored or count is not added");
  }
});

router.get("/:id", async (req, res) => {
  const prodId = req.params.id;
  if (!prodId) {
    res.status(404).send({ success: false, error: "No id" });
  }
  const data = await Product.findById(prodId).populate("category");
  if (data) {
    res.send(data);
  } else {
    res.send("No Data Is Found");
  }
});

router.put("/images/:id", upload.array("images"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(500).send("wrong id");
  }
  const back = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let files = [];
  if (req.files) {
    req.files.map((file) =>
      files.push(`${back}${file.fileName ? file.fileName : file.filename}`)
    );
  }

  Product.findByIdAndUpdate(
    req.params.id,
    {
      images: files,
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
