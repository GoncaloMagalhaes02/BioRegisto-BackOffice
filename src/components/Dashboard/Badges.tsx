import { useEffect, useState } from "react";
import { Eye, CircleCheck, Clock, CircleX } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { type Stats } from "@/types";

function TrendText({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) {
  const sign = value > 0 ? "+" : "";
  return (
    <p className={colorClass}>
      {sign}
      {value}% vs mês anterior
    </p>
  );
}

function Badges() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc(
        "get_dashboard_stats_with_trend",
      );
      if (!error && data) {
        setStats(data[0]);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-6 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[140px] bg-white rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      <div className="flex flex-col p-5 bg-white relative rounded-lg">
        <h3 className="text-gray-600">Total de observações</h3>
        <p className="font-bold text-4xl pb-5 pt-1">{stats.total}</p>
        <TrendText value={stats.total_trend} colorClass="text-gray-400" />
        <div className="absolute right-8 top-9 bg-gray-200 p-2 rounded-sm">
          <Eye />
        </div>
      </div>

      <div className="flex flex-col p-5 bg-white relative rounded-lg">
        <h3 className="text-gray-600">Validadas</h3>
        <p className="font-bold text-green-400 text-4xl pb-5 pt-1">
          {stats.validated}
        </p>
        <TrendText value={stats.validated_trend} colorClass="text-green-500" />
        <div className="absolute right-8 top-9 bg-green-100 p-2 rounded-sm">
          <CircleCheck color="#46e30d" />
        </div>
      </div>

      <div className="flex flex-col p-5 bg-white relative rounded-lg">
        <h3 className="text-gray-600">Pendentes</h3>
        <p className="font-bold text-orange-400 text-4xl pb-5 pt-1">
          {stats.pending}
        </p>
        <TrendText value={stats.pending_trend} colorClass="text-orange-500" />
        <div className="absolute right-8 top-9 bg-orange-100 p-2 rounded-sm">
          <Clock color="#f88a0d" />
        </div>
      </div>

      <div className="flex flex-col p-5 bg-white relative rounded-lg">
        <h3 className="text-gray-600">Rejeitadas</h3>
        <p className="font-bold text-red-600 text-4xl pb-5 pt-1">
          {stats.rejected}
        </p>
        <TrendText value={stats.rejected_trend} colorClass="text-red-400" />
        <div className="absolute right-8 top-9 bg-red-100 p-2 rounded-sm">
          <CircleX color="#fe0101" />
        </div>
      </div>
    </div>
  );
}

export default Badges;
