
// Importing required modules
import User from "../models/User.js";
import jwt from 'jsonwebtoken';

// Middleware function to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        // Get token from headers (usually set in frontend when making requests)
        const token = req.header.token;

        // If token not provided
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        // Verify token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID from the decoded token (excluding password)
        const user = await User.findById(decoded.userID).select('-password');

        // If user doesn't exist
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Attach user to request object
        req.user = user;

        // Move to the next middleware or route handler
        next();

    } catch (error) {
        // Token is invalid or expired
        return res.status(401).json({ success: false, message: error.message });
    }
}

// controller to check if user is authenticated

export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user })
}