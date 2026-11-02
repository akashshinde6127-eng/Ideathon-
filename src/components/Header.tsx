import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ShieldAlert, 
  CheckCircle2, 
  Radio, 
  Smartphone, 
  Camera, 
  Navigation2,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { DisasterScenario, ALL_SCENARIOS } from '../data/disasterData';
import { NavView } from './Sidebar';
import { soundAlert } from '../utils/audioAlert';

interface HeaderProps {
  currentScenario: DisasterScenario;
  onSelectScenario: (scenario: DisasterScenario) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  unreadNotifications: number;
  onClearNotifications: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onTriggerSosSimulation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  searchQuery,
  onSearchChange,
  currentView,
  onSelectView,
  unreadNotifications,
  onClearNotifications,
  theme,
  onToggleTheme,
  onTriggerSosSimulation,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundAlert.enabled = next;
    if (next) soundAlert.playDispatchChime();
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-[#080e1e]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#152347] px-5 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30 select-none shadow-sm dark:shadow-none transition-colors">
      {/* Left: Search input */}
      <div className="flex-1 max-w-xs sm:max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search incidents, locations, teams, wards..."
          className="w-full bg-slate-100 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl pl-10 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Center: Quick Scenario Switcher */}
      <div className="relative hidden md:block">
        <button
          onClick={() => setShowScenarioMenu(!showScenarioMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0d1730] border border-slate-200 dark:border-[#1c2c59] text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-sky-500/50 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Region:</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">{currentScenario.name} ({currentScenario.state})</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showScenarioMenu && (
          <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#1e3266] rounded-xl shadow-2xl py-1.5 z-50">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#17264e]">
              Active Operational Theatres
            </div>
            {ALL_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectScenario(s);
                  setShowScenarioMenu(false);
                  soundAlert.playDispatchChime();
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#152347] transition-colors ${
                  s.id === currentScenario.id ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">{s.name} - {s.state}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.region}</div>
                </div>
                {s.id === currentScenario.id && <span className="text-[10px] text-sky-500 dark:text-sky-400">Active</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Companion View Pills */}
      <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-[#0b142c] p-1 rounded-xl border border-slate-200 dark:border-[#18264d]">
        <button
          onClick={() => onSelectView('command-centre')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            currentView === 'command-centre'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Command Deck
        </button>
        <button
          onClick={() => onSelectView('citizen-app')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            currentView === 'citizen-app'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          <span>Citizen SOS</span>
        </button>
        <button
          onClick={() => onSelectView('field-reporter')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            currentView === 'field-reporter'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Camera className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span>Field Reporter</span>
        </button>
        <button
          onClick={() => onSelectView('route-ops')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            currentView === 'route-ops'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Navigation2 className="w-3 h-3 text-sky-500 dark:text-sky-400" />
          <span>Routes</span>
        </button>
      </div>

      {/* Right: Live Status, Theme Toggle, Time, Alerts & User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Simulate SOS Duplicate Check button */}
        {onTriggerSosSimulation && (
          <button
            onClick={onTriggerSosSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm"
            title="Simulate incoming SOS to test proximity verification and duplicate detection"
          >
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="hidden sm:inline">Test SOS Alert</span>
          </button>
        )}

        {/* Theme Toggle Button (Light/White vs Dark Theme) */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-[#0d162f] dark:hover:bg-[#152347] dark:border-[#1c2c59] dark:text-slate-200 text-xs font-medium transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to White / Light Mode'}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline text-slate-800 font-semibold">Dark Theme</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-slate-200 font-semibold">White Theme</span>
            </>
          )}
        </button>

        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="tracking-wide text-[11px] font-mono">LIVE</span>
        </div>

        {/* Time Clock */}
        <div className="hidden sm:block font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#0d162f] border border-slate-200 dark:border-[#18264d]">
          {timeStr || '14:32:00 IST'}
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled 
              ? 'bg-slate-100 dark:bg-[#0d162f] border-slate-200 dark:border-[#1c2c59] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300' 
              : 'bg-slate-100 dark:bg-[#0d162f] border-slate-200 dark:border-[#1c2c59] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Emergency Chimes: ON' : 'Emergency Chimes: MUTED'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadNotifications > 0) {
                onClearNotifications();
              }
            }}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1c2c59] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#1e3266] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#19284e]">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Emergency Dispatch Alerts</span>
                <span className="text-[10px] text-sky-500 dark:text-sky-400">All Nodes Active</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5" /> High Priority Alert
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Water levels surged +12cm in Sector 4. Immediate boat deployment recommended.</p>
                  <span className="text-[10px] text-slate-400 font-mono">1 min ago</span>
                </div>
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold text-[11px]">
                    <Radio className="w-3.5 h-3.5" /> Citizen SOS Cluster
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">3 new SOS pings from Varanasi South. Coordinates synced to tactical map.</p>
                  <span className="text-[10px] text-slate-400 font-mono">4 mins ago</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Relief Convoy Arrival
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Trucks Alpha-3 & Alpha-4 reached BHU relief shelter safely.</p>
                  <span className="text-[10px] text-slate-400 font-mono">12 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-slate-100 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1c2c59] hover:border-sky-500/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-400 text-white font-bold text-xs flex items-center justify-center shadow-md">
              A
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#1e3266] rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#18274f]">
                <div className="font-semibold text-slate-900 dark:text-white">Commander Akash</div>
                <div className="text-[10px] text-sky-500 dark:text-sky-400">Emergency Ops Director</div>
              </div>
              <button 
                onClick={() => { onSelectView('settings'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162449] hover:text-slate-900 dark:hover:text-white"
              >
                Control Console Settings
              </button>
              <button 
                onClick={() => { onSelectView('reports'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162449] hover:text-slate-900 dark:hover:text-white"
              >
                NDRF Incident Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
