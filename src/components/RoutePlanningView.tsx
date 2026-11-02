import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Navigation, 
  Send, 
  ShieldCheck, 
  Clock, 
  Layers, 
  HelpCircle,
  Sliders,
  Sparkles,
  Info,
  MapPin,
  Compass,
  ArrowRight,
  ShieldAlert,
  Radio,
  FileText
} from 'lucide-react';
import { RouteOption } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

interface RoutePlanningViewProps {
  routes: RouteOption[];
  onBackToCommand: () => void;
  disasterName: string;
  scenarioState?: string;
  theme?: 'light' | 'dark';
}

type MapTileStyle = 'streets' | 'satellite' | 'dark';

export const RoutePlanningView: React.FC<RoutePlanningViewProps> = ({
  routes,
  onBackToCommand,
  disasterName,
  scenarioState = 'UP',
  theme = 'light',
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'route-a');
  const [dispatchedRoute, setDispatchedRoute] = useState<string | null>(null);
  const [simulatedSurgeCm, setSimulatedSurgeCm] = useState<number>(0);
  const [tileStyle, setTileStyle] = useState<MapTileStyle>(theme === 'light' ? 'streets' : 'dark');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const surgeCircleRef = useRef<L.Circle | null>(null);

  // Sync theme
  useEffect(() => {
    setTileStyle(theme === 'light' ? 'streets' : 'dark');
  }, [theme]);

  // Setup / Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter: [number, number] = scenarioState === 'KA'
      ? [12.7209, 77.2799]
      : [25.3176, 82.9739];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Tile Layer setup
    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (tileStyle === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const tiles = L.tileLayer(tileUrl, { maxZoom: 19 });
    tiles.addTo(map);
    tileLayerRef.current = tiles;

    // Layer group for polylines and markers
    const routeGroup = L.layerGroup().addTo(map);
    routesLayerGroupRef.current = routeGroup;

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [scenarioState]);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (tileStyle === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const newTileLayer = L.tileLayer(tileUrl, { maxZoom: 19 });
    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [tileStyle]);

  // Redraw Routes, Markers, and Dynamic Surge Buffer whenever routes, selectedRoute, or surge changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = routesLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw all routes
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const isRouteA = route.id.includes('a');
      const isRouteB = route.id.includes('b');
      const isRouteC = route.id.includes('c');

      let color = '#10b981'; // Green for Route A
      let dashArray: string | undefined = undefined;
      let opacity = isSelected ? 0.95 : 0.45;
      let weight = isSelected ? 8 : 4;

      if (isRouteB) {
        color = '#ef4444'; // Red for Blocked Route B
        dashArray = '8, 8';
      } else if (isRouteC) {
        color = '#6366f1'; // Indigo for Unknown Route C
        dashArray = '4, 8';
      }

      // Draw background glow if selected
      if (isSelected) {
        const glowPolyline = L.polyline(route.path, {
          color: color,
          weight: 14,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        });
        glowPolyline.addTo(group);
      }

      // Main corridor polyline
      const polyline = L.polyline(route.path, {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Click on route to select
      polyline.on('click', () => {
        setSelectedRouteId(route.id);
        soundAlert.playEmergencyBeep();
      });

      // Tooltip
      polyline.bindTooltip(
        `<div class="font-sans text-xs font-bold ${
          isRouteA ? 'text-emerald-600' : isRouteB ? 'text-red-600' : 'text-indigo-600'
        }">${route.name} (${route.distance})</div><div class="text-[10px] text-slate-600">${route.statusLabel}</div>`,
        { sticky: true }
      );

      polyline.addTo(group);
    });

    // 2. Draw Start Point (Staging HQ)
    if (routes[0]?.path?.[0]) {
      const startCoord = routes[0].path[0];
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="background: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); font-weight: bold;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const startMarker = L.marker(startCoord, { icon: startIcon });
      startMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 4px;">
          <b style="color: #0284c7; font-size: 13px;">HQ Staging Depot</b>
          <div style="color: #475569; margin-top: 4px;">Emergency convoy staging and dispatch hub.</div>
        </div>
      `);
      startMarker.addTo(group);
    }

    // 3. Draw Destination Point (Relief Hub)
    const activePath = selectedRoute.path;
    if (activePath && activePath.length > 0) {
      const destCoord = activePath[activePath.length - 1];
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="background: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); font-weight: bold;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const destMarker = L.marker(destCoord, { icon: destIcon });
      destMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 4px;">
          <b style="color: #10b981; font-size: 13px;">Emergency Relief Hub</b>
          <div style="color: #475569; margin-top: 4px;">Destination for medical convoys and food drops.</div>
        </div>
      `);
      destMarker.addTo(group);
    }

    // 4. Draw Blocked Road Hazard Marker (Route B choke point)
    const routeB = routes.find((r) => r.id.includes('b'));
    if (routeB && routeB.path.length >= 3) {
      const chokeCoord = routeB.path[Math.floor(routeB.path.length / 2)];
      const currentWaterDepth = routeB.waterDepthCm + simulatedSurgeCm;

      const hazardIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #ef4444; color: white; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(239,68,68,0.7); animation: pulse 2s infinite;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div style="background: #0f172a; color: #fca5a5; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1px solid #ef4444; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
              Submerged (${currentWaterDepth}cm)
            </div>
          </div>
        `,
        iconSize: [40, 56],
        iconAnchor: [20, 28],
      });

      const hazardMarker = L.marker(chokeCoord, { icon: hazardIcon });
      hazardMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 4px;">
          <b style="color: #dc2626; font-size: 13px;">Verified Road Impasse</b>
          <div style="color: #64748b; margin-top: 4px;">
            Water Depth: <b>${currentWaterDepth} cm</b><br/>
            Current: Fast Runoff (1.4 m/s)<br/>
            Police Barrier Deployed.
          </div>
        </div>
      `);
      hazardMarker.addTo(group);

      // Dynamic water surge circle
      const surgeRadius = 180 + (simulatedSurgeCm * 12);
      const surgeCircle = L.circle(chokeCoord, {
        radius: surgeRadius,
        color: '#ef4444',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#0284c7',
        fillOpacity: 0.28 + (simulatedSurgeCm * 0.003),
      });
      surgeCircle.addTo(group);
      surgeCircleRef.current = surgeCircle;
    }

    // 5. Draw Unknown Telemetry Void Marker (Route C)
    const routeC = routes.find((r) => r.id.includes('c'));
    if (routeC && routeC.path.length >= 3) {
      const voidCoord = routeC.path[Math.floor(routeC.path.length / 2)];
      const voidIcon = L.divIcon({
        className: 'custom-void-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #6366f1; color: white; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(99,102,241,0.4); font-weight: 900; font-size: 15px;">
              ?
            </div>
            <div style="background: #0f172a; color: #c7d2fe; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; border: 1px solid #6366f1; margin-top: 4px; white-space: nowrap;">
              Node S-14 Void (${routeC.unknownConditionsKm} km)
            </div>
          </div>
        `,
        iconSize: [40, 56],
        iconAnchor: [20, 28],
      });

      const voidMarker = L.marker(voidCoord, { icon: voidIcon });
      voidMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 4px;">
          <b style="color: #6366f1; font-size: 13px;">Unknown Conditions Zone</b>
          <div style="color: #64748b; margin-top: 4px;">
            Telemetry Node S-14 offline due to storm power loss.<br/>
            Unmonitored span: <b>${routeC.unknownConditionsKm} km</b>.<br/>
            Do NOT dispatch unescorted convoys.
          </div>
        </div>
      `);
      voidMarker.addTo(group);
    }

    // Smoothly pan & fit bounds to selected route
    if (selectedRoute.path && selectedRoute.path.length > 0) {
      const bounds = L.latLngBounds(selectedRoute.path);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [routes, selectedRouteId, simulatedSurgeCm]);

  const handleSelectRoute = () => {
    setDispatchedRoute(selectedRoute.name);
    soundAlert.playDispatchChime();
    setTimeout(() => setDispatchedRoute(null), 4500);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBackToCommand}
          className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Centre</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-[#101b38] px-3 py-1 rounded-xl border border-slate-200 dark:border-[#1b2b54] shadow-xs">
            Theatre: {disasterName} ({scenarioState === 'KA' ? 'Karnataka' : 'Uttar Pradesh'})
          </span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Live Map Corridors Telemetry
          </span>
        </div>
      </div>

      {/* Hydrological Surge Simulator Control */}
      <div className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Hydrological Surge Simulator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300">
                Central Water Commission Catchment Model
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Dynamically simulate rainfall runoff on the real road network to verify structural resilience between corridors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-80">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
            Surge: +{simulatedSurgeCm} cm
          </span>
          <input 
            type="range"
            min="0"
            max="60"
            step="5"
            value={simulatedSurgeCm}
            onChange={(e) => setSimulatedSurgeCm(Number(e.target.value))}
            className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Dispatched Convoy Notification Banner */}
      {dispatchedRoute && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-3 shadow-lg animate-in fade-in duration-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold">Convoy Dispatched:</span> Command authorization granted for{' '}
            <span className="underline decoration-emerald-500">{dispatchedRoute}</span>. Police escort and forward telemetry checkpoints notified.
          </div>
        </div>
      )}

      {/* Main 2-Column Split: Real Map (7 cols) + Corridor Cards (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Real Interactive Leaflet Map */}
        <div className="lg:col-span-7 bg-white dark:bg-[#080f22] border border-slate-200 dark:border-[#182852] rounded-2xl p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          {/* Header on top of map */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#182852] z-10">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                Live Geospatial Route Navigator
              </h3>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#121f44] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1e305e] hover:bg-slate-200 dark:hover:bg-[#1a2d5f] transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span className="capitalize">{tileStyle}</span>
              </button>

              {showLayerMenu && (
                <div className="absolute top-8 right-0 bg-white dark:bg-[#0c152e] border border-slate-200 dark:border-[#1e305e] rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-1 w-28">
                  {(['streets', 'satellite', 'dark'] as MapTileStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        setTileStyle(style);
                        setShowLayerMenu(false);
                      }}
                      className={`text-left px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                        tileStyle === style
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#152347]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-500/20">
                Active: {selectedRoute?.name.split(' - ')[0]}
              </span>
            </div>
          </div>

          {/* Leaflet Real Map Container */}
          <div className="relative w-full h-[400px] my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-[#17254e]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Live Recommendation Badge */}
            <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#0c152e]/95 backdrop-blur-md border border-slate-200 dark:border-[#203264] rounded-xl p-2.5 shadow-lg max-w-xs z-10 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Recommended: Route A</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Elevated bypass ({selectedRoute?.elevationClearance || '+3.5m'}) remains completely dry with 100% active telemetry.
              </p>
            </div>
          </div>

          {/* Bottom Map Legend */}
          <div className="pt-2 border-t border-slate-200 dark:border-[#182852] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                <span className="w-3 h-1.5 bg-emerald-500 rounded" />
                Route A (Recommended • Dry)
              </span>
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                <span className="w-3 h-1.5 bg-red-500 rounded" />
                Route B (Verified Danger • Blocked)
              </span>
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                <span className="w-3 h-1.5 bg-indigo-500 rounded" />
                Route C (Unknown Conditions)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Click route line or card to pan camera
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Corridor Intelligence Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Corridor Comparison Matrix
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {routes.length} Corridors Evaluated
            </span>
          </div>

          {/* Route Options List */}
          <div className="space-y-3">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const isRouteA = route.id.includes('a');
              const isRouteB = route.id.includes('b');
              const isRouteC = route.id.includes('c');

              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    soundAlert.playEmergencyBeep();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/60 dark:bg-[#101e40] border-sky-400 dark:border-sky-500 shadow-md ring-1 ring-sky-400/40'
                      : 'bg-white dark:bg-[#0c152d] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {route.name}
                        </h4>
                        {route.recommended && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-600/50">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono font-semibold">
                          <Navigation className="w-3 h-3 text-slate-400" /> {route.distance}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" /> {route.eta}
                        </span>
                        <span className="font-mono text-slate-400">
                          {route.elevationClearance}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        route.status === 'available'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                          : route.status === 'blocked'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30'
                      }`}
                    >
                      {route.statusLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {route.riskDescription}
                  </p>

                  {/* Uncertainty & Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono">
                    <div className="bg-slate-50 dark:bg-[#070e1f] p-2 rounded-xl">
                      <span className="text-slate-400 block">Sensor Coverage</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {route.keyTradeoffs.sensorCoverage}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#070e1f] p-2 rounded-xl">
                      <span className="text-slate-400 block">Uncertainty Factor</span>
                      <span className={`font-bold ${route.uncertaintyPercentage > 20 ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {route.uncertaintyPercentage}% Void
                      </span>
                    </div>
                  </div>

                  {/* Why this corridor is recommended or blocked */}
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#081024] border border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Decision Rationale:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug">
                      {route.whyRecommendedOrBlocked}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button: Dispatch Selected Route */}
          <button
            onClick={handleSelectRoute}
            disabled={selectedRoute.status === 'blocked'}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
              selectedRoute.status === 'blocked'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : selectedRoute.status === 'unknown'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {selectedRoute.status === 'blocked'
                ? 'Corridor Blocked • Dispatch Prohibited'
                : selectedRoute.status === 'unknown'
                ? 'Authorize Advance Recon Scout (Caution)'
                : `Dispatch Main Relief Convoy via ${selectedRoute.name.split(' - ')[0]}`}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Turn-by-Turn Telemetry & Elevation Checkpoints */}
      <div className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Turn-by-Turn Tactical Waypoints: {selectedRoute.name}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {selectedRoute.path?.length || 0} GPS Waypoints Synchronized
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedRoute.turnInstructions && selectedRoute.turnInstructions.length > 0 ? (
            selectedRoute.turnInstructions.map((instruction, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080f22] border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {instruction}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-xs text-slate-400 text-center py-4">
              Waypoints mapped on live coordinates above.
            </div>
          )}
        </div>

        {/* Responsible AI Disclaimer */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-sky-500 shrink-0" />
          <span>
            <b>Responsible Geospatial Intelligence:</b> Route recommendations are calculated strictly from verified telemetry and sensor coverage. Where sensors are offline (Route C), ResQGrid flags unknown conditions explicitly rather than inferring safe passage.
          </span>
        </div>
      </div>
    </div>
  );
};
