const db = require("../db/queries"); 
const path = require("path"); 

async function showShop(res, req, next) {
    res.sendFile(path.join(__dirname, "../view/shop.ejs")); 
}

async function showProduct(res, req, next) {
    console.log("transaction created!"); 
    
    const products = db.getAllProduct(); 
    if (products) {
        res.status(200).send(products); 
    } else {
        res.status(200).send("No products found..."); 
    }
}

async function createTransaction(res, req, next) {
    const { customerID, items } = req.body; 
    if (!customerID || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send("Invalid transaction input!"); 
    }
    
    db.createNewTransaction(customerID, items); 
    res.send("Transaction success!"); 
}

async function restock(res, req, next) {
    console.log(`Item ${req.params} is being added to stock...`); 
    const { product } = req.body; 

    if (!product) {
        return res.status(400).send("Invalid restock input!"); 
    }
    db.addProduct(product); 
    res.send("Restock Success!"); 
}

module.exports = {
    showShop, restock, createTransaction, showProduct
}