import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useObservationStats() {
  const [observacoes, setObservacoes] = useState(0);
  const [validadas, setValidadas] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [rejeitadas, setRejeitadas] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [total, validated, pending, rejected] = await Promise.all([
        supabase
          .from("observations")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("observations")
          .select("id", { count: "exact", head: true })
          .eq("status", "VALIDATED"),
        supabase
          .from("observations")
          .select("id", { count: "exact", head: true })
          .eq("status", "PENDING"),
        supabase
          .from("observations")
          .select("id", { count: "exact", head: true })
          .eq("status", "REJECTED"),
      ]);
      setObservacoes(total.count || 0);
      setValidadas(validated.count || 0);
      setPendentes(pending.count || 0);
      setRejeitadas(rejected.count || 0);
    } catch (error) {
      console.log("Erro ao carregar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    observacoes,
    validadas,
    pendentes,
    rejeitadas,
    loading,
    refetch: loadStats,
  };
}
