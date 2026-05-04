import { useState, useEffect } from "react";
import { X, Map, CheckCircle, XCircle, Loader2, Plus } from "lucide-react";
import { getUserProfile } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function UserProfileModal({ onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      {/* Invisible overlay to close on click outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Dropdown */}
      <div className="fixed top-20 right-4 z-50 w-80 glass p-5 animate-fade-in-up flex flex-col max-h-[calc(100vh-120px)] shadow-2xl border-cyan-500/20 shadow-cyan-500/10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.user?.name || "Your Profile"}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.user?.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 size={32} className="text-indigo-400 animate-spin mb-2" />
            <p className="text-sm text-slate-400">Loading your trips...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center gap-2 mb-3">
              <Map size={14} className="text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Trips ({profile.trips.length})
              </h3>
            </div>
            
            {profile.trips.length === 0 ? (
              <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5">
                <p className="text-slate-400 text-xs">You haven't joined any trips yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5 stagger-children">
                {profile.trips.map((trip) => {
                  const isPos = trip.netBalance > 0.01;
                  const isNeg = trip.netBalance < -0.01;
                  const settled = trip.isSettled || (!isPos && !isNeg);
                  
                  return (
                    <div 
                      key={trip.groupId}
                      onClick={() => {
                        onClose();
                        navigate(`/group/${trip.groupId}`);
                      }}
                      className="glass p-3 cursor-pointer hover:bg-white/10 border-white/5 hover:border-cyan-500/40 transition-all group flex items-center justify-between rounded-xl shadow-none"
                    >
                      <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate pr-3">
                        {trip.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 bg-white/5 px-2 py-1 rounded-md group-hover:bg-white/10 transition-colors">
                        {settled ? (
                          <>
                            <CheckCircle size={12} className="text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">Settled</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="text-red-400" />
                            <span className="text-xs font-bold text-red-400">Unsettled</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-white/5">
          <button 
            onClick={() => {
              onClose();
              navigate("/");
            }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <Plus size={16} /> Create New Trip
          </button>
        </div>
      </div>
    </>
  );
}
