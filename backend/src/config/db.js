const mongoose = require("mongoose");
const { setFileStoreEnabled } = require("../utils/fileStore");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI is not defined. Falling back to local file store.");
    setFileStoreEnabled(true);
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    setFileStoreEnabled(false);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB unavailable. Falling back to local file store.");
    setFileStoreEnabled(true);
    return false;
  }
};

module.exports = connectDB;
