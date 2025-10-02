const express = require("express");
const { isAuthUser } = require("../middlewares/auth");
const {
    searchFlights,
    bookTicket,
    cancelBooking,
    getMyBookings,
    getBookingById
} = require("../controllers/bookingController");

const router = express.Router();

// Passenger routes for booking operations
router.route("/flights/search").get(isAuthUser, searchFlights);
router.route("/bookings").post(isAuthUser, bookTicket);
router.route("/bookings/my").get(isAuthUser, getMyBookings);
router.route("/bookings/:id").get(isAuthUser, getBookingById);
router.route("/bookings/:id/cancel").put(isAuthUser, cancelBooking);

module.exports = router;