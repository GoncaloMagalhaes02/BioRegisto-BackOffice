import React, { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import Badges from "@/components/Dashboard/badges";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Observation } from "@/types";
import { supabase } from "@/lib/supabaseClient";

function Dashboard() {
  const { profile, user, loading: authLoading } = useAuth();

  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;

    const getObservations = async () => {
      try {
        const { data, error } = await supabase
          .from("observations")
          .select(
            `
    *,
    profiles!observations_user_id_fkey ( username, full_name, avatar_url )
  `,
          )
          .eq("status", "PENDING");

        if (error) throw error;
        console.log(data);
        setObservations(data || []);
      } catch (error) {
        console.log("Erro:", error);
      }
    };

    getObservations();
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
          <h2 className="font-medium text-xl pb-2 ">Dashboard</h2>
          <p className="text-sm pb-1">Bem vindo, {profile?.full_name}</p>
          <p className="text-xs font-light">{data.toLocaleDateString()}</p>
        </div>
      </header>
      {/* Badges da dashboard */}
      <Badges />

      <section className="mt-9 bg-white">
        <div className="flex w-full items-center justify-between py-6 px-5">
          <h3 className="font-semibold">
            Observações pendentes para validação
          </h3>
          <span className="text-orange-400 border border-orange-200 font-medium bg-orange-100 px-4 py-2 rounded-lg">
            6 pendentes
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
          <TableBody>
            {observations.length > 0 ? (
              observations.map((obs) => (
                <TableRow className="py-5" key={obs.id}>
                  <TableCell>Foto</TableCell>
                  <TableCell>{obs.profiles?.username}</TableCell>
                  <TableCell>{obs.description}</TableCell>
                  <TableCell>{formatDate(obs.observed_at)}</TableCell>
                  <TableCell>
                    {obs.location.latitude + " | " + obs.location.longitude}
                  </TableCell>
                  <TableCell className="flex items-center justify-end gap-2">
                    <a className="bg-green-700 px-3 py-2 rounded-lg text-white font-semibold">
                      Validar
                    </a>
                    <a className="text-orange-400 border border-orange-200 font-medium bg-orange-100 px-3 py-2 rounded-lg">
                      Rejeitar
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <p>nada para listar</p>
            )}
          </TableBody>
        </Table>
      </section>
    </>
  );
}

export default Dashboard;
