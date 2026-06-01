export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    VALIDATED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  };

  const labels: Record<string, string> = {
    PENDING: "Pendente",
    VALIDATED: "Validada",
    REJECTED: "Rejeitada",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
