const db = require("../db/queries");
const path = require("path");

// ShowShop sends the file to frontend. 
exports.showShop = async (req, res, next) => {
    try {
        const products = await db.getAllProduct();
        return res.status(200).json({ products });
    } catch (err) {
        next(err);
    }
};

exports.createTransactionGET = async (req, res, next) => {
    // return res.sendFile(path.join(__dirname, "../view/buy.ejs"));
};

exports.createTransactionPOST = async (req, res, next) => {
    const { customerID, items } = req.body;
    if (!customerID || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send("Invalid transaction input!");
    }
    try {
        await db.createNewTransaction(customerID, items);
        return res.send("Transaction success!");
    } catch (err) {
        next(err);
    }
};
// TODO: Links to react app
// exports.restockGET = async (req, res, next) => {
//     res.render("restock");
// };

exports.restockPOST = async (req, res, next) => {
    console.log(`Restock request body: ${JSON.stringify(req.body)}`);
    const product = req.body;

    if (!product.name || !product.stock) {
        return res.status(400).send("Invalid restock input!");
    }
    try {
        await db.addProduct(product);
        return res.send("Restock Success!");
    } catch (err) {
        next(err);
    }
};

// Search handler: GET /search?q=term
exports.searchProducts = async (req, res, next) => {
    const q = req.query.q;
    if (!q || q.trim() === "") {
        return res.status(400).send("Query parameter 'q' is required");
    }
    try {
        const results = await db.searchProducts(q);
        // res.status(200).render("shop", {products: results, query: q || "" });
    } catch (err) {
        next(err);
    }
};


// LOGIC of cart: Items will be stored per session, via items id. 
// Only when the user make the transaction, will the items with those id be deducted in stock.
// add to cart
exports.addToCart = async (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    console.log(req.body); 
    const { productId } = req.body;
    req.session.cart.push(productId); 

    res.json({ success: true, cartCount: req.session.cart.length });
};

// view cart
exports.viewCart = async (req, res) => {
    const cartIDs = req.session.cart || []; 

    // if (cartIDs.length === 0) {
    //     return res.render("cart", { cart: [] }); 
    // }

    // fetch full product details using IDs from req.session.cart
    const products = await db.getProductListByID(cartIDs)
    res.render("cart", { cart: products });
};