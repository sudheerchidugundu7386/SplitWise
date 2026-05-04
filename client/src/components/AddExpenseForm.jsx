import { useState } from "react";
import { addExpense } from "../utils/api.js";
import { Receipt, ToggleLeft, ToggleRight } from "lucide-react";

/**
 * AddExpenseForm — Form to add a new expense to the group.
 * Supports equal and custom splits with validation.
 */
export default function AddExpenseForm({ groupId, members, onExpenseAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState((members && members[0]?.name) || "");
  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState(
    (members || []).map((m) => ({ member: m.name, amount: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateCustomSplit = (idx, value) => {
    const updated = [...customSplits];
    updated[idx].amount = value;
    setCustomSplits(updated);
  };

  // For custom splits: calculate remaining amount to be split
  const customTotal = customSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const remaining = (parseFloat(amount) || 0) - customTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (!description.trim()) return setError("Enter a description.");
    if (!parsedAmount || parsedAmount <= 0) return setError("Enter a valid amount.");
    if (!paidBy) return setError("Select who paid.");

    const payload = {
      description: description.trim(),
      amount: parsedAmount,
      paidBy,
      splitType,
    };

    if (splitType === "custom") {
      const splits = customSplits
        .map((s) => ({ member: s.member, amount: parseFloat(s.amount) || 0 }))
        .filter((s) => s.amount > 0);

      if (splits.length === 0) return setError("Enter at least one custom split amount.");

      const total = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(total - parsedAmount) > 0.01) {
        return setError(`Split total (₹${total.toFixed(2)}) must equal expense amount (₹${parsedAmount.toFixed(2)}).`);
      }
      payload.splits = splits;
    }

    setLoading(true);
    try {
      await addExpense(groupId, payload);
      // Reset form
      setDescription("");
      setAmount("");
      setPaidBy(members[0]?.name || "");
      setSplitType("equal");
      setCustomSplits(members.map((m) => ({ member: m.name, amount: "" })));
      onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-5 sm:p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <Receipt size={18} />
        </div>
        <h3 className="text-lg font-bold text-white">Add Expense</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
          <input
            id="expense-description"
            type="text"
            className="input"
            placeholder="e.g. Dinner at Beach Shack"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={60}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
          <input
            id="expense-amount"
            type="number"
            className="input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Paid By</label>
          <select
            id="expense-paid-by"
            className="input"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Split Type Toggle */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Split Type</label>
          <button
            type="button"
            onClick={() => setSplitType(splitType === "equal" ? "custom" : "equal")}
            className="input flex items-center gap-2 cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            {splitType === "equal" ? (
              <ToggleLeft size={20} className="text-cyan-400" />
            ) : (
              <ToggleRight size={20} className="text-teal-400" />
            )}
            <span className="capitalize font-medium text-slate-300">{splitType} Split</span>
          </button>
        </div>
      </div>

      {/* Custom Splits */}
      {splitType === "custom" && (
        <div className="mb-4 p-4 rounded-xl bg-black/40 border border-white/5 animate-fade-in shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Custom Split Amounts</span>
            <span className={`text-xs font-bold ${Math.abs(remaining) < 0.01 ? "text-teal-400" : "text-amber-400"}`}>
              {Math.abs(remaining) < 0.01 ? "✓ Balanced" : `₹${remaining.toFixed(2)} remaining`}
            </span>
          </div>
          <div className="space-y-2">
            {customSplits.map((split, idx) => (
              <div key={split.member} className="flex items-center gap-3">
                <span className="text-sm text-slate-300 w-24 truncate">{split.member}</span>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={split.amount}
                  onChange={(e) => updateCustomSplit(idx, e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="add-expense-btn"
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Receipt size={16} /> Add Expense
          </>
        )}
      </button>
    </form>
  );
}
