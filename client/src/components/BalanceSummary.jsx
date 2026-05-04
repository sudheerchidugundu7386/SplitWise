import MemberAvatar from "./MemberAvatar.jsx";
import { TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

/**
 * BalanceSummary — Per-member balance cards.
 * Green = to receive (positive), Red = to pay (negative), Gray = settled.
 */
export default function BalanceSummary({ balances, members }) {
  const memberIndex = (name) => (members || []).findIndex((m) => m.name === name);

  if (!balances || balances.length === 0) return null;

  return (
    <div className="glass p-5 sm:p-6 animate-fade-in-up">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-cyan-400" />
        Balances
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 stagger-children">
        {balances.map((b) => {
          const isPos = b.net > 0.01;
          const isNeg = b.net < -0.01;
          const settled = !isPos && !isNeg;
          const border = isPos ? "bg-emerald-500/10 border-emerald-500/20" : isNeg ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5";
          const color = isPos ? "text-emerald-400" : isNeg ? "text-red-400" : "text-slate-500";
          return (
            <div key={b.member} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${border}`}>
              <MemberAvatar name={b.member} index={memberIndex(b.member)} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.member}</p>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  {isPos && <TrendingUp size={12} className="text-emerald-400 shrink-0" />}
                  {isNeg && <TrendingDown size={12} className="text-red-400 shrink-0" />}
                  {settled && <CheckCircle size={12} className="text-slate-500 shrink-0" />}
                  <span className={`text-xs font-medium truncate ${color}`}>{isPos ? "gets back" : isNeg ? "owes" : "settled"}</span>
                </div>
              </div>
              <span className={`text-lg font-bold whitespace-nowrap shrink-0 text-right ${color}`}>
                {settled ? "₹0" : `${isPos ? "+" : "-"}₹${Math.abs(b.net || 0).toFixed(2)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
