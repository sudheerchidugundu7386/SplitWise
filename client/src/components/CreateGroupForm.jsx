import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../utils/api.js";
import { Plus, Minus, Users } from "lucide-react";

/**
 * CreateGroupForm — Lets the user enter a group name and 2–10 member names,
 * then creates the group and redirects to the group dashboard.
 */
export default function CreateGroupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "" }, { name: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addMember = () => {
    if (members.length < 10) setMembers([...members, { name: "", email: "" }]);
  };

  const removeMember = (idx) => {
    if (members.length > 2) setMembers(members.filter((_, i) => i !== idx));
  };

  const updateMember = (idx, field, value) => {
    const updated = [...members];
    updated[idx][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    // Validate that at least name is present
    const validMembers = members
      .filter((m) => m.name.trim())
      .map(m => ({ name: m.name.trim(), email: m.email.trim() }));

    if (!trimmedName) return setError("Please enter a group name.");
    if (validMembers.length < 2) return setError("Add at least 2 members.");

    // Check for duplicate names
    const uniqueNames = new Set(validMembers.map((m) => m.name.toLowerCase()));
    if (uniqueNames.size !== validMembers.length) return setError("Member names must be unique.");

    setLoading(true);
    try {
      const { data } = await createGroup({
        name: trimmedName,
        members: validMembers,
      });
      navigate(`/group/${data.groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 sm:p-8 w-full max-w-lg animate-fade-in-up shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
          <Users size={20} className="text-black" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Create a New Group</h2>
      </div>

      {/* Group name */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Group Name</label>
        <input
          id="group-name-input"
          type="text"
          className="input"
          placeholder='e.g. "Goa Trip 2025"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </div>

      {/* Members */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Members ({members.length}/10)
        </label>
        <div className="space-y-3 stagger-children">
          {members.map((member, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="w-7 h-7 mt-1.5 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 border border-cyan-500/30">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  className="input"
                  placeholder={`Member ${idx + 1} Name`}
                  value={member.name}
                  onChange={(e) => updateMember(idx, "name", e.target.value)}
                  maxLength={30}
                />
                <input
                  type="email"
                  className="input text-sm"
                  placeholder={`Email for edit access (optional)`}
                  value={member.email}
                  onChange={(e) => updateMember(idx, "email", e.target.value)}
                />
              </div>
              {members.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeMember(idx)}
                  className="w-8 h-8 mt-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors shrink-0"
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {members.length < 10 && (
          <button
            type="button"
            onClick={addMember}
            className="mt-3 btn-ghost flex items-center gap-2 text-sm"
          >
            <Plus size={14} /> Add Member
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="create-group-btn"
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Users size={16} /> Create Group
          </>
        )}
      </button>
    </form>
  );
}
