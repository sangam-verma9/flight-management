const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
    },
    seats_booked: {
        type: Number,
        required: true,
        min: [1, "At least one seat must be booked"],
    },
    booking_time: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['CONFIRMED', 'CANCELLED'],
        default: 'CONFIRMED',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Booking", bookingSchema);
