import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  Eye,
  CircleCheck,
  Clock,
  CircleX,
  Leaf,
  Users,
  ShieldCheck,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import Avatar from "@/components/Avatar";
import { CardSkeleton } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";

interface GlobalStats {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
  total_species: number;
  total_users: number;
  protected_species: number;
}

const KINGDOM_COLORS: Record<string, string> = {
  ANIMALIA: "#F59E0B",
  PLANTAE: "#10B981",
  FUNGI: "#F97316",
};

const KINGDOM_LABELS: Record<string, string> = {
  ANIMALIA: "Animais",
  PLANTAE: "Plantas",
  FUNGI: "Fungos",
};

function StatCard({
  icon,
  label,
  value,
  color = "stone",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    stone: "bg-stone-100 text-stone-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone-500 uppercase">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function Statistics() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [byMonth, setByMonth] = useState<any[]>([]);
  const [byKingdom, setByKingdom] = useState<any[]>([]);
  const [topObservers, setTopObservers] = useState<any[]>([]);
  const [topSpecies, setTopSpecies] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const [
        { data: globalData },
        { data: monthData },
        { data: kingdomData },
        { data: observersData },
        { data: speciesData },
      ] = await Promise.all([
        supabase.rpc("get_global_stats"),
        supabase.rpc("get_observations_by_month"),
        supabase.rpc("get_observations_by_kingdom"),
        supabase.rpc("get_top_observers", { p_limit: 5 }),
        supabase.rpc("get_top_species", { p_limit: 5 }),
      ]);

      setStats(globalData?.[0] ?? null);
      setByMonth(
        (monthData ?? []).map((m: any) => ({
          ...m,
          month: new Date(m.month + "-01").toLocaleDateString("pt-PT", {
            month: "short",
            year: "2-digit",
          }),
        })),
      );
      setByKingdom(kingdomData ?? []);
      setTopObservers(observersData ?? []);
      setTopSpecies(speciesData ?? []);
    } catch (error) {
      console.error("Erro ao buscar as estatisticas", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchAll();
  }, [user, authLoading]);

  return (
    <>
      <header>
        <h2 className="font-medium text-xl">Estatísticas</h2>
        <p className="text-sm text-stone-500 mt-1">
          Visão geral da plataforma BioRegisto
        </p>
      </header>

      {loading ? (
        <div className="mt-6 space-y-4">
          <CardSkeleton count={4} />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-[340px] bg-white rounded-lg animate-pulse" />
            <div className="h-[340px] bg-white rounded-lg animate-pulse" />
          </div>
        </div>
      ) : error || !stats ? (
        <div className="mt-6">
          <ErrorState onRetry={fetchAll} />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard
              icon={<Eye size={20} />}
              label="Total observações"
              value={stats.total}
              color="stone"
            />
            <StatCard
              icon={<CircleCheck size={20} />}
              label="Validadas"
              value={stats.validated}
              color="green"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Pendentes"
              value={stats.pending}
              color="orange"
            />
            <StatCard
              icon={<CircleX size={20} />}
              label="Rejeitadas"
              value={stats.rejected}
              color="red"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <StatCard
              icon={<Leaf size={20} />}
              label="Espécies catalogadas"
              value={stats.total_species}
              color="green"
            />
            <StatCard
              icon={<ShieldCheck size={20} />}
              label="Espécies protegidas"
              value={stats.protected_species}
              color="purple"
            />
            <StatCard
              icon={<Users size={20} />}
              label="Utilizadores"
              value={stats.total_users}
              color="blue"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <section className="bg-white rounded-lg border border-stone-200 p-5">
              <h3 className="font-medium mb-4">Observações por mês</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6B7280"
                    strokeWidth={2}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="validated"
                    stroke="#2D5A3D"
                    strokeWidth={2}
                    name="Validadas"
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="bg-white rounded-lg border border-stone-200 p-5">
              <h3 className="font-medium mb-4">Distribuição por reino</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byKingdom.map((k) => ({
                      ...k,
                      name: KINGDOM_LABELS[k.kingdom],
                    }))}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byKingdom.map((k) => (
                      <Cell key={k.kingdom} fill={KINGDOM_COLORS[k.kingdom]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </section>
          </div>

          {/* Top observadores e espécies */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <section className="bg-white rounded-lg border border-stone-200 p-5">
              <h3 className="font-medium mb-4">Top observadores</h3>
              <div className="space-y-3">
                {topObservers.length > 0 ? (
                  topObservers.map((obs, i) => (
                    <Link
                      key={obs.user_id}
                      to={`/users/${obs.user_id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500">
                        {i + 1}
                      </span>
                      <Avatar name={obs.username} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {obs.full_name}
                        </p>
                        <p className="text-xs text-stone-500">
                          @{obs.username}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{obs.total}</p>
                        <p className="text-xs text-stone-400">
                          {obs.validated} val.
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-stone-400 text-center py-4">
                    Sem observadores ainda.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-white rounded-lg border border-stone-200 p-5">
              <h3 className="font-medium mb-4">Espécies mais observadas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topSpecies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="common_name_pt"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {topSpecies.map((s) => (
                      <Cell
                        key={s.species_id}
                        fill={KINGDOM_COLORS[s.kingdom]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </>
      )}
    </>
  );
}
