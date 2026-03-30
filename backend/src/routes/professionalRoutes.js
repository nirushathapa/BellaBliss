const express = require("express");
const {
  getProfessionalBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("professional", "admin"));
router.get("/bookings", getProfessionalBookings);
router.put("/bookings/:id", updateBookingStatus);

module.exports = router;
