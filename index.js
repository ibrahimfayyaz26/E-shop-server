const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const auth = require("./helpers/auth");
const errorHandler = require("./helpers/errorHandler");

require("dotenv").config();

// Routers
const Product = require("./Routers/Product");
const Category = require("./Routers/Category");
const User = require("./Routers/User");
const Order = require("./Routers/Order");

//ENV
const admin = process.env.ADMIN;
const dbName = process.env.DBNAME;
const password = process.env.DBPASSWORD;
const api = process.env.API;

// Midelware
app.use(auth());
app.use(cors());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.options("*", cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(errorHandler);

app.use(`${api}/Product`, Product);
app.use(`${api}/Category`, Category);
app.use(`${api}/User`, User);
app.use(`${api}/Order`, Order);

//DB api
app.get("/", (req, res) => {
  res.send({
    res: "E-shop database",
    api: "/api/names",
    names: "Product , Category , User , Order , OrderItem",
  });
});

mongoose
  .connect(
    `mongodb+srv://${admin}:${password}@cluster0.ygkde.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("working");
  })
  .catch((err) => console.log(err));

var server = app.listen(process.env.PORT || 3000, () => {
  var port = server.address().port;
  console.log(`server on port ${port}`);
});
