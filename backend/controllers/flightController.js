const Flight = require("../models/flightModel");
const Schedule = require("../models/scheduleModel");
const Booking = require("../models/bookingModel");
const { s3 } = require("../utils/s3");

// Admin: Create a new flight
exports.createFlight = async (req, res) => {
    try {
        const { airline, source, destination, total_seats } = req.body;

        if (!airline || !source || !destination || !total_seats) {
            return res.status(400).send({
                success: false,
                message: "All fields are required"
            });
        }

        let logoUrl = null;

        if (req.file) {
            // Upload logo to S3
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `flight-logos/${Date.now()}_${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'public-read' // so it's publicly accessible
            };

            const uploadResult = await s3.upload(params).promise();
            logoUrl = uploadResult.Location;
        }

        const flight = await Flight.create({
            airline,
            source,
            destination,
            total_seats,
            logo: logoUrl
        });

        res.status(201).json({
            success: true,
            message: "Flight created successfully",
            flight
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Get all flights
exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find();

        res.status(200).json({
            success: true,
            count: flights.length,
            flights
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Get single flight details
exports.getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).send({
                success: false,
                message: "Flight not found"
            });
        }

        res.status(200).json({
            success: true,
            flight
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Update flight details
exports.updateFlight = async (req, res) => {
    try {
        let flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).send({
                success: false,
                message: "Flight not found"
            });
        }

        flight = await Flight.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Flight updated successfully",
            flight
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Admin: Delete flight
exports.deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).send({
                success: false,
                message: "Flight not found"
            });
        }

        // Check if there are any schedules associated with this flight
        const schedules = await Schedule.find({ flight: req.params.id });

        if (schedules.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Cannot delete flight with existing schedules. Please delete schedules first."
            });
        }

        await Flight.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Flight deleted successfully"
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};