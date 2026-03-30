const Booking = require("../models/Booking");
const fileStore = require("../utils/fileStore");

const createBooking = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const booking = fileStore.createBooking({
        ...req.body,
        user: req.user._id,
      });

      return res.status(201).json({
        success: true,
        data: booking,
      });
    }

    const booking = await Booking.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const bookings = fileStore
        .getBookingsByUser(req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    }

    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const booking = fileStore.getBookingById(req.params.id, req.user._id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

const getProfessionalBookings = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const bookings = fileStore
        .getBookingsByProfessional(req.user.name)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    }

    const bookings = await Booking.find({ professional: req.user.name }).sort({ date: 1, time: 1 });
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch professional bookings",
      error: error.message,
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const booking = fileStore.updateBooking(req.params.id, req.body);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = req.body.status || booking.status;
    if (req.body.paymentStatus) {
      booking.paymentStatus = req.body.paymentStatus;
    }
    if (req.body.date) {
      booking.date = req.body.date;
    }
    if (req.body.time) {
      booking.time = req.body.time;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getProfessionalBookings,
  updateBookingStatus,
};
