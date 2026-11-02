import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Plus, 
  Minus, 
  Locate, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Navigation, 
  MapPin, 
  Radio, 
  Send, 
  Volume2, 
  ArrowRight,
  Compass,
  CheckCircle2,
  XCircle,
  Car
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

interface TacticalMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  scenarioName: string;
  regionName: string;
  scenarioState: string;
  onSwitchToGoogle?: () => void;
  theme?: 'light' | 'dark';
}

type MapTileStyle = 'dark' | 'satellite' | 'streets';

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  scenarioName,
  regionName,
  scenarioState,
  onSwitchToGoogle,
  theme = 'light',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const simMarkerRef = useRef<L.Marker | null>(null);

  const [tileStyle, setTileStyle] = useState<MapTileStyle>(theme === 'light' ? 'streets' : 'dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedRoad, setSelectedRoad] = useState<FloodedRoadSegment | null>(null);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Sync tileStyle when theme changes
  useEffect(() => {
    setTileStyle(theme === 'light' ? 'streets' : 'dark');
  }, [theme]);

  // Road Navigation state
  const [showNavDrawer, setShowNavDrawer] = useState(true);
  const relevantLocations = MOCK_INDIA_LOCATIONS.filter((l) => 
    scenarioState === 'KA' ? l.city.includes('KA') : l.city.includes('UP')
  );
  const [originId, setOriginId] = useState<string>(relevantLocations[0]?.id || MOCK_INDIA_LOCATIONS[0].id);
  const [destId, setDestId] = useState<string>(relevantLocations[1]?.id || MOCK_INDIA_LOCATIONS[1].id);
  const [calculatedRoutes, setCalculatedRoutes] = useState<CalculatedRoute[]>([]);
  const [activeNavRoute, setActiveNavRoute] = useState<CalculatedRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const activeFloodedRoads = scenarioState === 'KA' ? FLOODED_ROADS_KARNATAKA : FLOODED_ROADS_VARANASI;

  // Initialize Leaflet Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if DOM element already had a leaflet instance attached
    if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default to Varanasi coords [25.3176, 82.9739]
    const initialCenter: [number, number] = scenarioState === 'KA' 
      ? [12.7209, 77.2799] 
      : [25.3176, 82.9739];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Bright OpenStreetMap layer for light theme or Dark Matter for dark theme
    const initialUrl = theme === 'light'
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const initialSubdomains = theme === 'light' ? 'abc' : 'abcd';

    const baseTile = L.tileLayer(initialUrl, {
      maxZoom: 19,
      subdomains: initialSubdomains,
    });
    baseTile.addTo(map);
    tileLayerRef.current = baseTile;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const roadsGroup = L.layerGroup().addTo(map);
    roadsLayerRef.current = roadsGroup;

    const routesGroup = L.layerGroup().addTo(map);
    routesLayerRef.current = routesGroup;

    mapInstanceRef.current = map;

    // Ensure map tiles recalculate size after DOM layout settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center when scenario changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const targetCoords: [number, number] = scenarioState === 'KA'
      ? [12.7209, 77.2799]
      : [25.3176, 82.9739];
    mapInstanceRef.current.flyTo(targetCoords, 13, { duration: 1.2 });
  }, [scenarioState]);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (tileStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'a';
    } else if (tileStyle === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    }

    const newTileLayer = L.tileLayer(url, {
      maxZoom,
      subdomains,
    });
    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [tileStyle]);

  // Draw Flooded Roads & Safe Corridors on real streets (Uncertainty-Aware)
  useEffect(() => {
    if (!roadsLayerRef.current || !mapInstanceRef.current) return;
    roadsLayerRef.current.clearLayers();

    activeFloodedRoads.forEach((road) => {
      const isUnknown = road.uncertaintyStatus === 'unknown_condition';
      const isUnverified = road.uncertaintyStatus === 'unverified_report';
      const isVerifiedDanger = road.uncertaintyStatus === 'verified_danger' && road.status === 'submerged';
      const isSafe = road.status === 'dry_open';
      const isSelected = selectedRoad?.id === road.id;

      // Color coding based on uncertainty states:
      // Verified Danger = Solid Red (#ef4444)
      // Unverified Report = Dashed Amber (#f59e0b)
      // Unknown Condition = Dotted Indigo/Slate (#6366f1)
      // Safe Corridor = Solid Emerald (#10b981)
      let color = '#ef4444';
      let dashArray: string | undefined = undefined;

      if (isUnknown) {
        color = '#6366f1';
        dashArray = '3, 6';
      } else if (isUnverified) {
        color = '#f59e0b';
        dashArray = '8, 6';
      } else if (isSafe) {
        color = '#10b981';
      }

      const weight = isSelected ? 8 : 5;

      // Outer glow for verified danger zones
      if (isVerifiedDanger) {
        const glowLine = L.polyline(road.coordinates, {
          color: '#ef4444',
          weight: 16,
          opacity: 0.25,
          lineCap: 'round',
        });
        roadsLayerRef.current?.addLayer(glowLine);
      } else if (isUnknown) {
        const glowLine = L.polyline(road.coordinates, {
          color: '#6366f1',
          weight: 12,
          opacity: 0.2,
          lineCap: 'round',
        });
        roadsLayerRef.current?.addLayer(glowLine);
      }

      // Main polyline
      const polyline = L.polyline(road.coordinates, {
        color,
        weight,
        opacity: 0.9,
        dashArray,
        lineCap: 'round',
      });

      polyline.on('click', () => {
        setSelectedRoad(road);
        soundAlert.playEmergencyBeep();
      });

      // Midpoint hazard label icon
      const midPoint = road.coordinates[Math.floor(road.coordinates.length / 2)];
      if (midPoint) {
        let iconHtml = '';
        if (isUnknown) {
          iconHtml = `<div class="flex items-center gap-1 bg-indigo-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-indigo-300 whitespace-nowrap">
            <span>❓ UNKNOWN: Sensor Offline (${road.waterDepth})</span>
          </div>`;
        } else if (isUnverified) {
          iconHtml = `<div class="flex items-center gap-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-white animate-pulse whitespace-nowrap">
            <span>🟡 UNVERIFIED REPORT (${road.waterDepth})</span>
          </div>`;
        } else if (isVerifiedDanger) {
          iconHtml = `<div class="flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-white animate-pulse whitespace-nowrap">
            <span>🔴 VERIFIED DANGER: ${road.waterDepth}</span>
          </div>`;
        } else {
          iconHtml = `<div class="flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-white whitespace-nowrap">
            <span>✅ SAFE CORRIDOR (Dry)</span>
          </div>`;
        }

        const labelMarker = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'custom-road-label',
            html: iconHtml,
            iconSize: [110, 20],
            iconAnchor: [55, 10],
          }),
        });

        labelMarker.on('click', () => {
          setSelectedRoad(road);
          soundAlert.playEmergencyBeep();
        });

        roadsLayerRef.current?.addLayer(labelMarker);
      }

      roadsLayerRef.current?.addLayer(polyline);
    });
  }, [activeFloodedRoads, selectedRoad]);

  // Draw Navigation Routes when computed
  useEffect(() => {
    if (!routesLayerRef.current) return;
    routesLayerRef.current.clearLayers();

    calculatedRoutes.forEach((route) => {
      const isFlooded = route.isFlooded;
      const isSelected = activeNavRoute?.id === route.id;
      const color = isFlooded ? '#dc2626' : '#10b981';
      const weight = isSelected ? 7 : 4;
      const dashArray = isFlooded ? '8, 8' : undefined;

      const poly = L.polyline(route.path, {
        color,
        weight,
        opacity: isSelected ? 0.95 : 0.6,
        dashArray,
      });

      poly.on('click', () => {
        setActiveNavRoute(route);
        soundAlert.playDispatchChime();
      });

      routesLayerRef.current?.addLayer(poly);
    });
  }, [calculatedRoutes, activeNavRoute]);

  // Draw Incidents & SOS Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const filtered = incidents.filter((inc) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'verified_danger') return inc.uncertaintyStatus === 'verified_danger';
      if (activeFilter === 'unverified_report') return inc.uncertaintyStatus === 'unverified_report';
      if (activeFilter === 'unknown_condition') return inc.uncertaintyStatus === 'unknown_condition';
      if (activeFilter === 'critical') return inc.severity === 'critical';
      if (activeFilter === 'roadblock') return inc.category === 'roadblock';
      if (activeFilter === 'safe') return inc.severity === 'safe';
      return true;
    });

    filtered.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const isVerified = inc.uncertaintyStatus === 'verified_danger';
      const isUnverified = inc.uncertaintyStatus === 'unverified_report';
      const isUnknown = inc.uncertaintyStatus === 'unknown_condition';
      const isSafe = inc.severity === 'safe';

      let bgClass = 'bg-red-600 text-white border-2 border-white';
      let iconSymbol = '!';
      let statusPill = 'Verified';

      if (isSafe) {
        bgClass = 'bg-emerald-600 text-white border-2 border-white';
        iconSymbol = '✓';
        statusPill = 'Safe Zone';
      } else if (isUnknown) {
        bgClass = 'bg-indigo-600 text-white border-2 border-indigo-200 border-dashed';
        iconSymbol = '?';
        statusPill = 'Survey Needed';
      } else if (isUnverified) {
        bgClass = 'bg-amber-500 text-slate-950 border-2 border-white';
        iconSymbol = '▲';
        statusPill = 'Unverified';
      } else {
        bgClass = 'bg-red-600 text-white border-2 border-white';
        iconSymbol = '!';
        statusPill = 'Verified Danger';
      }

      const pulseHtml = (isVerified && !isSafe)
        ? `<div class="absolute -inset-2 rounded-full bg-red-500/40 radar-ping pointer-events-none"></div>`
        : isUnverified
        ? `<div class="absolute -inset-2 rounded-full bg-amber-500/30 animate-pulse pointer-events-none"></div>`
        : '';

      const markerHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group">
          ${pulseHtml}
          <div class="w-8 h-8 rounded-full ${bgClass} shadow-xl flex items-center justify-center font-bold text-xs transform transition-transform hover:scale-125 ${
            isSelected ? 'scale-125 ring-4 ring-sky-400' : ''
          }">
            ${iconSymbol}
          </div>
          <span class="text-[9px] font-mono font-bold mt-0.5 px-1 py-0.2 rounded bg-slate-900/90 text-white shadow whitespace-nowrap">
            ${inc.code} • ${statusPill}
          </span>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black/80 rounded-full"></div>
        </div>
      `;

      const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
        icon: L.divIcon({
          className: 'custom-incident-pin',
          html: markerHtml,
          iconSize: [40, 48],
          iconAnchor: [20, 36],
        }),
      });

      marker.on('click', () => {
        onSelectIncident(inc);
        soundAlert.playEmergencyBeep();
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [incidents, selectedIncident, activeFilter]);

  // Compute Navigation Route between origin & destination
  const handleCalculateRoute = () => {
    const origin = MOCK_INDIA_LOCATIONS.find((l) => l.id === originId) || relevantLocations[0];
    const dest = MOCK_INDIA_LOCATIONS.find((l) => l.id === destId) || relevantLocations[1];

    if (!origin || !dest) return;

    const routes = getNavigationRoutes(origin.coords, dest.coords, activeFloodedRoads);
    setCalculatedRoutes(routes);
    setActiveNavRoute(routes[0]); // Default to safe recommended
    soundAlert.playDispatchChime();

    // Fit map bounds to show full route
    if (mapInstanceRef.current && routes[0]) {
      const bounds = L.latLngBounds(routes[0].path);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Broadcast Alert Helper
  const handleBroadcastAlert = () => {
    if (!selectedRoad) return;
    const alertMsg = `🚨 ResQGrid Flood Road Advisory:\n${selectedRoad.roadName} is SUBMERGED under ${selectedRoad.waterDepth} of water!\n⛔ Closure: ${selectedRoad.closureType}\n✅ SAFE ROUTE: ${selectedRoad.alternateSuggestion}\nDial 112 for emergency extraction.`;
    navigator.clipboard.writeText(alertMsg);
    setCopiedBroadcast(true);
    soundAlert.playDispatchChime();
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  // Quick City Jumps across India
  const jumpToCity = (city: 'varanasi' | 'bengaluru' | 'patna' | 'mumbai' | 'delhi' | 'india') => {
    if (!mapInstanceRef.current) return;
    soundAlert.playDispatchChime();

    switch (city) {
      case 'varanasi':
        mapInstanceRef.current.flyTo([25.3176, 82.9739], 13);
        break;
      case 'bengaluru':
        mapInstanceRef.current.flyTo([12.7209, 77.2799], 12);
        break;
      case 'patna':
        mapInstanceRef.current.flyTo([25.5941, 85.1376], 12);
        break;
      case 'delhi':
        mapInstanceRef.current.flyTo([28.6139, 77.2090], 11);
        break;
      case 'mumbai':
        mapInstanceRef.current.flyTo([19.0760, 72.8777], 11);
        break;
      case 'india':
        mapInstanceRef.current.flyTo([20.5937, 78.9629], 5);
        break;
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-100 dark:bg-[#070d1d] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#17254c] shadow-xl select-none group flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* City Quick Jumps */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-[#0b142d]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-[#1d2d5a] shadow-lg pointer-events-auto">
          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-500" /> India:
          </span>
          <button
            onClick={() => jumpToCity('varanasi')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-sky-600/30 rounded-lg transition-colors"
          >
            Varanasi (UP)
          </button>
          <button
            onClick={() => jumpToCity('bengaluru')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-sky-600/30 rounded-lg transition-colors"
          >
            Bengaluru (KA)
          </button>
          <button
            onClick={() => jumpToCity('patna')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-sky-600/30 rounded-lg transition-colors"
          >
            Patna (Bihar)
          </button>
          <button
            onClick={() => jumpToCity('delhi')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-sky-600/30 rounded-lg transition-colors"
          >
            Delhi
          </button>
          <button
            onClick={() => jumpToCity('india')}
            className="px-2 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-600/30 rounded-lg transition-colors"
          >
            All India
          </button>
          {onSwitchToGoogle && (
            <button
              onClick={onSwitchToGoogle}
              className="px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 rounded-lg transition-colors flex items-center gap-1 border border-emerald-300 dark:border-emerald-500/40 ml-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Maps Engine</span>
            </button>
          )}
        </div>

        {/* Responsible AI: Uncertainty States Filter Strip */}
        <div className="flex flex-wrap items-center gap-1 bg-white/95 dark:bg-[#0b142d]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-[#1d2d5a] shadow-lg pointer-events-auto">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider">
            Uncertainty:
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-sky-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All States ({incidents.length})
          </button>
          <button
            onClick={() => setActiveFilter('verified_danger')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeFilter === 'verified_danger'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Verified Danger ({incidents.filter(i => i.uncertaintyStatus === 'verified_danger').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('unverified_report')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeFilter === 'unverified_report'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Unverified ({incidents.filter(i => i.uncertaintyStatus === 'unverified_report').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('unknown_condition')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeFilter === 'unknown_condition'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 border border-white" />
            <span>Unknown ({incidents.filter(i => i.uncertaintyStatus === 'unknown_condition').length})</span>
          </button>
        </div>

        {/* Filter & Navigation Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowNavDrawer(!showNavDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              showNavDrawer
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white ring-2 ring-sky-400/50'
                : 'bg-white/95 dark:bg-[#0b142d]/90 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-[#1d2d5a] hover:bg-slate-50 dark:hover:bg-[#121f44]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Flood Navigation Helper</span>
          </button>
        </div>
      </div>

      {/* Map Control Tools (Left Edge) */}
      <div className="absolute top-16 left-3 z-[1000] flex flex-col gap-1.5 bg-white/95 dark:bg-[#0b142d]/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-[#1c2c58] shadow-lg">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111c3b] hover:bg-sky-600 text-slate-700 dark:text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111c3b] hover:bg-sky-600 text-slate-700 dark:text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 dark:bg-[#1c2c58]" />
        <button
          onClick={() => {
            const center: [number, number] = scenarioState === 'KA' ? [12.7209, 77.2799] : [25.3176, 82.9739];
            mapInstanceRef.current?.flyTo(center, 13);
          }}
          title="Recenter Map"
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111c3b] hover:bg-sky-600 text-slate-700 dark:text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <Locate className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Map Layer Style"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              showLayerMenu ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-[#111c3b] hover:bg-sky-600 text-slate-700 dark:text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          {showLayerMenu && (
            <div className="absolute left-10 top-0 w-36 bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#203264] rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <button
                onClick={() => { setTileStyle('streets'); setShowLayerMenu(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg ${tileStyle === 'streets' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162347]'}`}
              >
                OpenStreetMaps (Light)
              </button>
              <button
                onClick={() => { setTileStyle('dark'); setShowLayerMenu(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg ${tileStyle === 'dark' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162347]'}`}
              >
                Dark Tactical
              </button>
              <button
                onClick={() => { setTileStyle('satellite'); setShowLayerMenu(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg ${tileStyle === 'satellite' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162347]'}`}
              >
                Satellite Imagery
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 relative focus:outline-none"
      />

      {/* Floating Flood Navigation & Road Suggestion Drawer */}
      {showNavDrawer && (
        <div className="absolute top-16 right-3 z-[1000] w-80 sm:w-96 bg-white/95 dark:bg-[#0b142d]/95 backdrop-blur-md border border-slate-200 dark:border-[#1f3266] rounded-2xl shadow-2xl p-4 text-xs space-y-3 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#182852] pb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Flood-Aware Road Navigator</h4>
            </div>
            <button
              onClick={() => setShowNavDrawer(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            Checks real-time submerged roads in India and computes safe bypass routes around inundated zones.
          </p>

          {/* Origin & Destination Selectors */}
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

          {/* Computed Route Results */}
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

                  {/* Turn by turn guidance snippet */}
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

      {/* Flooded Road Inspector Card (When user clicks a flooded road segment) */}
      {selectedRoad && (
        <div className="absolute bottom-12 right-3 z-[1000] w-80 sm:w-96 bg-white/95 dark:bg-[#0c152e]/95 backdrop-blur-md border border-slate-200 dark:border-[#233568] rounded-2xl shadow-2xl p-4 text-xs space-y-2.5 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-150">
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
            <button
              onClick={() => setSelectedRoad(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
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

      {/* Bottom Map Legend - Uncertainty-Aware States */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-[#0a1226]/90 backdrop-blur-md border border-slate-200 dark:border-[#1b2b56] rounded-xl p-2.5 shadow-lg text-xs flex flex-wrap items-center gap-3.5 pointer-events-auto">
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
