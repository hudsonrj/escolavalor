import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

interface RankingUF {
  uf: string;
  total_escolas: number;
  score_medio: string;
  score_maximo: string;
  score_minimo: string;
}

async function fetchRankingUF() {
  const res = await fetch('/api/ranking-agregado/por-uf');
  if (!res.ok) throw new Error('Erro ao buscar ranking por UF');
  return res.json();
}

// Simplified GeoJSON for Brazilian states (centroids and approximate boundaries)
const BRAZIL_STATES_GEOJSON: GeoJsonObject = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { uf: 'AC', nome: 'Acre' },
      geometry: { type: 'Point', coordinates: [-70.55, -9.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'AL', nome: 'Alagoas' },
      geometry: { type: 'Point', coordinates: [-36.6, -9.6] }
    },
    {
      type: 'Feature',
      properties: { uf: 'AP', nome: 'Amapá' },
      geometry: { type: 'Point', coordinates: [-51.8, 1.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'AM', nome: 'Amazonas' },
      geometry: { type: 'Point', coordinates: [-64.0, -4.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'BA', nome: 'Bahia' },
      geometry: { type: 'Point', coordinates: [-41.5, -12.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'CE', nome: 'Ceará' },
      geometry: { type: 'Point', coordinates: [-39.5, -5.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'DF', nome: 'Distrito Federal' },
      geometry: { type: 'Point', coordinates: [-47.93, -15.78] }
    },
    {
      type: 'Feature',
      properties: { uf: 'ES', nome: 'Espírito Santo' },
      geometry: { type: 'Point', coordinates: [-40.3, -19.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'GO', nome: 'Goiás' },
      geometry: { type: 'Point', coordinates: [-49.3, -15.8] }
    },
    {
      type: 'Feature',
      properties: { uf: 'MA', nome: 'Maranhão' },
      geometry: { type: 'Point', coordinates: [-45.0, -5.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'MT', nome: 'Mato Grosso' },
      geometry: { type: 'Point', coordinates: [-55.0, -13.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'MS', nome: 'Mato Grosso do Sul' },
      geometry: { type: 'Point', coordinates: [-54.6, -20.4] }
    },
    {
      type: 'Feature',
      properties: { uf: 'MG', nome: 'Minas Gerais' },
      geometry: { type: 'Point', coordinates: [-44.0, -18.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'PA', nome: 'Pará' },
      geometry: { type: 'Point', coordinates: [-52.0, -3.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'PB', nome: 'Paraíba' },
      geometry: { type: 'Point', coordinates: [-36.7, -7.1] }
    },
    {
      type: 'Feature',
      properties: { uf: 'PR', nome: 'Paraná' },
      geometry: { type: 'Point', coordinates: [-51.0, -24.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'PE', nome: 'Pernambuco' },
      geometry: { type: 'Point', coordinates: [-38.5, -8.3] }
    },
    {
      type: 'Feature',
      properties: { uf: 'PI', nome: 'Piauí' },
      geometry: { type: 'Point', coordinates: [-42.8, -7.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'RJ', nome: 'Rio de Janeiro' },
      geometry: { type: 'Point', coordinates: [-42.5, -22.2] }
    },
    {
      type: 'Feature',
      properties: { uf: 'RN', nome: 'Rio Grande do Norte' },
      geometry: { type: 'Point', coordinates: [-36.5, -5.8] }
    },
    {
      type: 'Feature',
      properties: { uf: 'RS', nome: 'Rio Grande do Sul' },
      geometry: { type: 'Point', coordinates: [-53.0, -30.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'RO', nome: 'Rondônia' },
      geometry: { type: 'Point', coordinates: [-62.0, -11.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'RR', nome: 'Roraima' },
      geometry: { type: 'Point', coordinates: [-61.0, 2.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'SC', nome: 'Santa Catarina' },
      geometry: { type: 'Point', coordinates: [-50.2, -27.0] }
    },
    {
      type: 'Feature',
      properties: { uf: 'SP', nome: 'São Paulo' },
      geometry: { type: 'Point', coordinates: [-48.5, -22.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'SE', nome: 'Sergipe' },
      geometry: { type: 'Point', coordinates: [-37.4, -10.5] }
    },
    {
      type: 'Feature',
      properties: { uf: 'TO', nome: 'Tocantins' },
      geometry: { type: 'Point', coordinates: [-48.3, -10.2] }
    }
  ]
};

function FitBoundsComponent() {
  const map = useMap();

  useEffect(() => {
    map.setView([-14.2350, -51.9253], 4);
  }, [map]);

  return null;
}

export function MapaCalorGeografico() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking-uf'],
    queryFn: fetchRankingUF,
  });

  const [scoreMap, setScoreMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (data?.data) {
      const map = new Map<string, number>();
      data.data.forEach((item: RankingUF) => {
        map.set(item.uf, parseFloat(item.score_medio));
      });
      setScoreMap(map);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
        <p className="text-red-700 font-bold">Erro ao carregar dados do mapa</p>
      </div>
    );
  }

  const getColorByScore = (score: number): string => {
    if (score >= 7) return '#10b981'; // green-500
    if (score >= 5) return '#84cc16'; // lime-500
    if (score >= 3) return '#eab308'; // yellow-500
    if (score >= 1.5) return '#f97316'; // orange-500
    if (score >= 0.5) return '#ef4444'; // red-500
    return '#991b1b'; // red-800
  };

  const getOpacityByScore = (score: number): number => {
    if (score >= 5) return 0.7;
    if (score >= 2) return 0.5;
    return 0.3;
  };

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const uf = feature.properties.uf;
    const score = scoreMap.get(uf) || 0;
    const color = getColorByScore(score);
    const opacity = getOpacityByScore(score);

    return L.circle(latlng, {
      radius: 100000, // 100km radius
      fillColor: color,
      fillOpacity: opacity,
      color: color,
      weight: 2,
      opacity: 0.8,
    });
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const uf = feature.properties.uf;
    const nome = feature.properties.nome;
    const score = scoreMap.get(uf);
    const ranking = data?.data.find((item: RankingUF) => item.uf === uf);

    if (ranking) {
      layer.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${nome} (${uf})</h3>
          <div class="space-y-1 text-sm">
            <p><strong>Score Médio:</strong> ${parseFloat(ranking.score_medio).toFixed(2)}</p>
            <p><strong>Score Máximo:</strong> ${parseFloat(ranking.score_maximo).toFixed(2)}</p>
            <p><strong>Score Mínimo:</strong> ${parseFloat(ranking.score_minimo).toFixed(2)}</p>
            <p><strong>Total de Escolas:</strong> ${ranking.total_escolas}</p>
          </div>
        </div>
      `);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-gray-100 p-6">
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          Mapa de Calor por Estado
        </h3>
        <p className="text-gray-700 font-medium">
          Visualização geográfica da qualidade educacional média por UF
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100">
        <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-sm text-gray-900 font-bold">≥ 7.0 (Excelente)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: '#84cc16' }}></div>
          <span className="text-sm text-gray-900 font-bold">5.0 - 6.9 (Bom)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: '#eab308' }}></div>
          <span className="text-sm text-gray-900 font-bold">3.0 - 4.9 (Regular)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: '#f97316' }}></div>
          <span className="text-sm text-gray-900 font-bold">1.5 - 2.9 (Ruim)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-sm text-gray-900 font-bold">0.5 - 1.4 (Crítico)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: '#991b1b' }}></div>
          <span className="text-sm text-gray-900 font-bold">&lt; 0.5 (Muito Crítico)</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-[600px] rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl">
        <MapContainer
          center={[-14.2350, -51.9253]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={BRAZIL_STATES_GEOJSON}
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
          />
          <FitBoundsComponent />
        </MapContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="text-sm text-gray-900 mb-2 font-bold uppercase tracking-wide">Excelente (≥7)</div>
          <div className="text-4xl font-black text-gray-900">
            {data?.data.filter((item: RankingUF) => parseFloat(item.score_medio) >= 7).length || 0}
          </div>
        </div>
        <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="text-sm text-gray-900 mb-2 font-bold uppercase tracking-wide">Bom (5-6.9)</div>
          <div className="text-4xl font-black text-gray-900">
            {data?.data.filter((item: RankingUF) => {
              const score = parseFloat(item.score_medio);
              return score >= 5 && score < 7;
            }).length || 0}
          </div>
        </div>
        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="text-sm text-gray-900 mb-2 font-bold uppercase tracking-wide">Regular (3-4.9)</div>
          <div className="text-4xl font-black text-gray-900">
            {data?.data.filter((item: RankingUF) => {
              const score = parseFloat(item.score_medio);
              return score >= 3 && score < 5;
            }).length || 0}
          </div>
        </div>
        <div className="group bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="text-sm text-gray-900 mb-2 font-bold uppercase tracking-wide">Crítico (&lt;3)</div>
          <div className="text-4xl font-black text-gray-900">
            {data?.data.filter((item: RankingUF) => parseFloat(item.score_medio) < 3).length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
