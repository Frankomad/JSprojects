var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    user: '',
    cart: [],
    resave: false,
    saveUninitialized: true,  /*false ako imamo login system */
    secret: 'secret'
}));

app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended: true}));

var homeRouter = require('./routes/home.routes');
var cartRouter = require('./routes/cart.routes'); 

app.use('/home', homeRouter);
app.use('/cart', cartRouter);

app.get('/', function(req, res, next){
    res.redirect('/home/getCategories');
})

app.listen(3000);