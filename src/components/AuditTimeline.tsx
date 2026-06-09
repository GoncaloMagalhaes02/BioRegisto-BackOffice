import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CircleCheck, CircleX, Plus, Pencil, RotateCcw } from "lucide-react";

import { type AuditEntry } from "@/types";

const actionConfig: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  CREATED: {
    icon: <Plus size={14} />,
    color: "bg-stone-100 text-stone-600",
    label: "Criada",
  },
  VALIDATED: {
    icon: <CircleCheck size={14} />,
    color: "bg-green-100 text-green-600",
    label: "Validada",
  },
  REJECTED: {
    icon: <CircleX size={14} />,
    color: "bg-red-100 text-red-600",
    label: "Rejeitada",
  },
  EDITED: {
    icon: <Pencil size={14} />,
    color: "bg-blue-100 text-blue-600",
    label: "Editada",
  },
  REOPENED: {
    icon: <RotateCcw size={14} />,
    color: "bg-orange-100 text-orange-600",
    label: "Reaberta",
  },
};

export default function AuditTimeline({
  observationId,
}: {
  observationId: string;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const { data, error } = await supabase.rpc("get_observation_audit", {
          p_observation_id: observationId,
        });
        if (error) throw error;
        setEntries(data || []);
      } catch (error) {
        console.log("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [observationId]);

  function formatDateTime(date: string) {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  if (loading) {
    return <p className="text-sm text-stone-400">A carregar histórico...</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-stone-400">Sem histórico de ações.</p>;
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => {
        const config = actionConfig[entry.action] || actionConfig.CREATED;
        const isLast = index === entries.length - 1;

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Linha vertical + ícone */}
            <div className="flex flex-col items-center">
              <div className={`p-1.5 rounded-full ${config.color}`}>
                {config.icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-stone-200 my-1" />}
            </div>

            {/* Conteúdo */}
            <div className={`flex-1 ${!isLast ? "pb-4" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-stone-400">
                  {formatDateTime(entry.created_at)}
                </span>
              </div>

              {entry.technician_full_name && (
                <p className="text-xs text-stone-500 mt-0.5">
                  por {entry.technician_full_name} (@{entry.technician_username}
                  )
                </p>
              )}

              {entry.rejection_reason && (
                <div className="mt-2 text-xs bg-red-50 border border-red-100 rounded-lg p-2 text-red-700">
                  <span className="font-medium">Motivo: </span>
                  {entry.rejection_reason}
                </div>
              )}

              {entry.notes && (
                <div className="mt-2 text-xs bg-stone-50 border border-stone-100 rounded-lg p-2 text-stone-600">
                  <span className="font-medium">Notas: </span>
                  {entry.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
