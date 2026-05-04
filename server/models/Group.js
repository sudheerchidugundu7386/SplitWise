const mongoose = require("mongoose");

/**
 * Member sub-schema.
 * - name:  Display name (required)
 * - upiId: Optional UPI virtual payment address (e.g. user@upi)
 */
const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    upiId: { type: String, default: "", trim: true },
  },
  { _id: false }
);

/**
 * Group schema.
 * - groupId: Short, URL-safe unique identifier generated via nanoid
 * - name:    Human-readable group name
 * - members: 2–10 members
 */
const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  members: {
    type: [memberSchema],
    validate: {
      validator: (v) => v.length >= 2 && v.length <= 10,
      message: "A group must have between 2 and 10 members.",
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isSettled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Group", groupSchema);
