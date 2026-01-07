const express = require("express");
const Product = require("../models/Product");
const jwt = require('jsonwebtoken');
const { protect, admin } = require('../middleware/authMiddleware')

const router = express.Router();

// @route POST /api/products
// @desc Create a new product in the database
// @access Private / Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, description, price, discountPrice, countInStock, category, brand, sizes, colors, collections, material, gender, images, isFeatured, isPublished, tags, dimensions, weight, sku } = req.body;

        const product = new Product({ name, description, price, discountPrice, countInStock, category, brand, sizes, colors, collections, material, gender, images, isFeatured, isPublished, tags, dimensions, weight, sku, user: req.user._id }); // admin user creating the product

        const createdProduct = await product.save();
        res .status(201).json(createdProduct);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;