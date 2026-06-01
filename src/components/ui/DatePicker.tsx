import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function DatePicker({
  date,
  setDate,
  placeholder = "Selecionar data",
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-48">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal bg-white pr-8"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {date ? format(date, "dd/MM/yyyy", { locale: pt }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={pt}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <button
          onClick={() => setDate(undefined)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default DatePicker;
