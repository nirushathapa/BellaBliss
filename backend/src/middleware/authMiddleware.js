const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fileStore = require("../utils/fileStore");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "blisss-secret");

    let user;
    if (fileStore.isFileStoreEnabled()) {
      user = fileStore.findUserById(decoded.userId);
      if (user) {
        delete user.password;
      }
    } else {
      user = await User.findById(decoded.userId).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized for this action",
    });
  }

  next();
};

module.exports = { protect, authorize };
