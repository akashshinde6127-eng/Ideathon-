import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin,
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  ShieldCheck, 
  MapPin,
  Layers,
  Locate
} from 'lucide-react';
import { 
  Incident, 
  FloodedRoadSegment, 
  NavigationMockLocation, 
  CalculatedRoute 
} from '../types/disaster';
import { 
  MOCK_INDIA_LOCATIONS, 
  FLOODED_ROADS_VARANASI, 
  FLOODED_ROADS_KARNATAKA,
  getNavigationRoutes 
} from '../data/disasterData';
import { soundAlert } from '../utils/audioAlert';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBwSTyWYoKN7f6SA92PSdkHpliS4s_V-U0";

interface GoogleTacticalMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  scenarioName: string;
  regionName: string;
  scenarioState: string;
  onSwitchToLeaflet?: () => void;
  theme?: 'light' | 'dark';
}

// Sub-component to manage polylines and camera controls on the Google Map
const MapOverlayController: React.FC<{
  floodedRoads: FloodedRoadSegment[];
  calculatedRoutes: CalculatedRoute[];
  activeNavRoute: CalculatedRoute | null;
  onSelectRoad: (road: FloodedRoadSegment) => void;
  scenarioState: string;
}> = ({ floodedRoads, calculatedRoutes, activeNavRoute, onSelectRoad, scenarioState }) => {
  const map = useMap();

  // Fly to scenario center
  useEffect(() => {
    if (!map) return;
    const center = scenarioState === 'KA' ? { lat: 12.7209, lng: 77.2799 } : { lat: 25.3176, lng: 82.9739 };
    map.panTo(center);
    map.setZoom(13);
  }, [map, scenarioState]);

  // Draw flooded road polylines
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const polylines: google.maps.Polyline[] = [];

    floodedRoads.forEach((road) => {
      const isSubmerged = road.status === 'submerged';
      const isCaution = road.status === 'passable_high_clearance';
      const strokeColor = isSubmerged ? '#ef4444' : isCaution ? '#f59e0b' : '#10b981';

      // Outer glow for submerged roads
      if (isSubmerged) {
        const glow = new google.maps.Polyline({
          path: road.coordinates.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: '#ef4444',
          strokeOpacity: 0.35,
          strokeWeight: 14,
          map,
        });
        polylines.push(glow);
      }

      const line = new google.maps.Polyline({
        path: road.coordinates.map(([lat, lng]) => ({ lat, lng })),
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map,
      });

      line.addListener('click', () => {
        onSelectRoad(road);
        soundAlert.playEmergencyBeep();
      });

      polylines.push(line);
    });

    // Draw active navigation routes
    calculatedRoutes.forEach((route) => {
      const isSelected = activeNavRoute?.id === route.id;
      const isFlooded = route.isFlooded;
      const routeLine = new google.maps.Polyline({
        path: route.path.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: isFlooded ? '#dc2626' : '#10b981',
        strokeOpacity: isSelected ? 1.0 : 0.6,
        strokeWeight: isSelected ? 8 : 4,
        zIndex: isSelected ? 10 : 2,
        map,
      });
      polylines.push(routeLine);
    });

    return () => {
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, floodedRoads, calculatedRoutes, activeNavRoute, onSelectRoad]);

  return null;
};

export const GoogleTacticalMap: React.FC<GoogleTacticalMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  scenarioName,
  regionName,
  scenarioState,
  onSwitchToLeaflet,
  theme = 'dark',
}) => {
  const [selectedRoad, setSelectedRoad] = useState<FloodedRoadSegment | null>(null);
  const [showNavDrawer, setShowNavDrawer] = useState(true);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  const relevantLocations = MOCK_INDIA_LOCATIONS.filter((l) => 
    scenarioState === 'KA' ? l.city.includes('KA') : l.city.includes('UP')
  );
  const [originId, setOriginId] = useState<string>(relevantLocations[0]?.id || MOCK_INDIA_LOCATIONS[0].id);
  const [destId, setDestId] = useState<string>(relevantLocations[1]?.id || MOCK_INDIA_LOCATIONS[1].id);
  const [calculatedRoutes, setCalculatedRoutes] = useState<CalculatedRoute[]>([]);
  const [activeNavRoute, setActiveNavRoute] = useState<CalculatedRoute | null>(null);

  const activeFloodedRoads = scenarioState === 'KA' ? FLOODED_ROADS_KARNATAKA : FLOODED_ROADS_VARANASI;
  const initialCenter = scenarioState === 'KA' ? { lat: 12.7209, lng: 77.2799 } : { lat: 25.3176, lng: 82.9739 };

  const handleCalculateRoute = () => {
    const origin = MOCK_INDIA_LOCATIONS.find((l) => l.id === originId) || relevantLocations[0];
    const dest = MOCK_INDIA_LOCATIONS.find((l) => l.id === destId) || relevantLocations[1];
    if (!origin || !dest) return;

    const routes = getNavigationRoutes(origin.coords, dest.coords, activeFloodedRoads);
    setCalculatedRoutes(routes);
    setActiveNavRoute(routes[0]);
    soundAlert.playDispatchChime();
  };

  const handleBroadcastAlert = () => {
    if (!selectedRoad) return;
    const alertMsg = `🚨 ResQGrid Flood Road Advisory:\n${selectedRoad.roadName} is SUBMERGED under ${selectedRoad.waterDepth} of water!\n⛔ Closure: ${selectedRoad.closureType}\n✅ SAFE ROUTE: ${selectedRoad.alternateSuggestion}\nDial 112 for emergency extraction.`;
    navigator.clipboard.writeText(alertMsg);
    setCopiedBroadcast(true);
    soundAlert.playDispatchChime();
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-100 dark:bg-[#070d1d] rounded-2xl overflow-hidden border border-slate-300 dark:border-[#17254c] shadow-sm dark:shadow-2xl select-none group flex flex-col transition-colors">
      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Engine switcher & City quick jumps */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-[#0b142d]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-[#1d2d5a] shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google Maps</span>
          </div>

          {onSwitchToLeaflet && (
            <button
              onClick={onSwitchToLeaflet}
              className="px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#152347] rounded-lg transition-colors"
            >
              Tactical Canvas
            </button>
          )}

          <div className="h-3.5 w-px bg-slate-200 dark:bg-[#1d2d5a] mx-0.5" />
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {regionName} ({scenarioState})
          </span>
        </div>

        {/* Navigation Helper Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowNavDrawer(!showNavDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              showNavDrawer
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white ring-2 ring-sky-400/50'
                : 'bg-white/95 dark:bg-[#0b142d]/90 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-[#1d2d5a] hover:bg-slate-100 dark:hover:bg-[#121f44]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Flood Navigation Helper</span>
          </button>
        </div>
      </div>

      {/* Google Maps Canvas */}
      <div className="w-full h-full relative z-0">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'routes', 'geometry']}>
          <Map
            defaultCenter={initialCenter}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            colorScheme={theme === 'light' ? 'LIGHT' : 'DARK'}
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          >
            <MapOverlayController
              floodedRoads={activeFloodedRoads}
              calculatedRoutes={calculatedRoutes}
              activeNavRoute={activeNavRoute}
              onSelectRoad={(r) => setSelectedRoad(r)}
              scenarioState={scenarioState}
            />

            {/* Incident Markers - Uncertainty Aware */}
            {incidents.map((inc) => {
              const isVerified = inc.uncertaintyStatus === 'verified_danger';
              const isUnverified = inc.uncertaintyStatus === 'unverified_report';
              const isUnknown = inc.uncertaintyStatus === 'unknown_condition';
              const isSafe = inc.severity === 'safe';
              const isSelected = selectedIncident?.id === inc.id;

              const pinColor = isSafe
                ? '#16a34a'
                : isUnknown
                ? '#6366f1'
                : isUnverified
                ? '#d97706'
                : '#dc2626';

              return (
                <AdvancedMarker
                  key={inc.id}
                  position={{ lat: inc.coordinates.lat, lng: inc.coordinates.lng }}
                  onClick={() => {
                    onSelectIncident(inc);
                    soundAlert.playEmergencyBeep();
                  }}
                  title={`${inc.code} - ${inc.title} (${isVerified ? 'Verified Danger' : isUnverified ? 'Unverified Report' : isUnknown ? 'Unknown Condition' : 'Safe'})`}
                >
                  <Pin
                    background={pinColor}
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.3 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Floating Flood Navigation & Road Suggestion Drawer */}
      {showNavDrawer && (
        <div className="absolute top-16 right-3 z-30 w-80 sm:w-96 bg-white/95 dark:bg-[#0b142d]/95 backdrop-blur-md border border-slate-200 dark:border-[#1f3266] rounded-2xl shadow-2xl p-4 text-xs space-y-3 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#182852] pb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Flood-Aware Road Navigator</h4>
            </div>
            <button onClick={() => setShowNavDrawer(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            Checks real-time submerged roads in India and computes safe bypass routes around inundated zones.
          </p>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                From (Mock Origin)
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#101b3b] border border-slate-200 dark:border-[#1b2b54] rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                {relevantLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                To (Destination / Safe Camp)
              </label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#101b3b] border border-slate-200 dark:border-[#1b2b54] rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                {relevantLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCalculateRoute}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Check Road Floods & Suggest Safe Route</span>
          </button>

          {calculatedRoutes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#182852] max-h-48 overflow-y-auto">
              {calculatedRoutes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setActiveNavRoute(route)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    route.isFlooded
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/50 hover:border-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/50 hover:border-emerald-400'
                  } ${activeNavRoute?.id === route.id ? 'ring-2 ring-sky-400' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      {route.isFlooded ? (
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      <span className={route.isFlooded ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}>
                        {route.recommendation}: {route.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-800 dark:text-white tabular-nums">
                      {route.distance}
                    </span>
                  </div>

                  {route.warning && (
                    <div className="text-[10px] text-red-700 dark:text-red-300 mt-1 font-medium bg-red-100/60 dark:bg-red-900/30 p-1.5 rounded">
                      {route.warning}
                    </div>
                  )}

                  {!route.isFlooded && (
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-200/90 mt-1">
                      ✅ Elevated bypass is 100% dry and open. ETA: {route.eta}
                    </div>
                  )}

                  <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-white/10 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
                    {route.turnInstructions.slice(0, 2).map((inst, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="text-sky-500 dark:text-sky-400">→</span>
                        <span className="truncate">{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flooded Road Inspector Card */}
      {selectedRoad && (
        <div className="absolute bottom-12 right-3 z-30 w-80 sm:w-96 bg-white/95 dark:bg-[#0c152e]/95 backdrop-blur-md border border-slate-200 dark:border-[#233568] rounded-2xl shadow-2xl p-4 text-xs space-y-2.5 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                selectedRoad.status === 'submerged' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
              }`}>
                {selectedRoad.closureType}
              </span>
              <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400">
                Water Depth: {selectedRoad.waterDepth}
              </span>
            </div>
            <button onClick={() => setSelectedRoad(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              ✕
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedRoad.roadName}</h4>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              From: {selectedRoad.fromLocation} → To: {selectedRoad.toLocation}
            </div>
          </div>

          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#101b3b] p-2 rounded-xl border border-slate-200 dark:border-[#1b2b54]">
            {selectedRoad.description}
          </p>

          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 rounded-xl p-2.5 text-[11px] text-emerald-800 dark:text-emerald-200">
            <span className="font-bold block text-emerald-700 dark:text-emerald-400 mb-0.5">
              💡 Suggested Alternate Route for People:
            </span>
            {selectedRoad.alternateSuggestion}
          </div>

          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              onClick={handleBroadcastAlert}
              className="flex-1 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{copiedBroadcast ? 'Advisory Copied!' : 'Broadcast Alert to Public'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Legend - Uncertainty-Aware States */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-[#0a1226]/90 backdrop-blur-md border border-slate-200 dark:border-[#1b2b56] rounded-xl p-2.5 shadow-lg text-xs flex flex-wrap items-center gap-3.5 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-xs flex items-center justify-center text-[8px] font-bold text-white">!</span>
          <span className="text-[10px] text-red-700 dark:text-red-300 font-bold">1. Verified Danger</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white shadow-xs flex items-center justify-center text-[8px] font-bold text-slate-950 animate-pulse">▲</span>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">2. Unverified Reports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-dashed border-indigo-200 shadow-xs flex items-center justify-center text-[8px] font-bold text-white">?</span>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">3. Unknown Conditions (Survey Needed)</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-[#19274e] pl-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Safe Corridor</span>
        </div>
      </div>
    </div>
  );
};
