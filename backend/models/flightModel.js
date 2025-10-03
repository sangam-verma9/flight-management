const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: [true, "Airline is required"],
    },
    source: {
        type: String,
        required: [true, "Source location is required"],
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
    },
    total_seats: {
        type: Number,
        required: [true, "Total seats are required"],
        min: [1, "There must be at least one seat"],
    },
    logo: String,
    
}, {
    timestamps: true,
});

module.exports = mongoose.model("Flight", flightSchema);
