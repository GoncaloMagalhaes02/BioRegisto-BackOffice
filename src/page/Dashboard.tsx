import React, { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import Badges from "@/components/Dashboard/Badges";

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

import { type ObservationWithPhoto } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";

function Dashboard() {
  const { profile, user, loading: authLoading } = useAuth();

  const [observations, setObservations] = useState<ObservationWithPhoto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Paginação
  const totalPages = Math.ceil(observations.length / itemsPerPage);
  const paginatedObservations = observations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  useEffect(() => {
    if (authLoading || !user) return;

    const getPendingObservations = async () => {
      try {
        const { data, error } = await supabase.rpc("get_observations", {
          p_status: "PENDING",
          p_kingdom: null,
          p_date_from: null,
        });
        if (error) throw error;
        setObservations(data || []);

        const obsIds = (data || []).map((obs: Observation) => obs.id);

        if (obsIds.length > 0) {
          const { data: photos } = await supabase
            .from("photos")
            .select("observation_id, url")
            .in("observation_id", obsIds)
            .eq("is_primary", true);

          // Criar mapa de observation_id → url
          const photoMap: Record<string, string> = {};
          photos?.forEach((p) => {
            if (!photoMap[p.observation_id]) {
              photoMap[p.observation_id] = p.url;
            }
          });

          // Associar foto a cada observação
          const withPhotos = (data || []).map((obs: Observation) => ({
            ...obs,
            photo_url: photoMap[obs.id] || null,
          }));

          setObservations(withPhotos);
        } else {
          setObservations(data || []);
        }
      } catch (error) {
        console.log("Erro:", error);
      }
    };

    getPendingObservations();
  }, [user, authLoading]);

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  const data = new Date();
  return (
    <>
      <header>
        <div>
          <h2 className="font-medium text-xl pb-2">Dashboard</h2>
          <p className="text-sm pb-1">Bem vindo, {profile?.full_name}</p>
          <p className="text-xs font-light">{data.toLocaleDateString()}</p>
        </div>
      </header>

      <Badges />

      <section className="mt-9 bg-white rounded-lg border border-stone-200 flex flex-col">
        <div className="flex w-full items-center justify-between p-5">
          <h3 className="font-semibold">
            Observações pendentes para validação
          </h3>
          <span className="text-orange-400 border border-orange-200 font-medium text-xs bg-orange-50 px-3 py-2 rounded-lg">
            {observations.length} pendentes
          </span>
        </div>

        <div className="min-h-[350px]">
          <Table>
            <TableHeader className="bg-stone-100">
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedObservations.length > 0 ? (
                <>
                  {paginatedObservations.map((obs) => (
                    <TableRow key={obs.id} className="h-[68px]">
                      <TableCell>
                        {obs.photo_url ? (
                          <img
                            src={obs.photo_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                            <span className="text-stone-300 text-xs">
                              Sem foto
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{obs.username}</TableCell>
                      <TableCell>{obs.description}</TableCell>
                      <TableCell>{formatDate(obs.observed_at)}</TableCell>
                      <TableCell>
                        {obs.latitude + " | " + obs.longitude}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/observations/${obs.id}`}
                            className="bg-green-800 px-3 py-2 rounded-lg text-white font-semibold cursor-pointer"
                          >
                            Validar
                          </Link>
                          <Link
                            to={`/observations/${obs.id}`}
                            className="text-orange-400 border border-orange-200 font-medium bg-orange-50 px-3 py-2 rounded-lg cursor-pointer"
                          >
                            Rejeitar
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {Array.from({
                    length: itemsPerPage - paginatedObservations.length,
                  }).map((_, i) => (
                    <TableRow
                      key={`empty-${i}`}
                      className="h-[68px] hover:bg-transparent"
                    >
                      <TableCell colSpan={6}></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow className="h-[68px]">
                  <TableCell colSpan={6} className="text-center text-stone-400">
                    Nenhuma observação pendente
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {/* Paginação */}
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
      </section>
    </>
  );
}

export default Dashboard;
