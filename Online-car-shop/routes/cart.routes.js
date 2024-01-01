const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.redirect("cart/getAll");
});

router.get("/getAll", function (req, res, next) {
  console.log(req.session.cart);
  res.render("cart", {
    title: "Cart-Car++",
    category: undefined,
    home: 0,
    cart: req.session.cart ?? {},
    total: req.session.total ?? 0,
  });
});

router.post("/add/:id([0-9]{1,10})", function (req, res) {
  const id = parseInt(req.params.id);
  const { name, quantity } = req.body;
  const product = { id, name, quantity: parseInt(quantity) };
  if (req.session.cart) {
    if (!req.session.cart[id]) {
      req.session.cart[id] = product;
    } else {
      const value = req.session.cart[id];
      value.quantity++;
      req.session.cart[id] = value;
    }
  } else {
    req.session.cart = { [id]: product };
  }

  req.session.total = calculateTotal(req.session.cart);
  res.sendStatus(204);
});

router.post("/remove/:id([0-9]{1,10})", function (req, res, next) {
  const id = parseInt(req.params.id);
  const product = req.session.cart[id] ?? {};

  if (product.quantity > 1) {
    const value = req.session.cart[id];
    value.quantity--;
    req.session.cart[id] = value;
  } else {
    delete req.session.cart[id];
  }

  req.session.total = calculateTotal(req.session.cart);
  res.sendStatus(204);
});

function calculateTotal(cart) {
  return Object.values(cart).reduce((acc, value) => (acc += value.quantity), 0);
}

module.exports = router;
