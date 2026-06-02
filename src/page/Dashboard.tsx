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

import { type Observation } from "@/types";
import { supabase } from "@/lib/supabaseClient";

function Dashboard() {
  const { profile, user, loading: authLoading } = useAuth();

  const [observations, setObservations] = useState<Observation[]>([]);
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
        const { data, error } = await supabase
          .from("observations")
          .select(
            `
            *,
            profiles!observations_user_id_fkey ( username, full_name, avatar_url ),
            photos ( id, url, is_primary, order_index )
            `,
          )
          .eq("status", "PENDING");
        if (error) throw error;
        setObservations(data || []);
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
        <div className="flex w-full items-center justify-between py-6 px-5">
          <h3 className="font-semibold">
            Observações pendentes para validação
          </h3>
          <span className="text-orange-400 border border-orange-200 font-medium text-xs bg-orange-100 px-3 py-2 rounded-lg">
            {observations.length} pendentes
          </span>
        </div>

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
        </Table>

        <div className="h-[350px]">
          <Table>
            <TableBody>
              {paginatedObservations.length > 0 ? (
                paginatedObservations.map((obs) => (
                  <TableRow key={obs.id}>
                    <TableCell>Foto</TableCell>
                    <TableCell>{obs.profiles?.username}</TableCell>
                    <TableCell>{obs.description}</TableCell>
                    <TableCell>{formatDate(obs.observed_at)}</TableCell>
                    <TableCell>
                      {obs.location.latitude + " | " + obs.location.longitude}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a className="bg-green-700 px-3 py-2 rounded-lg text-white font-semibold cursor-pointer">
                          Validar
                        </a>
                        <a className="text-orange-400 border border-orange-200 font-medium bg-orange-50 px-3 py-2 rounded-lg cursor-pointer">
                          Rejeitar
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-stone-400"
                  >
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
