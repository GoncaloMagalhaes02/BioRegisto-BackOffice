import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/lib/supabaseClient";
import { MoveLeft, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { type Observation } from "@/types";
import { Input } from "@/components/ui/input";

function ValidateObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const getObservationById = async (id: string | undefined) => {
    if (!id) return;
    try {
      // Dados da observação via RPC (com lat/lng)
      const { data, error } = await supabase
        .rpc("get_observation_by_id", { p_id: id })
        .single();
      if (error) throw error;
      // Fotos separadas
      const { data: photos } = await supabase
        .from("photos")
        .select("id, url, is_primary, order_index")
        .eq("observation_id", id)
        .order("order_index");

      setObservation({ ...data, photos: photos || [] });
    } catch (error) {
      console.log("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = async (id: string | undefined) => {
    const { data, error } = await supabase.rpc("get_user_observation_stats", {
      p_observation_id: id,
    });

    if (error) throw error;
    console.log(data);
    setUserStats(data);
  };

  useEffect(() => {
    getObservationById(id);
    getUserStats(id);
  }, [id]);

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  if (loading) return <p>A carregar...</p>;
  if (!observation) return <p>Observação não encontrada</p>;

  return (
    <>
      <header>
        <div className="flex gap-5 items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-white  flex items-center px-2 py-1 rounded-lg hover:bg-stone-200 cursor-pointer"
          >
            <MoveLeft className="text-stone-400 w-5" />
          </button>
          <h2 className="font-medium text-xl">Validar Observação</h2>
          <StatusBadge status={observation.status} />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* Coluna esquerda — ocupa 2/3 */}
        <div className="col-span-2 space-y-6">
          {/* Fotografias */}
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-medium mb-4">
              Fotografias · {observation.photos?.length ?? 0}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {observation.photos && observation.photos.length > 0 ? (
                observation.photos.map((foto, index) => (
                  <div
                    key={foto.id}
                    className={index === 0 ? "col-span-2 row-span-2" : ""}
                  >
                    <img
                      src={foto.url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))
              ) : (
                <p className="col-span-3 text-stone-400 text-sm">
                  Não há fotos para mostrar
                </p>
              )}
            </div>
          </section>

          {/* Dados da observação */}
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-medium mb-4">Dados da observação</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-stone-500 uppercase">
                  Sugerido pelo observador
                </p>
                <p className="mt-1 text-sm">
                  {observation.suggested_species
                    ? observation.suggested_species
                    : "Não foi sugerido nada"}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase">
                  Data da observação
                </p>
                <p className="mt-1 text-sm">
                  {formatDate(observation.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase mt-1">
                  Coordenadas GPS
                </p>
                <p>
                  {observation.latitude !== null &&
                  observation.longitude !== null
                    ? `${observation.latitude?.toFixed(6)}° N, ${observation.longitude?.toFixed(6)}° W`
                    : "Sem coordenadas"}
                </p>
              </div>
              {/* ... */}
            </div>
          </section>

          {/* Localização + Observador (lado a lado) */}
          <div className="grid grid-cols-2 gap-6">
            <section className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-medium mb-4">Localização</h3>
              {/* mapa */}
            </section>
            {/* Perfil */}
            <section className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-medium mb-4">Observador</h3>
              <div className="border border-stone-100 p-3 flex flex-col items-center">
                <p>{observation.full_name}</p>
                <p className="text-green-700">@{observation.username}</p>
                <div className="flex gap-2 border border-stone-200 py-2 px-5 rounded-3xl mt-3">
                  <p className="text-xs text-stone-500 font-semibold">
                    {userStats[0].total_observations > 0 &&
                      userStats[0].total_observations + " observações"}
                  </p>
                  <p className="text-xs text-stone-500 font-semibold">
                    {userStats[0].validated_observations > 0 &&
                      " . " +
                        userStats[0].validated_observations +
                        " validadas"}
                  </p>
                </div>
                <Link
                  to={`/users/${observation.user_id}`}
                  className="mt-3 w-full border border-stone-200 text-center py-1"
                >
                  Ver perfil
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Coluna direita — ocupa 1/3 */}
        <div className="space-y-6">
          {/* Classificação taxonómica */}
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-medium mb-4">Classificação taxonómica</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Pesquisar espécie"
                className="pl-9 w-full bg-white"
              />
            </div>
          </section>

          {/* Notas do técnico */}
          <section className="bg-white rounded-lg border border-stone-100 p-6">
            <h3 className="font-medium mb-4">Notas do técnico</h3>
            <textarea
              className="w-full border border-stone-300 rounded-lg p-2"
              rows={3}
            />
          </section>

          {/* Botões de ação */}
          <section className="bg-white rounded-lg border border-stone-200 p-6 space-y-3">
            <button className="w-full bg-[#2D5A3D] text-white py-3 rounded-lg">
              Validar observação
            </button>
            <button className="w-full border border-red-200 text-red-600 py-3 rounded-lg">
              Rejeitar observação
            </button>
          </section>
        </div>
      </div>
    </>
  );
}

export default ValidateObservation;
