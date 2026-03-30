const express = require("express");
const {
  createBooking,
  getMyBookings,
  getBookingById,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").post(createBooking).get(getMyBookings);
router.get("/:id", getBookingById);

module.exports = router;
