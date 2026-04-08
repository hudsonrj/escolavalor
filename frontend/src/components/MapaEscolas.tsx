import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Escola } from '../types';
import { formatCurrency } from '../lib/utils';

interface MapaEscolasProps {
  escolas: Escola[];
}

// Fix for default marker icons in production
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function MapaEscolas({ escolas }: MapaEscolasProps) {
  // Centro do Brasil (aproximadamente Brasília)
  const center: LatLngExpression = [-15.7801, -47.9292];

  // Função para determinar a cor do marcador baseado no score
  const getMarkerColor = (score: string | null) => {
    if (!score) return '#gray-500';
    const scoreNum = parseFloat(score);
    if (scoreNum >= 8) return '#22c55e'; // green
    if (scoreNum >= 6) return '#eab308'; // yellow
    if (scoreNum >= 4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  // Agrupar escolas por coordenadas para evitar sobreposição
  const escolasComLocalizacao = escolas.filter(
    (e) => e.lat && e.lng && !isNaN(parseFloat(e.lat)) && !isNaN(parseFloat(e.lng))
  );

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={4}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {escolasComLocalizacao.map((escola) => {
          const position: LatLngExpression = [
            parseFloat(escola.lat!),
            parseFloat(escola.lng!),
          ];
          const color = getMarkerColor(escola.score_composto);

          return (
            <CircleMarker
              key={escola.id}
              center={position}
              radius={8}
              pathOptions={{
                fillColor: color,
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-2">{escola.nome}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold">Local:</span> {escola.municipio}, {escola.uf}
                    </p>
                    {escola.bairro && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Bairro:</span> {escola.bairro}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-semibold">Tipo:</span>{' '}
                      <span className="capitalize">{escola.tipo}</span>
                    </p>
                    {escola.score_composto && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Score:</span>{' '}
                        <span className="font-bold" style={{ color }}>
                          {parseFloat(escola.score_composto).toFixed(2)}
                        </span>
                      </p>
                    )}
                    {escola.icb && (
                      <p className="text-gray-600">
                        <span className="font-semibold">ICB:</span>{' '}
                        {parseFloat(escola.icb).toFixed(0)}
                      </p>
                    )}
                    {escola.mensalidade_anual && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Mensalidade:</span>{' '}
                        {formatCurrency(escola.mensalidade_anual)}
                      </p>
                    )}
                    {escola.rede_ensino && (
                      <p className="text-gray-600 text-xs italic mt-2">
                        {escola.rede_ensino}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
