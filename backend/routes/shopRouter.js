const { Router } = require("express"); 
const shopRouter = Router(); 
const shopController = require("./shopController"); 


shopRouter.get("/", shopController.showShop); 

// Search route — query param `q` e.g. /search?q=sweater
shopRouter.get("/search", shopController.searchProducts);

// End point for managers to restock. 
// shopRouter.get("/restock", shopController.restockGET);
shopRouter.post("/restock", shopController.restockPOST);

// End points for user to buy stuff
// shopRouter.get("/buy", shopController.createTransactionGET); 
// shopRouter.post("/buy", shopController.createTransactionPOST); 

shopRouter.get("/cart", shopController.viewCart); 
shopRouter.post("/cart/add", shopController.addToCart); 

shopRouter.post("/sign-up", shopController.addUser); 
shopRouter.post("/log-in", shopController.logIn); 


shopRouter.get("/session", shopController.getSession); 
module.exports = shopRouter;
