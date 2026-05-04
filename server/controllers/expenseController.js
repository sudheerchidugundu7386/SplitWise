const Expense = require("../models/Expense");
const Group = require("../models/Group");

/**
 * POST /api/groups/:groupId/expenses
 * Add a new expense to a group.
 *
 * For "equal" split: divides the total amount equally among all members.
 * For "custom" split: uses the provided per-member amounts (must sum to total).
 */
exports.addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidBy, splitType, splits } = req.body;

    // Validate required fields
    if (!description || !amount || !paidBy) {
      return res.status(400).json({ error: "Description, amount, and paidBy are required." });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive." });
    }

    // Verify the group exists
    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    // Permission check removed to allow anyone with the link to add expenses

    // Verify paidBy is a valid member
    const memberNames = group.members.map((m) => m.name);
    if (!memberNames.includes(paidBy)) {
      return res.status(400).json({ error: `"${paidBy}" is not a member of this group.` });
    }

    let computedSplits;

    if (splitType === "custom") {
      // Custom split: validate that amounts sum to the total
      if (!splits || !Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ error: "Custom split requires a splits array." });
      }

      const splitTotal = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
      // Allow a ₹0.01 tolerance for floating point rounding
      if (Math.abs(splitTotal - amount) > 0.01) {
        return res.status(400).json({
          error: `Split amounts (₹${splitTotal.toFixed(2)}) do not equal the total (₹${amount.toFixed(2)}).`,
        });
      }

      computedSplits = splits.map((s) => ({
        member: s.member,
        amount: Math.round(s.amount * 100) / 100,
      }));
    } else {
      // Equal split: divide evenly among all group members
      const perPerson = Math.round((amount / memberNames.length) * 100) / 100;
      computedSplits = memberNames.map((name) => ({
        member: name,
        amount: perPerson,
      }));

      // Fix rounding by adjusting the first person's share
      const roundingDiff = amount - perPerson * memberNames.length;
      if (Math.abs(roundingDiff) > 0.001) {
        computedSplits[0].amount = Math.round((computedSplits[0].amount + roundingDiff) * 100) / 100;
      }
    }

    const expense = await Expense.create({
      groupId,
      description: description.trim(),
      amount,
      paidBy,
      splitType: splitType || "equal",
      splits: computedSplits,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("addExpense error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/groups/:groupId/expenses
 * Retrieve all expenses for a group, newest first.
 */
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId }).sort({
      createdAt: -1,
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/expenses/:expenseId
 * Remove an expense by its MongoDB _id.
 */
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ error: "Expense not found." });

    const group = await Group.findOne({ groupId: expense.groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    // Permission check removed to allow anyone with the link to delete expenses

    await Expense.findByIdAndDelete(req.params.expenseId);
    res.json({ message: "Expense deleted.", expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
