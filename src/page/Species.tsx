import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  Plus,
  BrushCleaning,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

import { type Species } from "@/types";
import { TableSkeleton } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pages, setPages] = useState("8");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("species")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setSpecies((prev) => prev.filter((sp) => sp.id !== deleteId));
      toast.success("Espécie eliminada com sucesso!");
      setDeleteId(null);
    } catch (error: any) {
      if (error?.code === "23503") {
        toast.error("Não é possível eliminar esta espécie.", {
          description: "Existem observações associadas a ela.",
        });
      } else {
        toast.error("Erro ao eliminar espécie.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const fetchSpecies = async () => {
    setLoading(true);
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
      console.error("Erro ao buscar espécies:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Buscar espécies
  useEffect(() => {
    if (authLoading || !user) return;
    fetchSpecies();
  }, [user, authLoading, kingdom, search]);

  // Paginação

  const itemsPerPage = Number(pages);
  const totalPages = Math.ceil(species.length / itemsPerPage);
  const paginatedSpecies = species.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePagesChange = (v: string) => {
    setPages(v);
    setCurrentPage(1); // volta à primeira página
  };

  const clearFilters = () => {
    setKingdom("ALL");
    setCurrentPage(1);
  };

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
            <Select value={kingdom} onValueChange={setKingdom}>
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

          <div className="w-full md:w-48">
            <Select value={pages} onValueChange={handlePagesChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Número por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="8">8 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Limpar filtros */}
          <button
            onClick={clearFilters}
            className="text-xs text-stone-500 hover:text-stone-700 cursor-pointer underline ml-auto"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {/* Tabela */}
      {loading ? (
        <TableSkeleton rows={7} cols={8} />
      ) : error ? (
        <ErrorState onRetry={fetchSpecies} />
      ) : species.length === 0 ? (
        <EmptyState
          icon={BrushCleaning}
          title="Sem espécies"
          description="Nenhuma espécie corresponde aos filtros selecionados."
        />
      ) : (
        <div className="mt-5">
          <Table className="bg-white">
            <TableHeader className="bg-stone-100">
              <TableRow>
                <TableHead>Nome Científico</TableHead>
                <TableHead>Nome Comum (PT)</TableHead>
                <TableHead>Reino</TableHead>
                <TableHead>Género</TableHead>
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
                      <TableCell className="italic">
                        {sp.genus_name ?? "—"}
                      </TableCell>
                      <TableCell>{sp.family_name ?? "—"}</TableCell>
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
                            <Link to={`/species/${sp.id}`}>
                              <Pencil size={16} />
                            </Link>
                          </button>
                          <button
                            onClick={() => setDeleteId(sp.id)}
                            className="text-stone-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Linhas vazias */}
                  {totalPages > 1 &&
                    Array.from({
                      length: itemsPerPage - paginatedSpecies.length,
                    }).map((_, i) => (
                      <TableRow
                        key={`empty-${i}`}
                        className="h-[60px] hover:bg-transparent border-none"
                      >
                        <TableCell colSpan={7} className="py-0"></TableCell>{" "}
                        {/* ← ajusta o colSpan para o nº de colunas da tabela de espécies */}
                      </TableRow>
                    ))}
                </>
              ) : (
                <>
                  <TableRow className="h-[60px]">
                    <TableCell
                      colSpan={7}
                      className="text-center text-stone-400"
                    >
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
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar espécie</DialogTitle>
            <DialogDescription>
              Tens a certeza que queres eliminar esta espécie? Esta ação não
              pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`px-4 py-2 rounded-lg text-sm ${
                deleting
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-red-600 text-white cursor-pointer hover:bg-red-700"
              }`}
            >
              {deleting ? "A eliminar..." : "Eliminar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
