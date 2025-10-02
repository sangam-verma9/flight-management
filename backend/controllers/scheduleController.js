const Schedule = require("../models/scheduleModel");
const Flight = require("../models/flightModel");
const Booking = require("../models/bookingModel");

// Admin: Create a new schedule for a flight
exports.createSchedule = async (req, res) => {
    try {
        const { flight, departure_time, arrival_time, available_seats } = req.body;

        if (!flight || !departure_time || !arrival_time || available_seats === undefined) {
            return res.status(400).send({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if flight exists
        const flightExists = await Flight.findById(flight);
        if (!flightExists) {
            return res.status(404).send({
                success: false,
                message: "Flight not found"
            });
        }

        // Validate that available_seats doesn't exceed total_seats
        if (available_seats > flightExists.total_seats) {
            return res.status(400).send({
                success: false,
                message: `Available seats cannot exceed total seats (${flightExists.total_seats})`
            });
        }

        // Validate departure time is before arrival time
        if (new Date(departure_time) >= new Date(arrival_time)) {
            return res.status(400).send({
                success: false,
                message: "Departure time must be before arrival time"
            });
        }

        const schedule = await Schedule.create({
            flight,
            departure_time,
            arrival_time,
            available_seats
        });

        const populatedSchedule = await Schedule.findById(schedule._id).populate('flight');

        res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            schedule: populatedSchedule
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Get all schedules (Admin & Passenger)
exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('flight');

        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id).populate('flight');

        if (!schedule) {
            return res.status(404).send({
                success: false,
                message: "Schedule not found"
            });
        }

        res.status(200).json({
            success: true,
            schedule
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Update schedule
exports.updateSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).send({
                success: false,
                message: "Schedule not found"
            });
        }

        // If updating available_seats, validate against flight's total_seats
        if (req.body.available_seats !== undefined) {
            const flight = await Flight.findById(schedule.flight);
            if (req.body.available_seats > flight.total_seats) {
                return res.status(400).send({
                    success: false,
                    message: `Available seats cannot exceed total seats (${flight.total_seats})`
                });
            }
        }

        // Validate time if updating
        if (req.body.departure_time || req.body.arrival_time) {
            const depTime = req.body.departure_time || schedule.departure_time;
            const arrTime = req.body.arrival_time || schedule.arrival_time;

            if (new Date(depTime) >= new Date(arrTime)) {
                return res.status(400).send({
                    success: false,
                    message: "Departure time must be before arrival time"
                });
            }
        }

        schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('flight');

        res.status(200).json({
            success: true,
            message: "Schedule updated successfully",
            schedule
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Delete schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).send({
                success: false,
                message: "Schedule not found"
            });
        }

        // Check if there are any active bookings for this schedule
        const activeBookings = await Booking.find({
            schedule: req.params.id,
            status: 'CONFIRMED'
        });

        if (activeBookings.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Cannot delete schedule with active bookings"
            });
        }

        await Schedule.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Schedule deleted successfully"
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};