interface AvatarProps {
  name: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  size?: number; // tamanho em px
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-red-200 text-red-700",
    "bg-blue-200 text-blue-700",
    "bg-green-200 text-green-700",
    "bg-purple-200 text-purple-700",
    "bg-amber-200 text-amber-700",
    "bg-pink-200 text-pink-700",
    "bg-teal-200 text-teal-700",
    "bg-indigo-200 text-indigo-700",
    "bg-orange-200 text-orange-700",
  ];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function Avatar({
  name,
  username,
  avatarUrl,
  size = 36,
}: AvatarProps) {
  const displayName = name || username || "?";
  const initial = displayName[0].toUpperCase();
  const colorClass = getAvatarColor(displayName);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium flex-shrink-0 ${colorClass}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
