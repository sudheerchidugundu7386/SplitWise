import { useState } from "react";
import { Link } from "react-router-dom";
import CreateGroupForm from "../components/CreateGroupForm.jsx";
import UserProfileModal from "../components/UserProfileModal.jsx";
import Logo from "../components/Logo.jsx";
import { Split, Users, Smartphone, FileText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * HomePage — Landing page with hero section and group creation form.
 */
export default function HomePage() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

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
      <div className="gradient-orb w-[500px] h-[500px] bg-purple-600 top-[-10%] left-[-10%] animate-aurora" />
      <div className="gradient-orb w-[400px] h-[400px] bg-cyan-500 bottom-[10%] right-[-5%] animate-aurora" style={{ animationDelay: "2s" }} />
      <div className="gradient-orb w-[300px] h-[300px] bg-pink-500 top-[40%] left-[60%] animate-aurora" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-semibold mb-6 shadow-glow">
            <Split size={14} />
            Smart Bill Splitting
          </div>
          <div className="flex flex-col items-center gap-4 mb-4">
            <Logo size="xl" className="shadow-glow" />
            <h1 className="text-4xl sm:text-6xl font-extrabold">
              <span className="gradient-text">SplitWise</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Split group expenses fairly. Settle dues instantly with UPI.
            <br className="hidden sm:block" />
            No login needed — just share the link.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {[
            { icon: Users, label: "Groups of 2–10" },
            { icon: Split, label: "Equal & Custom Splits" },
            { icon: Smartphone, label: "UPI Payments" },
            { icon: FileText, label: "PDF Export" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium shadow-xl">
              <Icon size={12} className="text-cyan-400" />
              {label}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <CreateGroupForm />
        </div>
      </div>

      {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
