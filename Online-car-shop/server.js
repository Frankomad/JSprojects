const express = require("express");
const app = express(); //imam
const path = require("path"); //imam
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, "public")));

const homeRouter = require("./routes/home.routes");
const cartRouter = require("./routes/cart.routes");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "anything",
    saveUninitialized: true,
    resave: false,
  })
);

app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/home", homeRouter);
app.use("/cart", cartRouter);

app.listen(3000);
