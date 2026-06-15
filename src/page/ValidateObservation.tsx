import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/lib/supabaseClient";
import { MoveLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { type Observation } from "@/types";
import ObservationMap from "./ObservationMap";
import SpeciesSearch from "@/components/SpeciesSearch";
import CreateSpeciesModal from "@/components/CreateSpeciesModal";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Avatar from "@/components/Avatar";

import AuditTimeline from "@/components/AuditTimeline";
import { useStats } from "@/hooks/useObservationsStats";
function ValidateObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [userStats, setUserStats] = useState([]);
  const [speciesInfo, setSpeciesInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [speciesKey, setSpeciesKey] = useState(0);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const { refetch: refreshStats } = useStats();
  const [refreshKey, setRefreshKey] = useState(0);

  const getObservationById = async (id: string | undefined) => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .rpc("get_observation_by_id", { p_id: id })
        .single();
      if (error) throw error;

      const { data: photos } = await supabase
        .from("photos")
        .select("id, url, is_primary, order_index")
        .eq("observation_id", id)
        .order("order_index");

      setObservation({ ...data, photos: photos || [] });

      // Se a observação tem species_id, buscar dados completos da espécie
      if (data.species_id) {
        const { data: sp } = await supabase
          .rpc("get_species_full", { p_species_id: data.species_id })
          .single();
        setSpeciesInfo(sp);
      }
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
    setUserStats(data);
  };

  const handleValidate = async () => {
    if (!selectedSpecies) {
      toast.error("Seleciona uma espécie antes de validar.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("validate_observation", {
        p_observation_id: id,
        p_technician_id: user?.id,
        p_species_id: selectedSpecies,
        p_notes: notes || null,
      });

      if (error) throw error;
      toast.success("Observação validada com sucesso!", {
        description: "O utilizador será notificado.",
      });

      // Re-buscar a observação completa (status, espécie, etc.)
      await getObservationById(id);
      // Forçar refresh do histórico de auditoria
      setRefreshKey((prev) => prev + 1);
      await refreshStats();
      // Limpar inputs
      setNotes("");
    } catch (error) {
      console.log("Erro ao validar:", error);
      toast.error("Erro ao validar observação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Indica o motivo da rejeição.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("reject_observation", {
        p_observation_id: id,
        p_technician_id: user?.id,
        p_rejection_reason: rejectionReason,
        p_notes: notes || null,
      });

      if (error) throw error;
      toast.success("Observação rejeitada.", {
        description: "O utilizador foi notificado com o motivo.",
      });

      await getObservationById(id);
      await refreshStats();
      setRefreshKey((prev) => prev + 1);
      setShowRejectInput(false);
      setRejectionReason("");
      setNotes("");
    } catch (error) {
      console.log("Erro ao rejeitar:", error);
      toast.error("Erro ao rejeitar observação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpeciesCreated = (species: any) => {
    setSelectedSpecies(species.id);
    setSpeciesKey((prev) => prev + 1);
  };

  const handleReopen = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("reopen_observation", {
        p_observation_id: id,
        p_technician_id: user?.id,
      });

      if (error) throw error;
      toast.success("Observação reaberta.", {
        description: "Pode agora ser validada ou rejeitada novamente.",
      });

      // Repor estado local para PENDING
      setObservation((prev) =>
        prev ? { ...prev, status: "PENDING", species_id: null } : prev,
      );
      await getObservationById(id);
      setRefreshKey((prev) => prev + 1);
      setSpeciesInfo(null);
      setSelectedSpecies(null);
      setSpeciesKey((prev) => prev + 1);
    } catch (error) {
      console.log("Erro ao reabrir:", error);
      toast.error("Erro ao reabrir observação.");
    } finally {
      setSubmitting(false);
    }
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
            className="bg-white flex items-center px-2 py-1 rounded-lg hover:bg-stone-200 cursor-pointer"
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
            </div>
          </section>

          {/* Localização + Observador (lado a lado) */}
          <div className="grid grid-cols-2 gap-6">
            <section className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-medium mb-4">Localização</h3>
              {observation.latitude && observation.longitude ? (
                <ObservationMap
                  latitude={observation.latitude}
                  longitude={observation.longitude}
                />
              ) : (
                <p className="text-stone-400 text-sm">Sem localização</p>
              )}
            </section>

            <section className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-medium mb-4">Observador</h3>
              <div className="border border-stone-100 p-3 flex flex-col items-center">
                <Avatar
                  name={observation.full_name}
                  username={observation.username}
                  avatarUrl={observation.avatar_url}
                  size={50}
                />
                <p className="mt-2">{observation.full_name}</p>
                <p className="text-green-700">@{observation.username}</p>
                <div className="flex gap-2 border border-stone-200 py-2 px-5 rounded-3xl mt-3">
                  <p className="text-xs text-stone-500 font-semibold">
                    {userStats[0]?.total_observations > 0 &&
                      userStats[0].total_observations + " observações"}
                  </p>
                  <p className="text-xs text-stone-500 font-semibold">
                    {userStats[0]?.validated_observations > 0 &&
                      " · " +
                        userStats[0].validated_observations +
                        " validadas"}
                  </p>
                </div>
                <Link
                  to={`/users/${observation.user_id}`}
                  className="mt-3 w-full border border-stone-200 text-center py-1 rounded-lg text-sm hover:bg-stone-50"
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

            {observation.status === "PENDING" ? (
              <>
                <SpeciesSearch
                  key={speciesKey}
                  onSelect={(species) =>
                    setSelectedSpecies(species?.id ?? null)
                  }
                  disabled={false}
                />
                {!selectedSpecies && (
                  <CreateSpeciesModal onCreated={handleSpeciesCreated} />
                )}
              </>
            ) : speciesInfo ? (
              <>
                <p className="text-sm font-medium italic">
                  {speciesInfo.scientific_name}
                </p>
                <p className="text-xs text-stone-400 mb-4">
                  {speciesInfo.common_name_pt}
                </p>
                <div className="border-t border-stone-100 pt-3 space-y-2">
                  {[
                    ["Reino", speciesInfo.kingdom],
                    ["Filo", speciesInfo.phylum_name],
                    ["Classe", speciesInfo.class_name],
                    ["Ordem", speciesInfo.order_name],
                    ["Família", speciesInfo.family_name],
                    ["Género", speciesInfo.genus_name],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-stone-500">{label}</span>
                      <span
                        className={value ? "text-stone-800" : "text-stone-300"}
                      >
                        {value ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-stone-400 text-sm">Sem espécie associada</p>
            )}
          </section>

          {/* Notas do técnico */}
          <section className="bg-white rounded-lg border border-stone-100 p-6">
            <h3 className="font-medium mb-4">Notas do técnico</h3>
            <textarea
              className="w-full border border-stone-300 rounded-lg p-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicionar notas sobre esta observação..."
              disabled={observation.status !== "PENDING"}
            />
          </section>

          {/* Input de rejeição */}
          {showRejectInput && (
            <section className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="font-medium mb-4 text-red-600">
                Motivo da rejeição
              </h3>
              <textarea
                className="w-full border border-red-200 rounded-lg p-2 text-sm"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica ao utilizador porque a observação foi rejeitada..."
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    submitting
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-red-600 text-white cursor-pointer hover:bg-red-700"
                  }`}
                >
                  {submitting ? "A processar..." : "Confirmar rejeição"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 py-2 rounded-lg text-sm border border-stone-200 text-stone-600 cursor-pointer hover:bg-stone-50"
                >
                  Cancelar
                </button>
              </div>
            </section>
          )}

          {/* Botões de ação */}
          {/* Botões de ação */}
          <section className="bg-white rounded-lg border border-stone-200 p-6 space-y-3">
            <p className="text-xs text-stone-400">
              {observation.status === "PENDING"
                ? "Ao validar, a espécie é obrigatória. Ao rejeitar, será pedido um motivo."
                : `Esta observação já foi ${observation.status === "VALIDATED" ? "validada" : "rejeitada"}.`}
            </p>

            {observation.status === "PENDING" ? (
              <>
                <button
                  onClick={handleValidate}
                  disabled={submitting}
                  className={`w-full py-3 rounded-lg font-medium ${
                    !submitting
                      ? "bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d]"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "A processar..." : "Validar observação"}
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={submitting || showRejectInput}
                  className={`w-full py-3 rounded-lg font-medium ${
                    !submitting && !showRejectInput
                      ? "border border-red-200 text-red-600 cursor-pointer hover:bg-red-50"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  Rejeitar observação
                </button>
              </>
            ) : (
              <button
                onClick={handleReopen}
                disabled={submitting}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  !submitting
                    ? "border border-stone-300 text-stone-700 cursor-pointer hover:bg-stone-50"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {submitting ? "A processar..." : "Reabrir observação"}
              </button>
            )}
          </section>
          <section className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-medium mb-4">Histórico</h3>
            <AuditTimeline
              observationId={observation.id}
              refreshKey={refreshKey}
            />
          </section>
        </div>
      </div>
    </>
  );
}

export default ValidateObservation;
