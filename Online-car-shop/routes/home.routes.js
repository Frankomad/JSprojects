const express = require("express");
const router = express.Router();
const data = require("../data/mydata.js");

router.get("/", function (req, res, next) {
  res.redirect("home/getCategories");
});

router.get("/getCategories", function (req, res, next) {
  res.render("home", {
    title: "Car++",
    categories: data.categories,
    category: undefined,
    home: 1,
    cart: req.session.cart ?? {},
    total: req.session.total ?? 0,
  });
});

router.get("/getProducts/:id([0-9]{1,10})", function (req, res, next) {
  const categoryId = parseInt(req.params.id);
  const category = data.categories.find((cat) => cat.id === categoryId);

  res.render("home", {
    title: "Car++",
    categories: data.categories,
    category: category,
    home: 1,
    cart: req.session.cart ?? {},
    total: req.session.total ?? 0,
  });
});

module.exports = router;
