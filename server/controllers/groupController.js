const Group = require("../models/Group");
const Expense = require("../models/Expense");
// nanoid v5 is ESM-only — use dynamic import
let nanoid;
(async () => {
  const mod = await import("nanoid");
  nanoid = mod.nanoid;
})();

/**
 * POST /api/groups
 * Create a new group with a unique shareable ID.
 */
exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: "Group name and members array are required." });
    }
    if (members.length < 2 || members.length > 10) {
      return res.status(400).json({ error: "A group must have between 2 and 10 members." });
    }

    // Generate a more readable, unique ID (e.g. GROUP-A8B9C)
    const randomPart = nanoid(5).toUpperCase();
    const groupId = `GROUP-${randomPart}`;

    const group = await Group.create({
      groupId,
      name: name.trim(),
      createdBy: req.user._id,
      members: members.map((m) => ({
        name: typeof m === "string" ? m.trim() : m.name?.trim(),
        email: (typeof m === "object" && m.email) ? m.email.trim() : "",
        upiId: (typeof m === "object" && m.upiId) ? m.upiId.trim() : "",
      })),
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("createGroup error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/groups/:groupId
 * Retrieve group details by its shareable ID.
 */
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ groupId: req.params.groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/groups/:groupId/members/:memberName/upi
 * Update a member's UPI ID.
 */
exports.updateMemberUpi = async (req, res) => {
  try {
    const { groupId, memberName } = req.params;
    const { upiId } = req.body;

    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    const member = group.members.find(
      (m) => m.name.toLowerCase() === decodeURIComponent(memberName).toLowerCase()
    );
    if (!member) return res.status(404).json({ error: "Member not found." });

    member.upiId = upiId?.trim() || "";
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/groups/:groupId/balances
 *
 * === MINIMUM TRANSACTIONS ALGORITHM ===
 *
 * Goal: Given N people with various debts, find the minimum number of
 * transactions needed so everyone is settled.
 *
 * Steps:
 * 1. Compute each person's NET balance:
 *       net[person] = totalPaid[person] − totalOwed[person]
 *    If net > 0, person is a creditor (others owe them).
 *    If net < 0, person is a debtor (they owe others).
 *
 * 2. Separate into two lists: creditors and debtors.
 *
 * 3. Sort both lists by absolute value (descending).
 *
 * 4. Greedily pair the largest debtor with the largest creditor:
 *    - Transfer amount = min(|debt|, credit)
 *    - Reduce both balances by that amount
 *    - If a balance reaches zero, remove from list
 *    - Repeat until both lists are empty
 *
 * This greedy approach produces optimal or near-optimal results
 * for typical group sizes (2–10 people).
 */
exports.getBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    const expenses = await Expense.find({ groupId });

    // Step 1: Calculate net balance for each member
    const netBalance = {};
    group.members.forEach((m) => {
      netBalance[m.name] = 0;
    });

    expenses.forEach((expense) => {
      // The payer's balance goes UP by the total amount they paid
      netBalance[expense.paidBy] = (netBalance[expense.paidBy] || 0) + expense.amount;

      // Each person's balance goes DOWN by their share
      expense.splits.forEach((split) => {
        netBalance[split.member] = (netBalance[split.member] || 0) - split.amount;
      });
    });

    // Build the balances array for the response
    const balances = Object.entries(netBalance).map(([member, net]) => ({
      member,
      net: Math.round(net * 100) / 100, // avoid floating point noise
    }));

    // Step 2: Separate into creditors and debtors
    const creditors = []; // net > 0 (are owed money)
    const debtors = [];   // net < 0 (owe money)

    balances.forEach(({ member, net }) => {
      if (net > 0.01) creditors.push({ member, amount: net });
      else if (net < -0.01) debtors.push({ member, amount: -net }); // store as positive
    });

    // Step 3: Sort descending by amount
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Step 4: Greedily match largest debtor with largest creditor
    const suggestedSettlements = [];
    let i = 0; // index into debtors
    let j = 0; // index into creditors

    while (i < debtors.length && j < creditors.length) {
      const transferAmount = Math.min(debtors[i].amount, creditors[j].amount);
      const roundedAmount = Math.round(transferAmount * 100) / 100;

      if (roundedAmount > 0) {
        // Find the creditor's UPI ID from the group members list
        const creditorMember = group.members.find(
          (m) => m.name === creditors[j].member
        );

        suggestedSettlements.push({
          from: debtors[i].member,
          to: creditors[j].member,
          amount: roundedAmount,
          upiId: creditorMember?.upiId || "",
        });
      }

      // Reduce both balances by the transferred amount
      debtors[i].amount -= transferAmount;
      creditors[j].amount -= transferAmount;

      // Move past anyone whose balance is now zero
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }
    
    // Step 5: Check if group is fully settled
    // A group is fully settled if there are no suggested settlements left 
    // AND at least one expense has been made (to avoid marking empty groups as settled)
    const isSettled = suggestedSettlements.length === 0 && expenses.length > 0;
    if (group.isSettled !== isSettled) {
      group.isSettled = isSettled;
      await group.save();
    }

    // Step 6: Get completed settlements to show "Settled Payment"
    const completedSettlements = expenses
      .filter(e => e.isSettlement)
      .map(e => ({
        from: e.paidBy,
        to: e.splits[0].member,
        amount: e.amount,
        date: e.createdAt,
        id: e._id
      }));

    res.json({ 
      balances, 
      settlements: suggestedSettlements, 
      completedSettlements,
      isSettled: group.isSettled 
    });
  } catch (error) {
    console.error("getBalances error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/groups/:groupId/members
 * Add a new member to an existing group.
 */
exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, email, upiId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Member name is required." });
    }

    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    // Permission check removed to allow anyone with the link to add members
    // isCreator and isMemberWithEditAccess can still be used for UI logic if needed

    // Check if name already exists (case-insensitive)
    const exists = group.members.find(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ error: "A member with this name already exists." });
    }

    group.members.push({
      name: name.trim(),
      email: email?.trim() || "",
      upiId: upiId?.trim() || "",
    });

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/groups/:groupId/members/:memberName/sync
 * Retroactively add a member to all existing expenses in the group.
 */
exports.syncMemberExpenses = async (req, res) => {
  try {
    const { groupId, memberName } = req.params;

    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    const expenses = await Expense.find({ groupId });
    const memberCount = group.members.length;
    const memberNames = group.members.map(m => m.name);

    let updatedCount = 0;

    for (let expense of expenses) {
      const alreadyIn = expense.splits.find((s) => s.member === memberName);
      if (alreadyIn) continue;

      if (expense.splitType === "equal") {
        // Recalculate equal split for the new member count
        const perPerson = Math.round((expense.amount / memberCount) * 100) / 100;
        const newSplits = memberNames.map((name) => ({
          member: name,
          amount: perPerson,
        }));

        // Adjust for rounding
        const totalSplit = perPerson * memberCount;
        const diff = Math.round((expense.amount - totalSplit) * 100) / 100;
        if (diff !== 0) {
          newSplits[0].amount = Math.round((newSplits[0].amount + diff) * 100) / 100;
        }

        expense.splits = newSplits;
        await expense.save();
        updatedCount++;
      } else {
        // For custom splits, just add the new member with 0 to keep the sum valid
        expense.splits.push({ member: memberName, amount: 0 });
        await expense.save();
        updatedCount++;
      }
    }

    res.json({ message: `Successfully synced ${updatedCount} expenses.`, updatedCount });
  } catch (error) {
    console.error("syncMemberExpenses error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/groups/:groupId/settle
 * Record a payment between two members to settle debts.
 */
exports.settlePayment = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: "From, to, and amount are required." });
    }

    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ error: "Group not found." });

    // Create a special settlement expense
    const settlementExpense = await Expense.create({
      groupId,
      description: `Settlement: ${from} paid ${to}`,
      amount,
      paidBy: from,
      splitType: "custom",
      splits: [{ member: to, amount: amount }],
      isSettlement: true,
    });

    res.status(201).json(settlementExpense);
  } catch (error) {
    console.error("settlePayment error:", error);
    res.status(500).json({ error: error.message });
  }
};
