const express = require("express"); 
const path = require("path"); 
const shopRouter = require("./routes/shopRouter.js"); 
const app = express(); 
const PORT = process.env.PORT || 3000; 

app.set("views", path.join(__dirname, "view")); 
app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true })); 
app.use("/", shopRouter); 
app.listen(PORT, (error) => {
    if (error) {
        throw error; 
    } else {
        console.log(`Server on http://localhost:${PORT}`);
    }
});