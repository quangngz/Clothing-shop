const express = require("express"); 
const session = require("express-session");
const shopRouter = require("./routes/shopRouter"); 
const app = express(); 
const PORT = process.env.PORT || 5000; 
const cors = require("cors"); 
const passport = require("./db/passport");
require("dotenv").config(); 

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // must be false for HTTP (true requires HTTPS)
}));
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}));
app.use(passport.initialize()); 
app.use(passport.session());

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

