import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import DatePicker from "@/components/ui/DatePicker";

import { useObservationStats } from "@/hooks/useObservationsStats";
import { useState } from "react";

export default function Observations() {
  const { reinos } = useObservationStats();

  const [timeRange, setTimeRange] = useState("ALL");

  function getDateFrom(range: string): string | null {
    if (range === "ALL") return null;

    const now = new Date();
    const days = {
      TODAY: 0,
      "7D": 7,
      "30D": 30,
      "90D": 90,
    }[range];

    if (days === undefined) return null;

    const date = new Date(now);
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  console.log(reinos);
  return (
    <>
      <header>
        <div>
          <h2 className="font-medium text-xl pb-2">Observações</h2>
        </div>
      </header>

      <section className="mt-8">
        {/* Estados */}
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-full max-w-48 bg-white">
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

          <Select>
            <SelectTrigger className="w-full max-w-48 bg-white">
              <SelectValue placeholder="Todos os reinos" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Todos os reinos</SelectItem>
                {reinos.length > 0 ? (
                  reinos.map((reino) => (
                    <SelectItem value={reino}>
                      {reino.charAt(0) + reino.slice(1).toLowerCase()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="vazio">---</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full max-w-48 bg-white">
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
      </section>
    </>
  );
}
