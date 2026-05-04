/**
 * MemberAvatar — Circular badge with member's initial and a
 * deterministic color from a curated 10-color palette.
 */

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-lime-500 to-green-500",
  "from-red-500 to-rose-500",
  "from-sky-500 to-indigo-500",
];

export default function MemberAvatar({ name, index = 0, size = "md" }) {
  const safeIndex = Math.max(0, index);
  const colorClass = AVATAR_COLORS[safeIndex % AVATAR_COLORS.length];

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-7 h-7 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0`}
      title={name}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}
