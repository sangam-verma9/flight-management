const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flight",
        required: true,
    },
    departure_time: {
        type: Date,
        required: true,
    },
    arrival_time: {
        type: Date,
        required: true,
    },
    available_seats: {
        type: Number,
        required: true,
        min: [0, "Available seats cannot be negative"],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Schedule", scheduleSchema);
