import React, { useEffect } from "react";

import { Eye, CircleCheck, Clock, CircleX } from "lucide-react";

import { useObservationStats } from "@/hooks/useObservationsStats";

function Badges() {
  const { observacoes, pendentes, rejeitadas, validadas } =
    useObservationStats();

  return (
    <>
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col p-5 bg-white relative rounded-lg">
          <h3 className="text-gray-400">Total de observações</h3>
          <p className="font-semibold text-4xl pb-5 pt-1">{observacoes}</p>
          <p className="text-gray-600">+ 12% vs mês anterior</p>
          <div className="absolute right-8 top-9 bg-gray-200 p-2 rounded-sm">
            <Eye />
          </div>
        </div>
        <div className="flex flex-col p-5 bg-white relative rounded-lg">
          <h3 className="text-gray-400">Validadas</h3>
          <p className="font-semibold text-green-500 text-4xl pb-5 pt-1">
            {validadas}
          </p>
          <p className="text-green-500">+ 9% vs mês anterior</p>
          <div className="absolute right-8 top-9 bg-green-100 p-2 rounded-sm">
            <CircleCheck color="#46e30d" />
          </div>
        </div>
        <div className="flex flex-col p-5 bg-white relative rounded-lg">
          <h3 className="text-gray-400">Pendentes</h3>
          <p className="font-semibold text-orange-400 text-4xl pb-5 pt-1">
            {pendentes}
          </p>
          <p className="text-orange-500">+ 3% vs mês anterior</p>
          <div className="absolute right-8 top-9 bg-orange-100 p-2 rounded-sm">
            <Clock color="#f88a0d" />
          </div>
        </div>
        <div className="flex flex-col p-5 bg-white relative rounded-lg">
          <h3 className="text-gray-400">Rejeitadas</h3>
          <p className="font-semibold text-red-600 text-4xl pb-5 pt-1">
            {rejeitadas}
          </p>
          <p className="text-red-500">- 2% vs mês anterior</p>
          <div className="absolute right-8 top-9 bg-red-100 p-2 rounded-sm">
            <CircleX color="#fe0101" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Badges;
