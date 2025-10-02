const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const userRoute = require("./routes/userRoute");
const flightRoute = require("./routes/flightRoute");
const scheduleRoute = require("./routes/scheduleRoute");
const bookingRoute = require("./routes/bookingRoute");
const adminRoute = require("./routes/adminRoute");

app.use("/api/v1", userRoute);
app.use("/api/v1", bookingRoute);
app.use("/api/v1", flightRoute);
app.use("/api/v1", scheduleRoute);
app.use("/api/v1", adminRoute);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Flight Management System API is running"
    });
});

module.exports = app;