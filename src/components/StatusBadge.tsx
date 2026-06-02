import { CircleCheck, Clock, CircleX } from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-orange-50 text-orange-500 border-orange-100",
    VALIDATED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-600 border-red-200",
  };

  const labels: Record<string, string> = {
    PENDING: "Pendente",
    VALIDATED: "Validada",
    REJECTED: "Rejeitada",
  };

  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock size={14} />,
    VALIDATED: <CircleCheck color="oklch(44.8% 0.119 151.328)" size={14} />,
    REJECTED: <CircleX color="oklch(57.7% 0.245 27.325)" size={14} />,
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[status]}`}
    >
      {icons[status]}
      <span>{labels[status]}</span>
    </div>
  );
}
