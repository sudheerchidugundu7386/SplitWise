import { Trash2, Receipt } from "lucide-react";
import { deleteExpense as deleteExpenseApi } from "../utils/api.js";
import MemberAvatar from "./MemberAvatar.jsx";

/**
 * ExpenseList — Chronological list of all group expenses.
 * Each card shows description, amount, paid by, date, and a delete button.
 */
export default function ExpenseList({ expenses, members, onExpenseDeleted, hasEditAccess }) {
  const memberIndex = (name) => (members || []).findIndex((m) => m.name === name);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpenseApi(id);
      onExpenseDeleted();
    } catch (err) {
      alert("Failed to delete expense.");
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="glass p-6 text-center animate-fade-in-up">
        <Receipt size={40} className="mx-auto mb-3 text-slate-600" />
        <p className="text-slate-400 text-sm">No expenses yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="glass p-5 sm:p-6 animate-fade-in-up">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Receipt size={18} className="text-cyan-400" />
        Expenses & Transaction ({expenses.length})
      </h3>

      <div className="space-y-3 stagger-children">
        {expenses.map((exp) => (
          <div
            key={exp._id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all group"
          >
            <MemberAvatar name={exp.paidBy} index={memberIndex(exp.paidBy)} size="sm" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{exp.description}</p>
              <p className="text-xs text-slate-400">
                Paid by <span className="text-cyan-400 font-medium">{exp.paidBy}</span>
                {" · "}
                {new Date(exp.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {" · "}
                <span className="capitalize text-slate-500">{exp.splitType}</span>
              </p>
            </div>

            <span className="text-sm font-bold text-white whitespace-nowrap">
              ₹{(exp.amount || 0).toFixed(2)}
            </span>

            {hasEditAccess && (
              <button
                onClick={() => handleDelete(exp._id)}
                className="w-7 h-7 rounded-lg bg-red-500/0 text-slate-500 hover:bg-red-500/15 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                title="Delete expense"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
