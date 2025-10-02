const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.isAuthUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ success: false, message: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).send({ success: false, message: "Token not found" });
        }

        const decodedData = jwt.verify(token, process.env.SECRET_KEY);
        req.user = await User.findById(decodedData.id);

        if (!req.user) {
            return res.status(401).send({ success: false, message: "User not found" });
        }

        next();

    } catch (error) {
        return res.status(401).send({ success: false, message: "Invalid or expired token" });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).send({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }
        next();
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};