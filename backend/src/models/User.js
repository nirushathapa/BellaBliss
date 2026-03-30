const mongoose = require("mongoose");

const professionalDetailsSchema = new mongoose.Schema(
  {
    specialization: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "professional", "admin"],
      default: "customer",
    },
    professionalDetails: {
      type: professionalDetailsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
