import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  HardHat, 
  Package, 
  ChevronDown, 
  TrendingUp 
} from 'lucide-react';
import { DisasterScenario, ALL_SCENARIOS } from '../data/disasterData';

interface TopKpiStripProps {
  currentScenario: DisasterScenario;
  onSelectScenario: (scenario: DisasterScenario) => void;
  onFilterByCategory?: (category: string) => void;
  onOpenRescueOps?: () => void;
  onOpenResources?: () => void;
}

export const TopKpiStrip: React.FC<TopKpiStripProps> = ({
  currentScenario,
  onSelectScenario,
  onOpenRescueOps,
  onOpenResources,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-5 pb-2">
      {/* 1. Active Disaster Card */}
      <div className="relative bg-white dark:bg-[#0e1732] border border-slate-200 dark:border-[#1b2b57] rounded-2xl p-4 shadow-sm dark:shadow-lg flex items-center gap-4 group hover:border-red-500/40 transition-all">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-wide">
            Active Disaster
          </span>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-300 transition-colors w-full text-left truncate"
          >
            <span className="truncate">{currentScenario.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
            Since: {currentScenario.activeSince}
          </span>
        </div>

        {/* Dropdown for quick disaster selection */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#0d162f] border border-slate-200 dark:border-[#203264] rounded-xl shadow-2xl p-1.5 z-40">
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Change Active Theatre
            </div>
            {ALL_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  onSelectScenario(sc);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  sc.id === currentScenario.id 
                    ? 'bg-sky-600 text-white font-semibold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#152347] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="font-medium">{sc.name}</div>
                <div className="text-[10px] opacity-75">{sc.region}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. People Affected */}
      <div className="bg-white dark:bg-[#0e1732] border border-slate-200 dark:border-[#1b2b57] rounded-2xl p-4 shadow-sm dark:shadow-lg flex items-center gap-4 group hover:border-sky-500/40 transition-all">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/30 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-sky-500 dark:text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-wide">
            People Affected
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              ~ {currentScenario.stats.totalAffected.toLocaleString()}
            </span>
            <span className="flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              12%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
            Ward & Village Census Sync
          </span>
        </div>
      </div>

      {/* 3. Rescue Teams */}
      <div 
        onClick={onOpenRescueOps}
        className="bg-white dark:bg-[#0e1732] border border-slate-200 dark:border-[#1b2b57] rounded-2xl p-4 shadow-sm dark:shadow-lg flex items-center gap-4 group hover:border-amber-500/40 transition-all cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <HardHat className="w-6 h-6 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-wide">
            Rescue Teams
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
            {currentScenario.stats.rescueTeamsDeployed} Deployed
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-mono block mt-0.5">
            4 Standby in Staging Base
          </span>
        </div>
      </div>

      {/* 4. Resources on Route */}
      <div 
        onClick={onOpenResources}
        className="bg-white dark:bg-[#0e1732] border border-slate-200 dark:border-[#1b2b57] rounded-2xl p-4 shadow-sm dark:shadow-lg flex items-center gap-4 group hover:border-blue-500/40 transition-all cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-wide">
            Resources on Route
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
            {currentScenario.stats.trucksOnRoute} Trucks
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
            Rations & Medical Supply Convoy
          </span>
        </div>
      </div>
    </div>
  );
};
