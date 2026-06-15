import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { MoveLeft, MapPin, Calendar, Mail } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { type Profile, type UserObs } from "@/types";
import Avatar from "@/components/Avatar";

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    USER: "bg-stone-100 text-stone-600",
    TECHNICIAN: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = {
    USER: "Utilizador",
    TECHNICIAN: "Técnico",
    ADMIN: "Admin",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}

export default function DetailUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [observations, setObservations] = useState<UserObs[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [{ data: profileData }, { data: obsData }] = await Promise.all([
          supabase.rpc("get_user_profile", { p_user_id: id }).single(),
          supabase.rpc("get_user_observations", { p_user_id: id }),
        ]);

        setProfile(profileData);
        setObservations(obsData || []);
      } catch (error) {
        console.log("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  }

  const filteredObs =
    statusFilter === "ALL"
      ? observations
      : observations.filter((o) => o.status === statusFilter);

  if (loading) return <p>A carregar...</p>;
  if (!profile) return <p>Utilizador não encontrado</p>;

  return (
    <>
      <header>
        <div className="flex gap-5 items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-white flex items-center px-2 py-1 rounded-lg hover:bg-stone-200 cursor-pointer"
          >
            <MoveLeft className="text-stone-400 w-5" />
          </button>
          <h2 className="font-medium text-xl">Perfil do Utilizador</h2>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* Coluna esquerda — perfil */}
        <div className="space-y-6">
          <section className="bg-white rounded-lg border border-stone-200 p-6 flex flex-col items-center">
            <Avatar
              name={profile.full_name}
              username={profile.username}
              avatarUrl={profile.avatar_url}
              size={100}
            />
            <h3 className="font-semibold text-lg mt-4">{profile.full_name}</h3>
            <p className="text-green-700 text-sm">@{profile.username}</p>
            <div className="mt-3">
              <RoleBadge role={profile.role} />
            </div>

            {!profile.is_active && (
              <span className="mt-2 text-xs text-red-500 font-medium">
                Conta desativada
              </span>
            )}

            {profile.bio && (
              <p className="text-sm text-stone-600 text-center mt-4">
                {profile.bio}
              </p>
            )}

            <div className="w-full mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-stone-500">
                <Mail size={14} />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-2 text-stone-500">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-stone-500">
                <Calendar size={14} />
                <span>Membro desde {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-medium mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">
                  {profile.total_observations}
                </p>
                <p className="text-xs text-stone-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {profile.validated_observations}
                </p>
                <p className="text-xs text-stone-500">Validadas</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {profile.pending_observations}
                </p>
                <p className="text-xs text-stone-500">Pendentes</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {profile.rejected_observations}
                </p>
                <p className="text-xs text-stone-500">Rejeitadas</p>
              </div>
            </div>
          </section>
        </div>

        {/* Coluna direita — observações */}
        <div className="col-span-2">
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                Observações ({filteredObs.length})
              </h3>

              {/* Tabs de filtro */}
              <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                {[
                  { value: "ALL", label: "Todas" },
                  { value: "VALIDATED", label: "Validadas" },
                  { value: "PENDING", label: "Pendentes" },
                  { value: "REJECTED", label: "Rejeitadas" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      statusFilter === tab.value
                        ? "bg-white text-stone-800 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredObs.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredObs.map((obs) => (
                  <Link
                    key={obs.id}
                    to={`/observations/${obs.id}`}
                    className="border border-stone-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {obs.photo_url ? (
                      <img
                        src={obs.photo_url}
                        alt=""
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
                        Sem foto
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium italic truncate">
                          {obs.scientific_name ??
                            obs.suggested_species ??
                            "Sem espécie"}
                        </p>
                      </div>
                      <p className="text-xs text-stone-400 mb-2">
                        {formatDate(obs.observed_at)}
                      </p>
                      <StatusBadge status={obs.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 text-sm text-center py-8">
                {statusFilter === "ALL"
                  ? "Este utilizador ainda não fez observações."
                  : "Nenhuma observação com este estado."}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
