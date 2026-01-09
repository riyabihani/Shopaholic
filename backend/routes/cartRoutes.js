const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require('../middleware/authMiddleware')

const router = express.Router();

// helper funstion to get a cart by user id or guest id
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId });
    } else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
} 

// @route POST /api/cart
// @desc Add a product to the car for a guest or logged in user
// @access Public
router.post('/', async (req, res) => {
    console.log("HIT /api/cart");

    const { productId, quantity, size, color, guestId, userId } = req.body;
    const qty = Number(quantity) || 1;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found." });

        // determine is the user is logged in or cart
        let cart = await getCart(userId, guestId);

        // if cart exists, we need to update it
        if (cart) {
            const productIndex = cart.products.findIndex((p) => 
                p.productId.toString() === productId && p.size === size && p.color === color
            );

            if (productIndex > -1) {
                // product already exists, update the quantity
                cart.products[productIndex].quantity += qty;
            } else {
                // add new product to cart
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity
                });
            }

            // recalculate total cost
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);

            await cart.save();
            return res.status(200).json(cart);
        } else {
            // create a new cart for the guest or user
            const newCart = await Cart.create({
                user: userId ? userId: undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity
                    }
                ],
                totalPrice: product.price * quantity
            });
            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route PUT /api/cart
// @desc Update quantity in the cart for a guest or logged in user
// @access Public
router.put('/', async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart not found." });

        const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId && p.size === size && p.color === color );

        if (productIndex > -1) {
            // update quantity
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity;
            } else {
                cart.products.splice(productIndex, 1);  // remove product if quantity is 0
            }

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save()
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart."});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route DELETE /api/cart
// @desc Remove a product from the cart
// @access Public
router.delete('/', async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);

        if (!cart) return res.status(404).json({ message: "Cart not found." });

        const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId && p.size === size && p.color === color );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart."});
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route GET /api/cart
// @desc Get logged-in user's or guest user's cart 
// @access Public
router.get('/', async (req, res) => {
    const { userId, guestId } = req.query;

    try {
        const cart = await getCart(userId, guestId);

        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: "Cart not found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

module.exports = router;