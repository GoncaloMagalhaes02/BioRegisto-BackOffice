import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapLayerProps {
  points: [number, number][]; // [lat, lng]
}

export default function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    // @ts-ignore — leaflet.heat adiciona L.heatLayer
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      gradient: {
        0.0: "#10B981", // verde (poucas)
        0.5: "#F59E0B", // amarelo
        1.0: "#EF4444", // vermelho (muitas)
      },
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}
