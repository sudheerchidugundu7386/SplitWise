import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getGroup, getExpenses, getBalances as fetchBalances, updateMemberUpi, addMember, syncMemberExpenses, settlePayment } from "../utils/api.js";
import { exportPDF } from "../utils/pdf.js";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import BalanceSummary from "../components/BalanceSummary.jsx";
import SettlementList from "../components/SettlementList.jsx";
import MemberAvatar from "../components/MemberAvatar.jsx";
import UserProfileModal from "../components/UserProfileModal.jsx";
import { Share2, Download, ArrowLeft, Copy, Check, Users, Loader2, LogOut, UserPlus, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

/**
 * GroupDashboard — Main group view accessed via /group/:groupId.
 * Shows members, add expense form, expense list, balances, and settlements.
 */
export default function GroupDashboard() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [completedSettlements, setCompletedSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [upiModal, setUpiModal] = useState(null); // member name or null
  const [upiInput, setUpiInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [syncPrompt, setSyncPrompt] = useState(null);

  const { user, logout } = useAuth();

  // Fetch all data for this group
  const loadData = useCallback(async () => {
    try {
      const [groupRes, expRes, balRes] = await Promise.all([
        getGroup(groupId),
        getExpenses(groupId),
        fetchBalances(groupId),
      ]);
      setGroup(groupRes.data);
      setExpenses(expRes.data);
      setBalances(balRes.data.balances || []);
      setSettlements(balRes.data.settlements || []);
      setCompletedSettlements(balRes.data.completedSettlements || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copy shareable link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle PDF export
  const handleExport = () => {
    if (group) exportPDF(group, expenses, balances, settlements);
  };

  // Handle UPI ID update
  const handleSetUpi = (memberName) => {
    const member = group?.members.find((m) => m.name === memberName);
    setUpiInput(member?.upiId || "");
    setUpiModal(memberName);
  };

  const saveUpi = async () => {
    if (!upiModal) return;
    try {
      await updateMemberUpi(groupId, upiModal, upiInput.trim());
      setUpiModal(null);
      setUpiInput("");
      await loadData();
    } catch {
      alert("Failed to update UPI ID.");
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    try {
      await addMember(groupId, { name: newMemberName.trim() });
      const addedName = newMemberName.trim();
      setNewMemberName("");
      setAddMemberModal(false);
      await loadData();
      setSyncPrompt(addedName);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add member.");
    }
  };

  const handleSync = async () => {
    if (!syncPrompt) return;
    try {
      await syncMemberExpenses(groupId, syncPrompt);
      setSyncPrompt(null);
      await loadData();
    } catch {
      alert("Failed to sync expenses.");
    }
  };

  const handleSettle = async (s) => {
    try {
      await settlePayment(groupId, { from: s.from, to: s.to, amount: s.amount });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to settle payment.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <Loader2 size={40} className="text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading group...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 text-center max-w-md animate-fade-in-up">
          <p className="text-red-400 font-semibold mb-2">Group not found</p>
          <p className="text-slate-500 text-sm mb-4">{error || "This group doesn't exist or the link is invalid."}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 no-underline">
            <ArrowLeft size={16} /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  const totalExpenses = (expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const isCreator = group.createdBy === user?._id;
  const isMemberWithEditAccess = (group.members || []).some(
    (m) => m.email && m.email.toLowerCase() === user?.email?.toLowerCase()
  );
  const hasEditAccess = isCreator || isMemberWithEditAccess;

  return (
    <div className="gradient-bg min-h-screen relative overflow-hidden">
      {/* Navbar / Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-20">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 px-4 rounded-full backdrop-blur-md shadow-2xl">
          {user ? (
            <>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-sm hover:bg-cyan-500/30 transition-all cursor-pointer shrink-0"
                title="Your Profile"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
              <span className="text-sm font-semibold text-slate-200 pl-2 border-l border-white/10 hidden sm:block truncate max-w-[120px]">
                {user.name}
              </span>
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors no-underline px-2 py-1"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Decorative Aurora orbs */}
      <div className="gradient-orb w-[500px] h-[500px] bg-purple-600 top-[-10%] right-[-10%] animate-aurora" />
      <div className="gradient-orb w-[400px] h-[400px] bg-cyan-500 bottom-[20%] left-[-5%] animate-aurora" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-6 sm:pt-24 sm:pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-3 no-underline">
              <ArrowLeft size={12} /> Home
            </Link>
            <div className="flex items-center gap-3">
              <Logo size="sm" className="shadow-glow" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">{group.name}</h1>
            </div>
            <p className="text-sm text-slate-400">
              {(group.members || []).length} members · ₹{totalExpenses.toFixed(2)} total expenses & transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="btn-ghost flex items-center gap-2 text-xs" id="copy-link-btn">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              {copied ? "Copied!" : "Share Link"}
            </button>
            <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-xs" id="export-pdf-btn">
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Members row */}
        <div className="glass p-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-cyan-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Members</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {(group.members || []).map((m, i) => (
              <button
                key={m.name}
                onClick={() => handleSetUpi(m.name)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer shadow-lg"
                title={m.upiId ? `UPI: ${m.upiId}` : "Click to set UPI ID"}
              >
                <MemberAvatar name={m.name} index={i} size="sm" />
                <span className="text-sm text-slate-300">{m.name}</span>
                {m.upiId && <span className="text-[10px] text-teal-400 font-bold">UPI ✓</span>}
              </button>
            ))}
            {hasEditAccess && (
              <button
                onClick={() => setAddMemberModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Add Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Add Expense + Expense List */}
          <div className="space-y-6">
            {!hasEditAccess && (
              <div className="glass p-4 text-center border-amber-500/30 bg-amber-500/5">
                <p className="text-sm text-amber-400 font-medium">View-Only Mode</p>
                <p className="text-xs text-slate-400 mt-1">You must be the group creator or have your email added as a member to add expenses.</p>
              </div>
            )}
            {hasEditAccess && (
              <AddExpenseForm groupId={groupId} members={group.members} onExpenseAdded={loadData} />
            )}
            <ExpenseList expenses={expenses} members={group.members} onExpenseDeleted={loadData} hasEditAccess={hasEditAccess} />
          </div>

          {/* Right column: Balances + Settlements */}
          <div className="space-y-6">
            <BalanceSummary balances={balances} members={group.members} />
            <SettlementList 
              settlements={settlements} 
              completedSettlements={completedSettlements}
              members={group.members} 
              onSetUpi={handleSetUpi} 
              onSettle={handleSettle}
              hasEditAccess={hasEditAccess}
            />
          </div>
        </div>
      </div>

      {/* UPI ID Modal */}
      {upiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="glass p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-1">Set UPI ID</h3>
            <p className="text-sm text-slate-400 mb-4">Enter UPI ID for <span className="text-indigo-300 font-medium">{upiModal}</span></p>
            <input
              type="text"
              className="input mb-4"
              placeholder="e.g. name@upi"
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setUpiModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={saveUpi} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="glass p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-1">Add Member</h3>
            <p className="text-sm text-slate-400 mb-4">Enter the name of the new member.</p>
            <input
              type="text"
              className="input mb-4"
              placeholder="e.g. Charlie"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <div className="flex gap-3">
              <button onClick={() => setAddMemberModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleAddMember} className="btn-primary flex-1">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Retroactive Split Prompt */}
      {syncPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="glass p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-2">Split Existed Payments?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Do you want to add <span className="text-indigo-300 font-bold">{syncPrompt}</span> to all existing expenses? 
              This will divide the previous costs equally among all members (including the new person).
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleSync} className="btn-primary w-full py-3">Yes, Split All Existing</button>
              <button onClick={() => setSyncPrompt(null)} className="btn-ghost w-full">No, Keep as is</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
