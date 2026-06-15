import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

interface StatsContextType {
  observacoes: number;
  validadas: number;
  pendentes: number;
  rejeitadas: number;
  reinos: string[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [observacoes, setObservacoes] = useState(0);
  const [validadas, setValidadas] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [rejeitadas, setRejeitadas] = useState(0);
  const [reinos, setReinos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
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
  }, []);

  const loadReinos = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("species").select("kingdom");
      if (error) throw error;
      const unique = [...new Set(data.map((s) => s.kingdom))];
      setReinos(unique);
    } catch (error) {
      console.log("Erro ao buscar reinos:", error);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    loadStats();
    loadReinos();
  }, [user, authLoading, loadStats, loadReinos]);

  return (
    <StatsContext.Provider
      value={{
        observacoes,
        validadas,
        pendentes,
        rejeitadas,
        reinos,
        loading,
        refetch: loadStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStats deve ser usado dentro de um StatsProvider");
  }
  return context;
}
