const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");
const PORT = process.env.PORT || 3001; // Change to another port like 3001
const userRoutes = require("./routes/user");
const otpRoutes = require("./routes/otpRoutes");
const path = require("path");
const connectDB = require("./db/connectdb");
const authRoutes = require("./routes/authRoutes"); 
const adminRoutes = require("./routes/admin");
require("./utils/googleAuth");
const cors = require('cors');

// const authCheck = require("./middlewares/auth");
app.use(cors());

const adminauth = require("./middlewares/adminauth");
const auth = require("./middlewares/auth");
const checkBan= require("./middlewares/checkban");

// Set views directory and view engine
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views","users"),path.join(__dirname, "views","admin")]);

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware to log the requested URL
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});

// Middleware setup for parsing request bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Session middleware setup
app.use(session({
    secret: 'your_secret_key', // Change this to a more secure key in production
    resave: false, 
    saveUninitialized: true, 
    cookie:{
        maxAge: 1000 * 60 * 60 * 24, 
    }
}));

//middleWares
app.use(adminauth);
app.use(auth);
app.use(checkBan);


// Use user routes
app.use("/", userRoutes);
app.use("/", authRoutes);
app.use("/", otpRoutes);
app.use("/", adminRoutes);



// Connect to the database
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}/`);
});
