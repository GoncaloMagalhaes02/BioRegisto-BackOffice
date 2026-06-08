import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MapObservation {
  id: string;
  description: string;
  observed_at: string;
  latitude: number;
  longitude: number;
  username: string;
  full_name: string;
  scientific_name: string | null;
  common_name_pt: string | null;
  kingdom: string | null;
  photo_url: string | null;
}

// Ícones por reino
const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

const kingdomIcons: Record<string, L.DivIcon> = {
  ANIMALIA: createIcon("#F59E0B"),
  PLANTAE: createIcon("#10B981"),
  FUNGI: createIcon("#F97316"),
};

const defaultIcon = createIcon("#6B7280");

export default function Map() {
  const { user, loading: authLoading } = useAuth();
  const [observations, setObservations] = useState<MapObservation[]>([]);
  const [kingdom, setKingdom] = useState("ALL");

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchObservations = async () => {
      try {
        const { data, error } = await supabase.rpc("get_observations_map");
        if (error) throw error;
        setObservations(data || []);
      } catch (error) {
        console.log("Erro ao buscar observações:", error);
      }
    };

    fetchObservations();
  }, [user, authLoading]);

  const filtered =
    kingdom === "ALL"
      ? observations
      : observations.filter((o) => o.kingdom === kingdom);

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  }

  // Contagens por reino
  const counts = {
    ANIMALIA: observations.filter((o) => o.kingdom === "ANIMALIA").length,
    PLANTAE: observations.filter((o) => o.kingdom === "PLANTAE").length,
    FUNGI: observations.filter((o) => o.kingdom === "FUNGI").length,
  };

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-xl">Mapa de Observações</h2>
          <p className="text-sm text-stone-500 mt-1">
            {filtered.length} observações validadas
          </p>
        </div>
        <div className="w-48">
          <Select onValueChange={setKingdom}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Todos os reinos" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">
                  Todos os reinos ({observations.length})
                </SelectItem>
                <SelectItem value="ANIMALIA">
                  Animais ({counts.ANIMALIA})
                </SelectItem>
                <SelectItem value="PLANTAE">
                  Plantas ({counts.PLANTAE})
                </SelectItem>
                <SelectItem value="FUNGI">Fungos ({counts.FUNGI})</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="col-span-2 bg-white rounded-lg border border-stone-200 p-3">
          <MapContainer
            center={[39.5, -8.0]} // Centro de Portugal
            zoom={7}
            scrollWheelZoom={true}
            className="h-[600px] w-full rounded-lg z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((obs) => (
              <Marker
                key={obs.id}
                position={[obs.latitude, obs.longitude]}
                icon={
                  obs.kingdom
                    ? kingdomIcons[obs.kingdom] || defaultIcon
                    : defaultIcon
                }
              >
                <Popup>
                  <div className="w-[200px]">
                    {obs.photo_url && (
                      <img
                        src={obs.photo_url}
                        alt=""
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-medium italic text-sm">
                      {obs.scientific_name ?? "Sem espécie"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {obs.common_name_pt ?? "—"}
                    </p>
                    <p className="text-xs text-stone-400 mt-2">
                      @{obs.username} · {formatDate(obs.observed_at)}
                    </p>
                    <Link
                      to={`/observations/${obs.id}`}
                      className="block mt-2 text-xs text-[#2D5A3D] font-medium hover:underline"
                    >
                      Ver detalhes →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Legenda */}
          <section className="bg-white rounded-lg border border-stone-200 p-5">
            <h3 className="font-medium mb-3">Legenda</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-amber-500"></span>
                <span className="text-sm">Animais ({counts.ANIMALIA})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-emerald-500"></span>
                <span className="text-sm">Plantas ({counts.PLANTAE})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                <span className="text-sm">Fungos ({counts.FUNGI})</span>
              </div>
            </div>
          </section>

          {/* Lista lateral */}
          <section className="bg-white rounded-lg border border-stone-200 p-5">
            <h3 className="font-medium mb-3">Observações</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.slice(0, 20).map((obs) => (
                  <Link
                    key={obs.id}
                    to={`/observations/${obs.id}`}
                    className="flex gap-3 p-2 hover:bg-stone-50 rounded-lg cursor-pointer"
                  >
                    {obs.photo_url ? (
                      <img
                        src={obs.photo_url}
                        alt=""
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-stone-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium italic truncate">
                        {obs.scientific_name ?? "Sem espécie"}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        @{obs.username}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatDate(obs.observed_at)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-stone-400 text-center py-4">
                  Sem observações para mostrar.
                </p>
              )}
            </div>
            {filtered.length > 20 && (
              <p className="text-xs text-stone-400 text-center mt-3">
                A mostrar 20 de {filtered.length}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
