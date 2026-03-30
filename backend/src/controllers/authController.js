const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const fileStore = require("../utils/fileStore");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  professionalDetails: user.professionalDetails,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, professionalDetails } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (fileStore.isFileStoreEnabled()) {
      const existingUser = fileStore.findUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = fileStore.createUser({
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: role || "customer",
        professionalDetails: professionalDetails || {},
      });

      return res.status(201).json({
        success: true,
        data: {
          token: generateToken(user._id),
          user: sanitizeUser(user),
        },
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || "customer",
      professionalDetails: professionalDetails || {},
    });

    res.status(201).json({
      success: true,
      data: {
        token: generateToken(user._id),
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    if (fileStore.isFileStoreEnabled()) {
      const user = fileStore.findUserByEmail(normalizedEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          token: generateToken(user._id),
          user: sanitizeUser(user),
        },
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        token: generateToken(user._id),
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

const updateCurrentUser = async (req, res) => {
  try {
    if (fileStore.isFileStoreEnabled()) {
      const current = fileStore.findUserById(req.user._id);

      if (!current) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const updatedUser = fileStore.updateUser(req.user._id, {
        name: req.body.name || current.name,
        phone: req.body.phone || current.phone,
        professionalDetails:
          current.role === "professional" && req.body.professionalDetails
            ? {
                ...(current.professionalDetails || {}),
                ...req.body.professionalDetails,
              }
            : current.professionalDetails,
      });

      return res.status(200).json({
        success: true,
        data: sanitizeUser(updatedUser),
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (user.role === "professional" && req.body.professionalDetails) {
      user.professionalDetails = {
        ...user.professionalDetails.toObject(),
        ...req.body.professionalDetails,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
};
