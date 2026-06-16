import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-12 flex flex-col items-center text-center">
      <div className="bg-stone-100 p-3 rounded-full mb-4">
        <Icon className="w-8 h-8 text-stone-400" />
      </div>
      <p className="font-medium text-stone-800">{title}</p>
      {description && (
        <p className="text-sm text-stone-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
