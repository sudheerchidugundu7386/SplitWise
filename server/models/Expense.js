const mongoose = require("mongoose");

/**
 * Split sub-schema: how much each member owes for this expense.
 */
const splitSchema = new mongoose.Schema(
  {
    member: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/**
 * Expense schema.
 * - groupId:     Links to the parent Group.groupId
 * - description: What the expense was for
 * - amount:      Total amount of the expense
 * - paidBy:      Name of the member who paid
 * - splitType:   "equal" splits evenly, "custom" uses manual amounts
 * - splits:      Breakdown of how much each member owes
 */
const expenseSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  paidBy: {
    type: String,
    required: true,
  },
  splitType: {
    type: String,
    enum: ["equal", "custom"],
    default: "equal",
  },
  splits: [splitSchema],
  isSettlement: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
