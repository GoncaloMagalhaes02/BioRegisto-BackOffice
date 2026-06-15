import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Species {
  id: string;
  scientific_name: string;
  common_name_pt: string | null;
  kingdom: string;
  family_name: string | null;
  is_protected: boolean;
}

interface SpeciesSearchProps {
  onSelect: (species: Species | null) => void;
  disabled?: boolean;
}

function KingdomDot({ kingdom }: { kingdom: string }) {
  const colors: Record<string, string> = {
    ANIMALIA: "bg-amber-400",
    PLANTAE: "bg-green-500",
    FUNGI: "bg-orange-400",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[kingdom]}`} />
  );
}

export default function SpeciesSearch({
  onSelect,
  disabled,
}: SpeciesSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Species[]>([]);
  const [selected, setSelected] = useState<Species | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("species")
        .select(
          "id, scientific_name, common_name_pt, kingdom, is_protected, genera(name, families(name))",
        )
        .or(`scientific_name.ilike.%${query}%,common_name_pt.ilike.%${query}%`)
        .order("scientific_name")
        .limit(8);

      if (error) {
        console.log("Erro na pesquisa:", error);
        return;
      }

      if (data) {
        // Achatar o family_name do join aninhado
        const mapped = data.map((sp: any) => ({
          id: sp.id,
          scientific_name: sp.scientific_name,
          common_name_pt: sp.common_name_pt,
          kingdom: sp.kingdom,
          is_protected: sp.is_protected,
          family_name: sp.genera?.families?.name ?? null,
        }));
        setResults(mapped);
        setOpen(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (species: Species) => {
    setSelected(species);
    setQuery("");
    setOpen(false);
    onSelect(species);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    onSelect(null);
  };

  if (selected) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <KingdomDot kingdom={selected.kingdom} />
              <p className="font-medium text-sm italic">
                {selected.scientific_name}
              </p>
              {selected.is_protected && (
                <ShieldCheck size={14} className="text-green-600" />
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {selected.common_name_pt} · {selected.family_name ?? "—"}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              Alterar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
      <Input
        placeholder="Pesquisar espécie..."
        className="pl-9 w-full bg-white"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        disabled={disabled}
      />

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
          {results.map((sp) => (
            <button
              key={sp.id}
              onClick={() => handleSelect(sp)}
              className="w-full px-3 py-2.5 text-left hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-none"
            >
              <div className="flex items-center gap-2">
                <KingdomDot kingdom={sp.kingdom} />
                <span className="text-sm font-medium italic">
                  {sp.scientific_name}
                </span>
                {sp.is_protected && (
                  <ShieldCheck size={12} className="text-green-600" />
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5 ml-4">
                {sp.common_name_pt ?? "—"} · {sp.family_name ?? "—"}
              </p>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-stone-400 text-center">
            Nenhuma espécie encontrada
          </p>
        </div>
      )}
    </div>
  );
}
