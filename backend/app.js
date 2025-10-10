const express = require("express"); 
const path = require("path"); 
const shopRouter = require("./routes/shopRouter.js"); 
const app = express(); 
const PORT = process.env.PORT || 5000; 
const session = require("express-session");
const cors = require("cors"); 
app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // must be false for HTTP (true requires HTTPS)
}));
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}));
// app.set("views", path.join(__dirname, "view")); 
// app.set("view engine", "ejs"); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use("/", shopRouter); 
app.listen(PORT, (error) => {
    if (error) {
        throw error; 
    } else {
        console.log(`Server on http://localhost:${PORT}`);
    }
});