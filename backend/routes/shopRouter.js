const { Router } = require("express"); 
const shopRouter = Router(); 

const shopController = require("./shopController"); 

shopRouter.get("/api", shopController.showShop); 

// Search route — query param `q` e.g. /search?q=sweater
shopRouter.get("/api/search", shopController.searchProducts);

// End point for managers to restock. 
// shopRouter.get("/restock", shopController.restockGET);
shopRouter.post("/api/restock", shopController.restockPOST);

// End points for user to buy stuff
shopRouter.get("/api/buy", shopController.createTransactionGET); 
shopRouter.post("/api/buy", shopController.createTransactionPOST); 

// shopRouter.get("/api/cart", shopController.viewCart); 
shopRouter.post("/api/cart/add", shopController.addToCart); 
module.exports = shopRouter;