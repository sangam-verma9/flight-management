const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter username"],
        unique: [true, "Username already exists"],
        minLength: [3, "Username must be at least 3 characters"],
        maxLength: [50, "Username must not exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address"],
    },
    password: {
        type: String,
        required: true,
        select: false,
        minLength: [6, "Password must be at least 6 characters"],
    },
    phone: {
        type: String,
        length: [10, "Phone number can't exceed 10 digits"],
    },
    role: {
        type: String,
        enum: ['PASSENGER', 'ADMIN'],
        default: 'PASSENGER',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

userSchema.methods.generatejwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.methods.passwordCompare = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
