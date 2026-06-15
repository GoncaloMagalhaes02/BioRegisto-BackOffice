import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";

import { useStats } from "@/hooks/useObservationsStats";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

import {
  Table,
  TableBody,
  TableCaption,
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

import { type Observation } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";

interface ObservationWithPhoto extends Observation {
  photo_url: string | null;
}

export default function Observations() {
  const { loading: authLoading, user } = useAuth();
  const { reinos } = useStats();

  const [estado, setEstado] = useState("ALL");
  const [reino, setReino] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  const [search, setSearch] = useState("");
  const [observations, setObservations] = useState<ObservationWithPhoto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const totalPages = Math.ceil(observations.length / itemsPerPage);
  const paginatedObservations = observations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchObservations = async () => {
      try {
        const { data, error } = await supabase.rpc("get_observations", {
          p_status: estado !== "ALL" ? estado : null,
          p_kingdom: reino !== "ALL" ? reino : null,
          p_date_from: getDateFrom(timeRange),
        });

        if (error) throw error;

        let filtered = data || [];

        if (search.trim() !== "") {
          const term = search.toLowerCase();
          filtered = filtered.filter(
            (obs: Observation) =>
              obs.suggested_species?.toLowerCase().includes(term) ||
              obs.scientific_name?.toLowerCase().includes(term) ||
              obs.common_name_pt?.toLowerCase().includes(term) ||
              obs.description?.toLowerCase().includes(term),
          );
        }

        // Buscar primeira foto de cada observação
        const obsIds = filtered.map((obs: Observation) => obs.id);

        if (obsIds.length > 0) {
          const { data: photos } = await supabase
            .from("photos")
            .select("observation_id, url")
            .in("observation_id", obsIds)
            .order("is_primary", { ascending: false })
            .order("order_index", { ascending: true });

          const photoMap: Record<string, string> = {};
          photos?.forEach((p) => {
            if (!photoMap[p.observation_id]) {
              photoMap[p.observation_id] = p.url;
            }
          });

          const withPhotos = filtered.map((obs: Observation) => ({
            ...obs,
            photo_url: photoMap[obs.id] || null,
          }));

          setObservations(withPhotos);
        } else {
          setObservations(
            filtered.map((obs: Observation) => ({ ...obs, photo_url: null })),
          );
        }

        setCurrentPage(1);
      } catch (error) {
        console.log("Erro ao buscar observações:", error);
      }
    };

    fetchObservations();
  }, [user, authLoading, estado, reino, timeRange, search]);

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function getDateFrom(range: string): string | null {
    if (range === "ALL") return null;
    const now = new Date();
    const days = { TODAY: 0, "7D": 7, "30D": 30, "90D": 90 }[range];
    if (days === undefined) return null;
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  return (
    <>
      <header>
        <div>
          <h2 className="font-medium text-xl pb-2">Observações</h2>
        </div>
      </header>

      <section className="mt-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-48">
            <Select onValueChange={setEstado}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos os estados</SelectItem>
                  <SelectItem value="VALIDATED">Validadas</SelectItem>
                  <SelectItem value="PENDING">Pendentes</SelectItem>
                  <SelectItem value="REJECTED">Rejeitadas</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select onValueChange={setReino}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Todos os reinos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos os reinos</SelectItem>
                  {reinos.length > 0 ? (
                    reinos.map((reino) => (
                      <SelectItem key={reino} value={reino}>
                        {reino.charAt(0) + reino.slice(1).toLowerCase()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="vazio">---</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todo o período</SelectItem>
                  <SelectItem value="TODAY">Hoje</SelectItem>
                  <SelectItem value="7D">Últimos 7 dias</SelectItem>
                  <SelectItem value="30D">Últimos 30 dias</SelectItem>
                  <SelectItem value="90D">Últimos 3 meses</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full bg-white"
              placeholder="Procure por espécie"
            />
          </div>
        </div>
      </section>

      <div className="mt-5">
        <Table className="bg-white">
          <TableCaption className="mt-3 pb-3">
            Lista de Observações
          </TableCaption>
          <TableHeader className="bg-stone-100">
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Espécie Sugerida</TableHead>
              <TableHead>Utilizador</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {observations.length > 0 ? (
              <>
                {paginatedObservations.map((obs) => (
                  <TableRow key={obs.id} className="h-[60px] max-h-[60px]">
                    <TableCell>
                      {obs.photo_url ? (
                        <img
                          src={obs.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                          <span className="text-stone-300 text-[10px]">
                            Sem foto
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{obs.suggested_species}</TableCell>
                    <TableCell>@{obs.username}</TableCell>
                    <TableCell>
                      {obs.latitude?.toFixed(4)} | {obs.longitude?.toFixed(4)}
                    </TableCell>
                    <TableCell>{formatDate(obs.created_at)}</TableCell>
                    <TableCell>
                      <StatusBadge status={obs.status} />
                    </TableCell>
                    <TableCell>
                      <Link to={`/observations/${obs.id}`}>
                        <Eye strokeWidth={1.5} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}

                {Array.from({
                  length: itemsPerPage - paginatedObservations.length,
                }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="h-[60px] max-h-[60px] hover:bg-transparent border-none"
                  >
                    <TableCell colSpan={7} className="py-0"></TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <>
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="h-[60px] max-h-[60px] hover:bg-transparent border-none"
                  >
                    <TableCell
                      colSpan={7}
                      className={
                        i === 0 ? "text-center text-stone-400 py-0" : "py-0"
                      }
                    >
                      {i === 0 ? "Não há observações disponíveis." : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-stone-200">
            <p className="text-sm text-stone-500">
              A mostrar {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, observations.length)} de{" "}
              {observations.length}
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
