var express = require('express');
var router = express.Router();
var session = require('express-session');

function getCart(req){
    var cart = req.session.cart;
    if(!cart){
        cart = req.session.cart = [];
    }
    return cart;
}

function getName(id, cart){
    for(var i = 0; i < cart.length; i++){
        if(cart[i].id == id){
            return cart[i].name;
        }
    }
}

router.get('/getAll', function(req, res, next){
    res.render('cart', 
        {title: 'Paper-planes - your travel agency - cart',
        cart: getCart(req)});
});

router.post('/add/:id', function(req, res, next){
    var cart = getCart(req);
    let search = cart.find((p) => p.id === req.params.id);
    if (search === undefined) {
        cart.push({ id: req.params.id, name: getName(req.params.id, cart), col: 1});
    } else {
        search.col += 1;
    }
    res.redirect('/cart/getAll');
});

router.post('/remove/:id', function(req, res, next){
    var cart = getCart(req);
    let search = cart.find((p) => p.id === req.params.id);
    if (search.col == 1) {
        search.col -= 1;
        cart = cart.filter((p) => p.col != 0);
    } else {
        search.col -= 1;
    }
    res.redirect('/cart/getAll');
});

module.exports = router;