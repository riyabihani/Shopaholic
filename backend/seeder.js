const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

dotenv.config();

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)

// function to seed data
const seedData = async () => {
    try {
        // clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        // create a default admin user
        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@gmail.com",
            password: '123456',
            role: 'admin'
        });
        
        // assign the default user ID to each product
        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return {...product, user: userID};
        });

        // insert products into DB
        await Product.insertMany(sampleProducts);

        console.log("Product data seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding data");
        process.exit(1);
    }
};

seedData();
