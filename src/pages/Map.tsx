import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useConcursoStore, Concurso } from '../store';
import { useState, useCallback, useMemo } from 'react';
import { MapPin, Calendar, ExternalLink, Navigation, X, Trophy, Users, Wallet, Info } from 'lucide-react';
import { calculateScore } from '../utils/scoring';
import clsx from 'clsx';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// UF coordinates for Brazil
const UF_COORDINATES: Record<string, [number, number]> = {
  'AC': [-9.0238, -70.8120],
  'AL': [-9.5713, -36.7820],
  'AP': [1.4102, -51.7700],
  'AM': [-3.4168, -65.8561],
  'BA': [-12.5797, -41.7007],
  'CE': [-5.4984, -39.3206],
  'DF': [-15.7801, -47.9292],
  'ES': [-19.1834, -40.3089],
  'GO': [-15.8270, -49.8362],
  'MA': [-4.9609, -45.2744],
  'MT': [-12.6819, -56.9211],
  'MS': [-20.7722, -54.7852],
  'MG': [-18.5122, -44.5550],
  'PA': [-3.4168, -52.2166],
  'PB': [-7.2400, -36.7820],
  'PR': [-24.8939, -51.5500],
  'PE': [-8.3134, -37.8597],
  'PI': [-7.7183, -42.7289],
  'RJ': [-22.2568, -42.6579],
  'RN': [-5.4026, -36.9541],
  'RS': [-30.0346, -51.2177],
  'RO': [-10.8304, -63.3467],
  'RR': [1.9984, -61.3269],
  'SC': [-27.2423, -50.2189],
  'SP': [-22.1950, -48.7940],
  'SE': [-10.5741, -37.3857],
  'TO': [-10.1753, -48.2982],
  'BR': [-15.7801, -47.9292],
};

function RecenterButton({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(center, 4)}
      className="absolute top-4 right-4 z-[1000] bg-white p-2.5 rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all"
      title="Recentrar Mapa"
    >
      <Navigation size={20} />
    </button>
  );
}

export default function MapView() {
  const { concursos, scoringRules, userProfileScoring } = useConcursoStore();
  const [selectedConcurso, setSelectedConcurso] = useState<(Concurso & { calculatedScore: number }) | null>(null);
  
  // Get concursos with coordinates (either from user-defined location or from UF)
  const mappedConcursos = useMemo(() => {
    return concursos
      .filter(c => c.interest_status === 'interested')
      .map(c => {
        const score = calculateScore(c, scoringRules, userProfileScoring);
        let lat = c.latitude;
        let lng = c.longitude;
        
        // If no coordinates, try to get from UF
        if (!lat || !lng) {
          const uf = c.location || c.uf;
          if (uf && UF_COORDINATES[uf]) {
            // Add some randomness to avoid overlapping markers
            [lat, lng] = UF_COORDINATES[uf];
            lat += (Math.random() - 0.5) * 2;
            lng += (Math.random() - 0.5) * 2;
          }
        }
        
        return {
          ...c,
          latitude: lat,
          longitude: lng,
          calculatedScore: score,
        };
      })
      .filter(c => c.latitude && c.longitude);
  }, [concursos, scoringRules, userProfileScoring]);

  const center: [number, number] = [-15.7801, -47.9292]; // Brasilia

  const handleMarkerClick = useCallback((c: Concurso & { calculatedScore: number }) => {
    setSelectedConcurso(c);
  }, []);

  return (
    <div className="h-full flex flex-col relative -m-4 md:m-0">
      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none md:pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200/50 max-w-[240px] hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <MapPin size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mapa</h2>
              <p className="text-[10px] text-slate-500">Seus concursos de interesse</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 rounded-lg">
            <Info size={14} className="text-slate-400" />
            <p className="text-[10px] text-slate-600">
              {mappedConcursos.length} concurso{mappedConcursos.length !== 1 ? 's' : ''} no mapa
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 relative overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={4} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterButton center={center} />
          {mappedConcursos.map((c, index) => (
            <Marker 
              key={`${c.id}-${index}`} 
              position={[c.latitude!, c.longitude!]}
              eventHandlers={{
                click: () => handleMarkerClick(c),
              }}
            />
          ))}
        </MapContainer>

        {/* Empty State Overlay */}
        {mappedConcursos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[500]">
            <div className="text-center p-8 max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <MapPin size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum concurso no mapa</h3>
              <p className="text-slate-500 text-sm">
                Marque concursos como {"\""}Tenho Interesse{"\""} na página de Oportunidades para visualizá-los aqui.
              </p>
            </div>
          </div>
        )}

        {/* Floating Detail Card */}
        {selectedConcurso && (
          <div className="absolute bottom-6 left-4 right-4 z-[1000] md:left-auto md:right-6 md:w-96 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md uppercase">{selectedConcurso.location || selectedConcurso.uf}</span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">{selectedConcurso.source || selectedConcurso.fonte}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">{selectedConcurso.institution || selectedConcurso.orgao}</h3>
                    {(selectedConcurso.positions || selectedConcurso.cargos) && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{selectedConcurso.positions || selectedConcurso.cargos}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={clsx(
                      "w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-md",
                      selectedConcurso.calculatedScore >= 50 ? "bg-emerald-500" : selectedConcurso.calculatedScore >= 20 ? "bg-amber-500" : "bg-slate-400"
                    )}>
                      <Trophy size={10} className="mb-0.5 opacity-80" />
                      <span className="text-sm font-black leading-none">{selectedConcurso.calculatedScore}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedConcurso(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/50">
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Users size={14} className="text-emerald-600" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Vagas</p>
                    <p className="text-xs font-bold text-slate-700">{selectedConcurso.vacancies || selectedConcurso.vagas || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Wallet size={14} className="text-emerald-600" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Salário</p>
                    <p className="text-xs font-bold text-emerald-600">{selectedConcurso.salary || selectedConcurso.salario || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Calendar size={14} className="text-rose-500" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Inscrições</p>
                    <p className="text-xs font-bold text-slate-700">{selectedConcurso.registration_end || selectedConcurso.fim_inscricoes || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <MapPin size={14} className="text-indigo-500" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Prova</p>
                    <p className="text-xs font-bold text-slate-700">{selectedConcurso.exam_date || selectedConcurso.data_prova || 'A Definir'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-3">
                {selectedConcurso.link && selectedConcurso.link !== 'N/A' && (
                  <a 
                    href={selectedConcurso.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                  >
                    <ExternalLink size={14} />
                    Ver Edital
                  </a>
                )}
                <button 
                  onClick={() => setSelectedConcurso(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
