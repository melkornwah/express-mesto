// app.js — входной файл

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const usersRoute = require("./routes/users");
const cardsRoute = require("./routes/cards");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.use((req, res, next) => {
  req.user = {
    _id: "6060a07b174cdd06f804ac26"
  };

  next();
});

app.use("/", usersRoute, cardsRoute);


app.listen(3000, () => {
  console.log("App is running...");
});
