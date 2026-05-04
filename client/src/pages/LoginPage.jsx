import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../utils/api";
import { ArrowLeft, User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import LegendaryBackground from "../components/LegendaryBackground";
import Logo from "../components/Logo.jsx";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!isLogin && !name) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email address is required.";
    if (!password) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      return setErrors(newErrors);
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await loginUser({ email, password });
        login(data, data.token);
      } else {
        const { data } = await registerUser({ name, email, password });
        login(data, data.token);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const apiError = err.response?.data?.error || "Authentication failed.";
      if (apiError.toLowerCase().includes("email")) {
        setErrors({ email: apiError });
      } else if (apiError.toLowerCase().includes("password")) {
        setErrors({ password: apiError });
      } else if (apiError.toLowerCase().includes("name")) {
        setErrors({ name: apiError });
      } else {
        setErrors({ general: apiError });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <LegendaryBackground />

      <div className="w-full max-w-[360px] mx-auto relative z-10 animate-fade-in-up" style={{ filter: 'drop-shadow(0 0 40px rgba(34,211,238,0.12))' }}>
        {/* Top glowing accent bar */}
        <div className="h-[2px] w-full rounded-t-2xl bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        
        <div className="glass border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(34,211,238,0.08)]">
          <div className="px-6 py-7 sm:px-7 sm:py-8 w-full flex flex-col">
            <div className="w-full mb-4">
              <button onClick={() => navigate("/")} className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 text-xs font-semibold transition-colors group w-fit">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
              </button>
            </div>
            
            <div className="text-center w-full mb-5 flex flex-col items-center">
              {/* App name */}
              <div className="flex flex-col items-center justify-center mb-4">
                <Logo size="lg" className="mb-3" />
                <span className="text-lg font-black tracking-widest uppercase bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text text-transparent" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.18em' }}>SplitWise Pro</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {isLogin ? "Welcome Back" : "Join the Journey"}
              </h2>
              <div className="h-[2px] w-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full mb-3" />
              <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
                {isLogin ? "Sign in to manage your shared adventures & expenses." : "Create an account and start splitting bills globally."}
              </p>
            </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full text-left">
          {!isLogin && (
            <div className="w-full flex flex-col gap-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest">Name</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className={`transition-colors ${errors.name ? "text-red-400" : "text-cyan-500"}`} />
                </div>
                <input
                  type="text"
                  className={`input !pl-11 !py-2.5 w-full text-sm ${errors.name ? "!border-red-500/50 focus:!border-red-500 !bg-red-500/5" : ""}`}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name || errors.general) setErrors(prev => ({ ...prev, name: null, general: null }));
                  }}
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium animate-fade-in mt-[-2px]">
                  <AlertCircle size={14} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="w-full flex flex-col gap-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest">Email Address</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className={`transition-colors ${errors.email ? "text-red-400" : "text-cyan-500"}`} />
              </div>
              <input
                type="email"
                className={`input !pl-11 !py-2.5 w-full text-sm ${errors.email ? "!border-red-500/50 focus:!border-red-500 !bg-red-500/5" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.general) setErrors(prev => ({ ...prev, email: null, general: null }));
                }}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium animate-fade-in mt-[-2px]">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest">Password</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className={`transition-colors ${errors.password ? "text-red-400" : "text-cyan-500"}`} />
              </div>
              <input
                type="password"
                className={`input !pl-11 !py-2.5 w-full text-sm ${errors.password ? "!border-red-500/50 focus:!border-red-500 !bg-red-500/5" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.general) setErrors(prev => ({ ...prev, password: null, general: null }));
                }}
              />
            </div>
            {errors.password && (
              <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium animate-fade-in mt-[-2px]">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {errors.general && (
            <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-fade-in backdrop-blur-md shadow-inner shadow-red-500/10">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-medium tracking-wide leading-relaxed">{errors.general}</p>
            </div>
          )}

          <div className="pt-2 w-full">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-2.5 text-base font-bold shadow-glow"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </button>
          </div>
        </form>

          <div className="mt-5 text-center text-sm text-slate-400 w-full pt-4 border-t border-white/5">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-2 uppercase tracking-wider"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
