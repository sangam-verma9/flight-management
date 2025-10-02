const Booking = require("../models/bookingModel");
const Schedule = require("../models/scheduleModel");
const Flight = require("../models/flightModel");
const User = require("../models/userModel");

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email phone')
            .sort({ booking_time: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Get bookings for a specific flight
exports.getBookingsByFlight = async (req, res) => {
    try {
        const flight_id = req.params.flight_id;

        // Find all schedules for this flight
        const schedules = await Schedule.find({ flight: flight_id });
        const scheduleIds = schedules.map(s => s._id);

        // Find bookings for these schedules
        const bookings = await Booking.find({
            schedule: { $in: scheduleIds }
        })
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email phone')
            .sort({ booking_time: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Get bookings for a specific schedule
exports.getBookingsBySchedule = async (req, res) => {
    try {
        const schedule_id = req.params.schedule_id;

        const bookings = await Booking.find({ schedule: schedule_id })
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email phone')
            .sort({ booking_time: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Flight occupancy report
exports.getFlightOccupancyReport = async (req, res) => {
    try {
        const flights = await Flight.find();
        const report = [];

        for (let flight of flights) {
            // Get all schedules for this flight
            const schedules = await Schedule.find({ flight: flight._id });

            let totalSchedules = schedules.length;
            let totalSeatsOffered = 0;
            let totalSeatsBooked = 0;
            let totalRevenue = 0;

            for (let schedule of schedules) {
                totalSeatsOffered += flight.total_seats;
                const seatsBooked = flight.total_seats - schedule.available_seats;
                totalSeatsBooked += seatsBooked;

                // Get confirmed bookings for revenue calculation
                const confirmedBookings = await Booking.find({
                    schedule: schedule._id,
                    status: 'CONFIRMED'
                });

                totalRevenue += confirmedBookings.reduce((sum, b) => sum + b.seats_booked, 0);
            }

            const occupancyRate = totalSeatsOffered > 0
                ? ((totalSeatsBooked / totalSeatsOffered) * 100).toFixed(2)
                : 0;

            report.push({
                flight_id: flight._id,
                airline: flight.airline,
                route: `${flight.source} → ${flight.destination}`,
                total_schedules: totalSchedules,
                total_seats_offered: totalSeatsOffered,
                total_seats_booked: totalSeatsBooked,
                available_seats: totalSeatsOffered - totalSeatsBooked,
                occupancy_rate: `${occupancyRate}%`,
                total_bookings: totalRevenue
            });
        }

        res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Cancellation report
exports.getCancellationReport = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const cancelledBookings = await Booking.countDocuments({ status: 'CANCELLED' });
        const confirmedBookings = await Booking.countDocuments({ status: 'CONFIRMED' });

        const cancellationRate = totalBookings > 0
            ? ((cancelledBookings / totalBookings) * 100).toFixed(2)
            : 0;

        // Get cancelled bookings details
        const recentCancellations = await Booking.find({ status: 'CANCELLED' })
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email')
            .sort({ updatedAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            summary: {
                total_bookings: totalBookings,
                confirmed_bookings: confirmedBookings,
                cancelled_bookings: cancelledBookings,
                cancellation_rate: `${cancellationRate}%`
            },
            recent_cancellations: recentCancellations
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Revenue report (bookings count as revenue metric)
exports.getRevenueReport = async (req, res) => {
    try {
        const flights = await Flight.find();
        const report = [];

        for (let flight of flights) {
            const schedules = await Schedule.find({ flight: flight._id });
            const scheduleIds = schedules.map(s => s._id);

            const confirmedBookings = await Booking.find({
                schedule: { $in: scheduleIds },
                status: 'CONFIRMED'
            });

            const totalSeatsBooked = confirmedBookings.reduce(
                (sum, booking) => sum + booking.seats_booked,
                0
            );

            report.push({
                flight_id: flight._id,
                airline: flight.airline,
                route: `${flight.source} → ${flight.destination}`,
                total_confirmed_bookings: confirmedBookings.length,
                total_seats_sold: totalSeatsBooked,
                revenue_metric: totalSeatsBooked // Can be multiplied by price per seat
            });
        }

        // Sort by revenue
        report.sort((a, b) => b.revenue_metric - a.revenue_metric);

        res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalFlights = await Flight.countDocuments();
        const totalSchedules = await Schedule.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'PASSENGER' });
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'CONFIRMED' });
        const cancelledBookings = await Booking.countDocuments({ status: 'CANCELLED' });

        // Get upcoming flights (schedules in future)
        const upcomingSchedules = await Schedule.countDocuments({
            departure_time: { $gte: new Date() }
        });

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email')
            .sort({ booking_time: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            statistics: {
                total_flights: totalFlights,
                total_schedules: totalSchedules,
                upcoming_schedules: upcomingSchedules,
                total_passengers: totalUsers,
                total_bookings: totalBookings,
                confirmed_bookings: confirmedBookings,
                cancelled_bookings: cancelledBookings
            },
            recent_bookings: recentBookings
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};