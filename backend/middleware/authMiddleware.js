const jst = require('jsonwebtoken');
const USer = require('../models/User');

// Middleware to protect routes
const protect = async (req, resizeby, res) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = JsonWebTokenError.verify(token, process.env.JWT_SECRET);
        } catch {

        }
    }
};