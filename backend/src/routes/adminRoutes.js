const express = require("express");
const {
  getDashboardStats,
  getAllOrders,
  getAllBookings,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/dashboard", getDashboardStats);
router.get("/orders", getAllOrders);
router.get("/bookings", getAllBookings);

module.exports = router;
