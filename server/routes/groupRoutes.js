const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroup,
  updateMemberUpi,
  getBalances,
  addMember,
  syncMemberExpenses,
  settlePayment,
} = require("../controllers/groupController");
const {
  addExpense,
  getExpenses,
} = require("../controllers/expenseController");
const { requireAuth, optionalAuth } = require("../middleware/auth");

// Group CRUD
router.post("/", requireAuth, createGroup);
router.get("/:groupId", optionalAuth, getGroup);

// Member UPI update
router.put("/:groupId/members/:memberName/upi", optionalAuth, updateMemberUpi);
router.post("/:groupId/members", optionalAuth, addMember);
router.put("/:groupId/members/:memberName/sync", optionalAuth, syncMemberExpenses);

// Expenses (nested under group)
router.post("/:groupId/expenses", optionalAuth, addExpense);
router.get("/:groupId/expenses", optionalAuth, getExpenses);

// Balances & settlements
router.get("/:groupId/balances", optionalAuth, getBalances);
router.post("/:groupId/settle", optionalAuth, settlePayment);

module.exports = router;
