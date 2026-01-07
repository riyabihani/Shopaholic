const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")

const app = express();
// ensure that our app is able to work with JSON data 
app.use(express.json());
// communicate with React server
app.use(cors());

dotenv.config();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("WELCOME TO SHOPAHLIC API");
});

// API routes
app.use('/api/users', userRoutes) // will append /api/users to all user routes

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});