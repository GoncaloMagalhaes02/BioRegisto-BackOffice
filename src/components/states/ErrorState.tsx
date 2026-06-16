import { TriangleAlert, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-12 flex flex-col items-center text-center">
      <div className="bg-red-50 p-3 rounded-full mb-4">
        <TriangleAlert className="w-8 h-8 text-red-500" />
      </div>
      <p className="font-medium text-stone-800">Algo correu mal</p>
      <p className="text-sm text-stone-500 mt-1 max-w-sm">
        {message ??
          "Não foi possível carregar os dados. Verifica a tua ligação e tenta novamente."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D5A3D] text-white text-sm cursor-pointer hover:bg-[#1f4a2d]"
        >
          <RotateCcw size={16} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
