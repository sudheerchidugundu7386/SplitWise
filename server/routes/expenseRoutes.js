const express = require("express");
const router = express.Router();
const { deleteExpense } = require("../controllers/expenseController");
const { requireAuth, optionalAuth } = require("../middleware/auth");

// Delete expense by MongoDB _id
router.delete("/:expenseId", optionalAuth, deleteExpense);

module.exports = router;
