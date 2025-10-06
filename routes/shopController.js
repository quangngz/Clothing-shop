const db = require("../db/queries");
const path = require("path");

// Show shop page (renders EJS with products)
exports.showShop = async (req, res, next) => {
    try {
        const products = await db.getAllProduct();
        // render EJS if you have view engine configured, otherwise send JSON
        // The project currently stores EJS in view/shop.ejs; render with products
        return res.status(200).render("shop", {products: products});
    } catch (err) {
        next(err);
    }
};

/* Display products as JSON (alternate handler) */
exports.showProduct = async (req, res, next) => {
    try {
        const products = await db.getAllProduct();
        if (products && products.length > 0) {
            return res.status(200).json(products);
        }
        return res.status(200).send("No products found...");
    } catch (err) {
        next(err);
    }
};

exports.createTransactionGET = async (req, res, next) => {
    return res.sendFile(path.join(__dirname, "../view/buy.ejs"));
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

exports.restockGET = async (req, res, next) => {
    res.render("restock");
};

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
        res.status(200).render("shop", {products: results, query: q || "" });
    } catch (err) {
        next(err);
    }
};