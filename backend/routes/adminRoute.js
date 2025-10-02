const express = require("express");
const { isAuthUser, isAdmin } = require("../middlewares/auth");
const {
    getAllBookings,
    getBookingsByFlight,
    getBookingsBySchedule,
    getFlightOccupancyReport,
    getCancellationReport,
    getRevenueReport,
    getDashboardStats
} = require("../controllers/adminController");

const router = express.Router();

// Admin-only routes
router.route("/admin/bookings").get(isAuthUser, isAdmin, getAllBookings);
router.route("/admin/bookings/flight/:flight_id").get(isAuthUser, isAdmin, getBookingsByFlight);
router.route("/admin/bookings/schedule/:schedule_id").get(isAuthUser, isAdmin, getBookingsBySchedule);

// Admin reports
router.route("/admin/reports/occupancy").get(isAuthUser, isAdmin, getFlightOccupancyReport);
router.route("/admin/reports/cancellations").get(isAuthUser, isAdmin, getCancellationReport);
router.route("/admin/reports/revenue").get(isAuthUser, isAdmin, getRevenueReport);
router.route("/admin/dashboard").get(isAuthUser, isAdmin, getDashboardStats);

module.exports = router;