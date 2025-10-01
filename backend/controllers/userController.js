const User = require("../models/userModel");

exports.registeruser = async (req, res) => {
    try {
        const { username, phone, email, password, role } = req.body;
        const user = await User.create({
            username,
            phone,
            email,
            password,
            role
        });
        const token = user.generatejwtToken();
        res.status(201).json({
            success: true,
            user,
            token,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

};

exports.loginuser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(401).send({ success: false, message: "Please enter your email and password" });
            return;
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).send({ success: false, message: "Invalid credentials" });
            return;
        }
        const isPasswordMatch = await user.passwordCompare(password);
        if (!isPasswordMatch) {
            res.status(401).send({ success: false, message: "Invalid User" });
            return;
        }
        const token = user.generatejwtToken();
        res.status(200).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

};

exports.getuserdetails = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};
