const Booking = require("../models/Booking");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const fileStore = require("../utils/fileStore");

const getDashboardStats = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const orders = fileStore
        .getAllOrders()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      const counts = fileStore.getCounts();
      const totalRevenue = fileStore
        .getAllOrders()
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalRevenue,
          totalOrders: counts.orders,
          totalBookings: counts.bookings,
          totalProducts: counts.products,
          totalUsers: counts.users,
          recentOrders: orders,
        },
      });
    }

    const [orders, bookings, products, users] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5),
      Booking.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const orderCount = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: orderCount,
        totalBookings: bookings,
        totalProducts: products,
        totalUsers: users,
        recentOrders: orders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      return res.status(200).json({
        success: true,
        data: fileStore.getAllOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      });
    }

    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      return res.status(200).json({
        success: true,
        data: fileStore.getAllBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getAllBookings,
};
