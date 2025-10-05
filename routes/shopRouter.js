const { Router } = require("express"); 
const shopRouter = Router(); 

const shopController = require("./shopController"); 

shopRouter.get("/", shopController.showShop); 
