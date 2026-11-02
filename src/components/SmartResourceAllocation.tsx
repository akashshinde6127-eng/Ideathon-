import React, { useState } from 'react';
import { 
  Package, 
  Droplet, 
  HeartPulse, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter, 
  Layers,
  Sparkles,
  Truck,
  LifeBuoy
} from 'lucide-react';
import { VillageResourceNeed, ResourceMetric } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

interface SmartResourceAllocationProps {
  villages?: VillageResourceNeed[];
  onDispatchSupplies?: (villageId: string, itemType: 'food' | 'water' | 'medical' | 'boat', amount: number) => void;
  onBackToCommand?: () => void;
}

export const SmartResourceAllocation: React.FC<SmartResourceAllocationProps> = ({
  villages = [],
  onDispatchSupplies,
  onBackToCommand
}) => {
  const [villageList, setVillageList] = useState<VillageResourceNeed[]>(villages);
  const [filterType, setFilterType] = useState<'all' | 'cut_off' | 'food' | 'water' | 'medical' | 'boats'>('all');
  const [dispatchedToast, setDispatchedToast] = useState<string | null>(null);

  // Sync if props update
  React.useEffect(() => {
    if (villages.length > 0) {
      setVillageList(villages);
    }
  }, [villages]);

  const handleDispatch = (villageId: string, type: 'food' | 'water' | 'medical' | 'boat', amount: number) => {
    soundAlert.playDispatchChime();
    setVillageList(prev => prev.map(vil => {
      if (vil.id !== villageId) return vil;
      if (type === 'food') {
        const nextFood = Math.min(vil.foodPacketsNeeded, vil.foodSupplied + amount);
        return { ...vil, foodSupplied: nextFood, priorityScore: Math.max(20, vil.priorityScore - 8) };
      }
      if (type === 'water') {
        const nextWater = Math.min(vil.waterLitresNeeded, vil.waterSupplied + amount);
        return { ...vil, waterSupplied: nextWater, priorityScore: Math.max(20, vil.priorityScore - 7) };
      }
      if (type === 'medical') {
        const nextMed = Math.min(vil.medicalKitsNeeded, vil.medicalSupplied + amount);
        return { ...vil, medicalSupplied: nextMed, priorityScore: Math.max(20, vil.priorityScore - 9) };
      }
      if (type === 'boat') {
        const nextTeams = vil.teamsAssigned + 1;
        return { ...vil, teamsAssigned: nextTeams, priorityScore: Math.max(20, vil.priorityScore - 12) };
      }
      return vil;
    }));

    const targetVillage = villageList.find(v => v.id === villageId);
    setDispatchedToast(`Dispatched ${amount} ${type.toUpperCase()} units to ${targetVillage?.villageName || 'Village'}`);
    setTimeout(() => setDispatchedToast(null), 3000);

    if (onDispatchSupplies) {
      onDispatchSupplies(villageId, type, amount);
    }
  };

  const filteredVillages = villageList.filter(v => {
    if (filterType === 'cut_off') return v.accessStatus === 'cut_off';
    if (filterType === 'food') return v.keyShortage === 'Food' || (v.foodPacketsNeeded - v.foodSupplied) > 800;
    if (filterType === 'water') return v.keyShortage === 'Water' || (v.waterLitresNeeded - v.waterSupplied) > 2000;
    if (filterType === 'medical') return v.keyShortage === 'Medicine' || (v.medicalKitsNeeded - v.medicalSupplied) > 100;
    if (filterType === 'boats') return v.keyShortage === 'Rescue Boat' || (v.rescueTeamsNeeded - v.teamsAssigned) > 0;
    return true;
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  const totalAffected = villageList.reduce((acc, v) => acc + v.affectedCount, 0);
  const totalFoodShortage = villageList.reduce((acc, v) => acc + (v.foodPacketsNeeded - v.foodSupplied), 0);
  const totalWaterShortage = villageList.reduce((acc, v) => acc + (v.waterLitresNeeded - v.waterSupplied), 0);
  const totalMedShortage = villageList.reduce((acc, v) => acc + (v.medicalKitsNeeded - v.medicalSupplied), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-['Plus_Jakarta_Sans']">
      {/* Toast feedback */}
      {dispatchedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{dispatchedToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Smart Resource Allocation
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  Priority Shortage Algorithm
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prioritizes emergency aid using severity weighting, affected population density, and current delivery deficit.
              </p>
            </div>
          </div>
        </div>

        {onBackToCommand && (
          <button
            onClick={onBackToCommand}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors w-max"
          >
            Back to Command Centre
          </button>
        )}
      </div>

      {/* High-Level Shortage Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Affected</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalAffected.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Across {villageList.length} monitored sectors</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Food Shortage</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {totalFoodShortage.toLocaleString()} <span className="text-xs font-normal">pkts</span>
          </p>
          <span className="text-[11px] text-slate-400">Net unfulfilled meals</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Water Shortage</span>
            <Droplet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {totalWaterShortage.toLocaleString()} <span className="text-xs font-normal">Litres</span>
          </p>
          <span className="text-[11px] text-slate-400">Potable drinking water deficit</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Medical Kit Gap</span>
            <HeartPulse className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {totalMedShortage.toLocaleString()} <span className="text-xs font-normal">kits</span>
          </p>
          <span className="text-[11px] text-slate-400">Anti-venom & trauma trauma supplies</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {[
            { id: 'all', label: 'All Villages' },
            { id: 'cut_off', label: 'Cut-Off Only' },
            { id: 'food', label: 'Food Shortfall' },
            { id: 'water', label: 'Water Shortfall' },
            { id: 'medical', label: 'Medical Kits' },
            { id: 'boats', label: 'Rescue Boats' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === tab.id
                  ? 'bg-white dark:bg-sky-600 text-sky-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Formula: (Severity × 0.4) + (Pop × 0.35) + (Shortfall × 0.25)</span>
        </div>
      </div>

      {/* Village Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredVillages.map((village, idx) => {
          const foodPct = Math.round((village.foodSupplied / village.foodPacketsNeeded) * 100);
          const waterPct = Math.round((village.waterSupplied / village.waterLitresNeeded) * 100);
          const medPct = Math.round((village.medicalSupplied / village.medicalKitsNeeded) * 100);

          return (
            <div 
              key={village.id}
              className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    village.priorityScore >= 90
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                      : village.priorityScore >= 75
                      ? 'bg-amber-500 text-white'
                      : 'bg-sky-600 text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {village.villageName}
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                        ({village.block})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {village.affectedCount.toLocaleString()} / {village.population.toLocaleString()} residents affected
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      Priority {village.priorityScore}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      village.accessStatus === 'cut_off'
                        ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                        : village.accessStatus === 'caution'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                    }`}>
                      {village.accessStatus === 'cut_off' ? 'Roads Cut Off' : village.accessStatus === 'caution' ? 'Caution Access' : 'Open Corridor'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Last supply: {village.lastDeliveredAgo}
                  </span>
                </div>
              </div>

              {/* Critical Shortage Alert Banner */}
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Immediate Bottleneck: <strong>{village.keyShortage}</strong> deficit</span>
                </div>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                  Deficit: {village.keyShortage === 'Food' ? `${village.foodPacketsNeeded - village.foodSupplied} pkts` : village.keyShortage === 'Water' ? `${village.waterLitresNeeded - village.waterSupplied} L` : village.keyShortage === 'Medicine' ? `${village.medicalKitsNeeded - village.medicalSupplied} kits` : `${village.rescueTeamsNeeded - village.teamsAssigned} boats`}
                </span>
              </div>

              {/* Shortage Meters */}
              <div className="space-y-2.5 pt-1">
                {/* Food */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Package className="w-3.5 h-3.5 text-amber-500" />
                      Food Rations: {village.foodSupplied.toLocaleString()} / {village.foodPacketsNeeded.toLocaleString()} pkts
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {foodPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${foodPct < 50 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, foodPct)}%` }}
                    />
                  </div>
                </div>

                {/* Water */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      Drinking Water: {village.waterSupplied.toLocaleString()} / {village.waterLitresNeeded.toLocaleString()} L
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {waterPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${waterPct < 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, waterPct)}%` }}
                    />
                  </div>
                </div>

                {/* Medicine */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                      Medical Kits: {village.medicalSupplied} / {village.medicalKitsNeeded} kits
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {medPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${medPct < 50 ? 'bg-red-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, medPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 1-Click Supply Allocation Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Dispatch:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDispatch(village.id, 'food', 500)}
                    disabled={village.foodSupplied >= village.foodPacketsNeeded}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 transition-colors disabled:opacity-40"
                  >
                    +500 Food
                  </button>
                  <button
                    onClick={() => handleDispatch(village.id, 'water', 1000)}
                    disabled={village.waterSupplied >= village.waterLitresNeeded}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 transition-colors disabled:opacity-40"
                  >
                    +1000L Water
                  </button>
                  <button
                    onClick={() => handleDispatch(village.id, 'medical', 50)}
                    disabled={village.medicalSupplied >= village.medicalKitsNeeded}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 hover:bg-red-100 transition-colors disabled:opacity-40"
                  >
                    +50 Med Kits
                  </button>
                  <button
                    onClick={() => handleDispatch(village.id, 'boat', 1)}
                    disabled={village.teamsAssigned >= village.rescueTeamsNeeded}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>+1 Boat</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
