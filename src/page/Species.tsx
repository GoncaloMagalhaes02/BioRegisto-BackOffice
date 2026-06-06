import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Search, Pencil, Trash2, ShieldCheck, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Link } from "react-router-dom";

interface Species {
  id: string;
  scientific_name: string;
  common_name_pt: string | null;
  common_name_en: string | null;
  kingdom: string;
  family: string | null;
  is_protected: boolean;
  observation_count: number;
}

function KingdomBadge({ kingdom }: { kingdom: string }) {
  const styles: Record<string, string> = {
    ANIMALIA: "bg-cyan-100 text-cyan-700",
    PLANTAE: "bg-green-100 text-green-700",
    FUNGI: "bg-orange-100 text-orange-700",
  };

  const labels: Record<string, string> = {
    ANIMALIA: "Animalia",
    PLANTAE: "Plantae",
    FUNGI: "Fungi",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[kingdom]}`}
    >
      {labels[kingdom]}
    </span>
  );
}

export default function Species() {
  const { loading: authLoading, user } = useAuth();
  const [species, setSpecies] = useState<Species[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [kingdom, setKingdom] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Debounce da pesquisa
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Buscar espécies
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchSpecies = async () => {
      try {
        const { data, error } = await supabase.rpc("get_species_with_count");
        if (error) throw error;

        let filtered = data || [];

        if (kingdom !== "ALL") {
          filtered = filtered.filter((s: Species) => s.kingdom === kingdom);
        }

        if (search.trim() !== "") {
          const term = search.toLowerCase();
          filtered = filtered.filter(
            (s: Species) =>
              s.scientific_name?.toLowerCase().includes(term) ||
              s.common_name_pt?.toLowerCase().includes(term),
          );
        }

        setSpecies(filtered);
        setCurrentPage(1);
      } catch (error) {
        console.log("Erro ao buscar espécies:", error);
      }
    };

    fetchSpecies();
  }, [user, authLoading, kingdom, search]);

  // Paginação
  const totalPages = Math.ceil(species.length / itemsPerPage);
  const paginatedSpecies = species.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <>
      <header className="flex items-center justify-between">
        <h2 className="font-medium text-xl">Espécies</h2>
        <Link to={"/species-create"}>
          <button className="bg-[#2D5A3D] text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#1f4a2d]">
            <Plus size={16} />
            Adicionar espécie
          </button>
        </Link>
      </header>

      {/* Filtros */}
      <section className="mt-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              className="pl-9 w-full bg-white"
              placeholder="Pesquisar por nome científico ou comum..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select onValueChange={setKingdom}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Todos os reinos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos os reinos</SelectItem>
                  <SelectItem value="ANIMALIA">Animalia</SelectItem>
                  <SelectItem value="PLANTAE">Plantae</SelectItem>
                  <SelectItem value="FUNGI">Fungi</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Tabela */}
      <div className="mt-5">
        <Table className="bg-white">
          <TableHeader className="bg-stone-100">
            <TableRow>
              <TableHead>Nome Científico</TableHead>
              <TableHead>Nome Comum (PT)</TableHead>
              <TableHead>Reino</TableHead>
              <TableHead>Família</TableHead>
              <TableHead>Protegida</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSpecies.length > 0 ? (
              <>
                {paginatedSpecies.map((sp) => (
                  <TableRow key={sp.id} className="h-[60px]">
                    <TableCell className="font-medium italic">
                      {sp.scientific_name}
                    </TableCell>
                    <TableCell>{sp.common_name_pt ?? "—"}</TableCell>
                    <TableCell>
                      <KingdomBadge kingdom={sp.kingdom} />
                    </TableCell>
                    <TableCell>{sp.family ?? "—"}</TableCell>
                    <TableCell>
                      {sp.is_protected ? (
                        <ShieldCheck size={18} className="text-green-600" />
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>{sp.observation_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button className="text-stone-400 hover:text-stone-600 cursor-pointer">
                          <Pencil size={16} />
                        </button>
                        <button className="text-stone-400 hover:text-red-500 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Linhas vazias */}
                {Array.from({
                  length: itemsPerPage - paginatedSpecies.length,
                }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="h-[60px] hover:bg-transparent border-none"
                  >
                    <TableCell colSpan={7}></TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <>
                <TableRow className="h-[60px]">
                  <TableCell colSpan={7} className="text-center text-stone-400">
                    Nenhuma espécie encontrada.
                  </TableCell>
                </TableRow>
                {Array.from({ length: itemsPerPage - 1 }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="h-[60px] hover:bg-transparent border-none"
                  >
                    <TableCell colSpan={7}></TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-stone-200">
            <p className="text-sm text-stone-500">
              Página {currentPage} de {totalPages}
            </p>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}
