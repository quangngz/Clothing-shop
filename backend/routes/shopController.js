const db = require("../db/queries");
const path = require("path");
const passport = require("../db/passport"); 

// ShowShop sends the file to frontend. 
exports.showShop = async (req, res, next) => {
    try {
        const products = await db.getAllProduct();
        return res.status(200).json({ products });
    } catch (err) {
        next(err);
    }
};

// exports.createTransactionGET = async (req, res, next) => {
//     // return res.sendFile(path.join(__dirname, "../view/buy.ejs"));
// };

// exports.createTransactionPOST = async (req, res, next) => {
//     const { customerID, items } = req.body;
//     if (!customerID || !Array.isArray(items) || items.length === 0) {
//         return res.status(400).send("Invalid transaction input!");
//     }
//     try {
//         await db.createNewTransaction(customerID, items);
//         return res.send("Transaction success!");
//     } catch (err) {
//         next(err);
//     }
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
        return res.status(200).json(results); 
    } catch (err) {
        next(err);
    }
};


exports.addToCart = async (req, res) => {
    try {
        console.log("req.body: ", req.body); 
        const { product } = req.body;
        await db.addProductToTransaction(req.user.customerid, product); 
        res.json({
        success: true, message: "Product added to cart", 
        itemAdded: product.productid});
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.viewCart = async (req, res) => {
    const products = await db.getAllTransaction(req.user.customerid); // return an array

    if (products.length === 0) {
        return res.status(200).json({products: []}); 
    }

    res.status(200).json({ products });
};

exports.addUser = async (req, res, next) => {
    await db.addUser(req, res, next); 
}

exports.logIn = async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
        }

        req.logIn(user, (err) => {
        if (err) return next(err);

        return res.json({ user: { customerID: user.customerID, username: user.username } });
        });
    })(req, res, next);
};

exports.getSession = async (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.json({ user: { customerID: req.user.customerID, username: req.user.username } });
    } else {
        return res.json({user: null}); 
    }
}