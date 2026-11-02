import React from 'react';
import { 
  Home, 
  AlertTriangle, 
  Radio, 
  FileText, 
  Users, 
  Package, 
  Sparkles, 
  Settings, 
  Smartphone,
  Camera,
  Navigation,
  LogOut,
  Layers
} from 'lucide-react';
import { HELICOPTER_IMAGE } from '../data/disasterData';

export type NavView = 
  | 'command-centre'
  | 'incidents'
  | 'situation-room'
  | 'evidence-analyser'
  | 'resource-allocation'
  | 'sos-requests'
  | 'reports'
  | 'rescue-ops'
  | 'resources'
  | 'ai-briefing'
  | 'settings'
  | 'citizen-app'
  | 'field-reporter'
  | 'route-ops';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  sosCount: number;
  reportsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  sosCount,
  reportsCount
}) => {
  const primaryNavItems = [
    { id: 'command-centre' as NavView, label: 'Command Centre', icon: Home },
    { id: 'situation-room' as NavView, label: 'Crisis Situation Room', icon: Radio, badge: 1, badgeColor: 'bg-sky-600' },
    { id: 'evidence-analyser' as NavView, label: 'Ground Evidence Forensics', icon: Camera },
    { id: 'resource-allocation' as NavView, label: 'Resource Allocation Matrix', icon: Package },
    { id: 'route-ops' as NavView, label: 'Evacuation Route Intelligence', icon: Navigation },
    { id: 'incidents' as NavView, label: 'Incidents Feed', icon: AlertTriangle },
    { id: 'sos-requests' as NavView, label: 'SOS Beacons', icon: Radio, badge: sosCount, badgeColor: 'bg-red-500' },
    { id: 'reports' as NavView, label: 'Citizen Reports', icon: FileText, badge: reportsCount, badgeColor: 'bg-blue-500' },
    { id: 'rescue-ops' as NavView, label: 'Rescue Operations', icon: Users },
    { id: 'resources' as NavView, label: 'Supply Depots', icon: Package },
    { id: 'ai-briefing' as NavView, label: 'Geospatial SitRep', icon: FileText },
    { id: 'settings' as NavView, label: 'System Settings', icon: Settings },
  ];

  const companionViews = [
    { id: 'citizen-app' as NavView, label: "Citizen SOS App", icon: Smartphone, tag: 'Mobile' },
    { id: 'field-reporter' as NavView, label: 'Field Reporter', icon: Camera, tag: 'Portal' },
    { id: 'route-ops' as NavView, label: 'Route Navigator', icon: Navigation, tag: 'Routes' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0a1124] border-r border-slate-200 dark:border-[#152347] flex flex-col shrink-0 select-none h-screen sticky top-0 overflow-y-auto transition-colors">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-200 dark:border-[#152347]/80 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-50 dark:bg-[#0a1124] rounded-[10px] flex items-center justify-center">
            {/* Hexagonal Wave Crest Icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-500 dark:text-sky-400 fill-current" strokeWidth="0">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L19 8.5v7l-7 3.9-7-3.9v-7L12 4.2zM7 11.5c1.2-1.2 2.8-1.2 4 0 1.2 1.2 2.8 1.2 4 0v1.8c-1.2 1.2-2.8 1.2-4 0-1.2-1.2-2.8-1.2-4 0v-1.8zm0 3.5c1.2-1.2 2.8-1.2 4 0 1.2 1.2 2.8 1.2 4 0v1.8c-1.2 1.2-2.8 1.2-4 0-1.2-1.2-2.8-1.2-4 0V15z"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
            ResQGrid
          </h1>
          <p className="text-[11px] font-semibold tracking-wide text-sky-600 dark:text-sky-400/90 uppercase">
            Alert • Analyse • Act
          </p>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="px-3 py-4 flex-1 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
          Command Deck
        </div>
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white font-semibold shadow-md shadow-sky-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121f44]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-sky-400 group-hover:text-sky-600 dark:group-hover:text-sky-300'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Companion Interfaces Section */}
        <div className="pt-5 pb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase flex items-center justify-between">
          <span>Companion Portals</span>
          <Layers className="w-3 h-3 text-slate-400" />
        </div>
        {companionViews.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121f44]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-[#14234b] text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-sky-900/40">
                {item.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Mission Card */}
      <div className="p-3">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1e3266] shadow-lg group">
          <img 
            src={HELICOPTER_IMAGE} 
            alt="Search and Rescue Mission" 
            className="w-full h-36 object-cover brightness-95 dark:brightness-90 group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 dark:from-[#080e1e] via-slate-900/60 dark:via-[#080e1e]/60 to-transparent p-3.5 flex flex-col justify-end">
            <span className="text-xs font-bold text-white tracking-wide drop-shadow-md">
              Together for<br />a Safer Tomorrow
            </span>
            <span className="text-[10px] text-sky-300 font-mono mt-0.5">
              NDRF • SDRF • Citizen Grid
            </span>
          </div>
        </div>

        {/* User Session Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#152347] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">HQ Node Active</span>
          </div>
          <button 
            onClick={() => onSelectView('settings')}
            className="p-1 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-[#121f44] transition-colors"
            title="Session Info"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
