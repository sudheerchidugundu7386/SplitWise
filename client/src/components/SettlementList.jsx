import { ArrowRight, Handshake, CheckCircle2, Circle } from "lucide-react";
import MemberAvatar from "./MemberAvatar.jsx";
import UpiPayButton from "./UpiPayButton.jsx";

/**
 * SettlementList — Shows the optimized "A pays B ₹X" settlements
 * with UPI pay buttons and "Mark as Done" options.
 */
export default function SettlementList({ settlements, completedSettlements = [], members, onSetUpi, onSettle, hasEditAccess }) {
  const memberIndex = (name) => (members || []).findIndex((m) => m.name === name);

  const allSettled = (!settlements || settlements.length === 0) && ((completedSettlements || []).length > 0 || (members || []).length > 0);

  return (
    <div className="glass p-5 sm:p-6 animate-fade-in-up">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Handshake size={18} className="text-cyan-400" />
        Settlements
      </h3>
      
      <div className="space-y-4">
        {/* Suggested Settlements */}
        {settlements && settlements.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Suggested Payments</p>
            {settlements.map((s, i) => (
              <div key={`sug-${i}`} className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all shadow-inner group">
                <div className="flex items-center gap-2 min-w-0">
                  <MemberAvatar name={s.from} index={memberIndex(s.from)} size="sm" />
                  <span className="text-sm font-medium text-red-400">{s.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-white">₹{(s.amount || 0).toFixed(2)}</span>
                  <ArrowRight size={16} className="text-slate-500" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <MemberAvatar name={s.to} index={memberIndex(s.to)} size="sm" />
                  <span className="text-sm font-medium text-emerald-400">{s.to}</span>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  {hasEditAccess && (
                    <button 
                      onClick={() => onSettle(s)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 transition-all text-xs font-semibold"
                      title="Mark as Paid"
                    >
                      <Circle size={14} /> Done
                    </button>
                  )}
                  <UpiPayButton payeeName={s.to} payeeUpiId={s.upiId} amount={s.amount} onSetUpi={onSetUpi} />
                </div>
              </div>
            ))}
          </div>
        ) : !completedSettlements?.length ? (
          <div className="py-6 text-center">
            <Handshake size={40} className="mx-auto mb-3 text-emerald-500/50" />
            <p className="text-emerald-400 font-semibold text-sm">All settled! 🎉</p>
            <p className="text-slate-500 text-xs mt-1">No payments needed.</p>
          </div>
        ) : null}

        {/* Completed Settlements */}
        {completedSettlements && completedSettlements.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Settled Payments</p>
            {completedSettlements.map((s, i) => (
              <div key={`comp-${i}`} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 opacity-80">
                <div className="flex items-center gap-2 min-w-0">
                  <MemberAvatar name={s.from} index={memberIndex(s.from)} size="xs" />
                  <span className="text-xs font-medium text-slate-400">{s.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400/70">₹{(s.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <MemberAvatar name={s.to} index={memberIndex(s.to)} size="xs" />
                  <span className="text-xs font-medium text-slate-400">{s.to}</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-emerald-400/80">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Payment Done</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
