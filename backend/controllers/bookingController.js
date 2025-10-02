const Booking = require("../models/bookingModel");
const Schedule = require("../models/scheduleModel");
const Flight = require("../models/flightModel");
const mongoose = require("mongoose");

// Passenger: Search flights
exports.searchFlights = async (req, res) => {
    try {
        const { date, source, destination, airline } = req.query;

        // Build query for schedules
        let scheduleQuery = {};
        let flightQuery = {};

        // Filter by date (departure date)
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            scheduleQuery.departure_time = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        // Filter by source, destination, airline in Flight model
        if (source) {
            flightQuery.source = { $regex: source, $options: 'i' }; // case-insensitive
        }
        if (destination) {
            flightQuery.destination = { $regex: destination, $options: 'i' };
        }
        if (airline) {
            flightQuery.airline = { $regex: airline, $options: 'i' };
        }

        // First find matching flights
        const flights = await Flight.find(flightQuery);
        const flightIds = flights.map(f => f._id);

        // Then find schedules for those flights
        scheduleQuery.flight = { $in: flightIds };
        scheduleQuery.available_seats = { $gt: 0 }; // Only show flights with available seats

        const schedules = await Schedule.find(scheduleQuery)
            .populate('flight')
            .sort({ departure_time: 1 });

        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Passenger: Book a ticket with transaction and concurrency control
exports.bookTicket = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { schedule_id, seats_booked } = req.body;
        const user_id = req.user._id;

        if (!schedule_id || !seats_booked) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ 
                success: false, 
                message: "Schedule ID and seats count are required" 
            });
        }

        if (seats_booked < 1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ 
                success: false, 
                message: "At least one seat must be booked" 
            });
        }

        // Find schedule within transaction with lock
        const schedule = await Schedule.findById(schedule_id)
            .populate('flight')
            .session(session);

        if (!schedule) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ 
                success: false, 
                message: "Schedule not found" 
            });
        }

        // Check if enough seats are available
        if (schedule.available_seats < seats_booked) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ 
                success: false, 
                message: `Only ${schedule.available_seats} seats available. Cannot book ${seats_booked} seats.` 
            });
        }

        // Check if departure time is in the past
        if (new Date(schedule.departure_time) < new Date()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ 
                success: false, 
                message: "Cannot book tickets for past flights" 
            });
        }

        // Update available seats atomically
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            schedule_id,
            { 
                $inc: { available_seats: -seats_booked } 
            },
            { 
                new: true, 
                session,
                runValidators: true 
            }
        );

        // Create booking
        const booking = await Booking.create([{
            user: user_id,
            schedule: schedule_id,
            seats_booked,
            status: 'CONFIRMED'
        }], { session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Populate booking details for response
        const populatedBooking = await Booking.findById(booking[0]._id)
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email phone');

        res.status(201).json({
            success: true,
            message: "Ticket booked successfully",
            booking: populatedBooking,
            booking_id: booking[0]._id,
            confirmation_details: {
                booking_id: booking[0]._id,
                passenger_name: req.user.username,
                flight: schedule.flight.airline,
                from: schedule.flight.source,
                to: schedule.flight.destination,
                departure: schedule.departure_time,
                arrival: schedule.arrival_time,
                seats: seats_booked,
                status: 'CONFIRMED'
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({ 
            success: false, 
            message: error.message 
        });
    }
};

// Passenger: Cancel booking
exports.cancelBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const booking_id = req.params.id;
        const user_id = req.user._id;

        // Find booking with session
        const booking = await Booking.findById(booking_id)
            .populate('schedule')
            .session(session);

        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        // Check if booking belongs to the user
        if (booking.user.toString() !== user_id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).send({ 
                success: false, 
                message: "Not authorized to cancel this booking" 
            });
        }

        // Check if already cancelled
        if (booking.status === 'CANCELLED') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ 
                success: false, 
                message: "Booking is already cancelled" 
            });
        }

        // Update booking status
        booking.status = 'CANCELLED';
        await booking.save({ session });

        // Return seats to schedule
        await Schedule.findByIdAndUpdate(
            booking.schedule._id,
            { 
                $inc: { available_seats: booking.seats_booked } 
            },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({ success: false, message: error.message });
    }
};

// Passenger: View booking history
exports.getMyBookings = async (req, res) => {
    try {
        const user_id = req.user._id;

        const bookings = await Booking.find({ user: user_id })
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
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

// Passenger: Get single booking details
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'schedule',
                populate: { path: 'flight' }
            })
            .populate('user', 'username email phone');

        if (!booking) {
            return res.status(404).send({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        // Check if booking belongs to the user (unless admin)
        if (req.user.role !== 'ADMIN' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).send({ 
                success: false, 
                message: "Not authorized to view this booking" 
            });
        }

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};