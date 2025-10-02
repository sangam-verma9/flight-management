const express = require("express");
const { isAuthUser, isAdmin } = require("../middlewares/auth");
const {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
} = require("../controllers/scheduleController");

const router = express.Router();

router.route("/schedules").post(isAuthUser, isAdmin, createSchedule);
router.route("/schedules/:id").put(isAuthUser, isAdmin, updateSchedule);
router.route("/schedules/:id").delete(isAuthUser, isAdmin, deleteSchedule);

router.route("/schedules").get(isAuthUser, getAllSchedules);
router.route("/schedules/:id").get(isAuthUser, getScheduleById);

module.exports = router;