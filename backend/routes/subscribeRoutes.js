const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");


// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Public
router.post('/subscribe', async(req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "email is required" });
    }

    try {
        // check if email is already subscribed
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            return res.status(400).json({ message: "email is already subscribed" });
        }

        // create a new subscriber
        subscriber = new Subscriber({ email })
        await subscriber.save()

        return res.status(201).json({ message: "successfully subscribed to the newsletter" });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;