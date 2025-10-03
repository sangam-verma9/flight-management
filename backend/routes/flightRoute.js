const express = require("express");
const { isAuthUser, isAdmin } = require("../middlewares/auth");
const upload = require('../middlewares/upload');
const {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight
} = require("../controllers/flightController");

const router = express.Router();

router.route("/flights").post(isAuthUser, isAdmin, upload.single('logo'), createFlight);
router.route("/flights").get(isAuthUser, isAdmin, getAllFlights);
router.route("/flights/:id").get(isAuthUser, isAdmin, getFlightById);
router.route("/flights/:id").put(isAuthUser, isAdmin, upload.single('logo'), updateFlight);
router.route("/flights/:id").delete(isAuthUser, isAdmin, deleteFlight);

module.exports = router;