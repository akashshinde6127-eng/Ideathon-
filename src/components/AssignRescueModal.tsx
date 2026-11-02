import React, { useState } from 'react';
import { X, Send, Truck, LifeBuoy, HeartPulse, Plane, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Incident, RescueTeam } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

interface AssignRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  teams: RescueTeam[];
  onConfirmDispatch: (incidentId: string, teamId: string, priorityRoute: string) => void;
}

export const AssignRescueModal: React.FC<AssignRescueModalProps> = ({
  isOpen,
  onClose,
  incident,
  teams,
  onConfirmDispatch,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [selectedRoute, setSelectedRoute] = useState<string>('Route A - Primary Elevated Bypass');
  const [priorityLevel, setPriorityLevel] = useState<'Code Red' | 'Code Amber'>('Code Red');
  const [notes, setNotes] = useState('');

  if (!isOpen || !incident) return null;

  const handleDispatch = () => {
    onConfirmDispatch(incident.id, selectedTeamId, selectedRoute);
    soundAlert.playDispatchChime();
    onClose();
  };

  const getTeamIcon = (type: RescueTeam['type']) => {
    switch (type) {
      case 'boat': return <LifeBuoy className="w-4 h-4 text-sky-400" />;
      case 'medical': return <HeartPulse className="w-4 h-4 text-emerald-400" />;
      case 'air': return <Plane className="w-4 h-4 text-amber-400" />;
      default: return <Truck className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#203264] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#18274f] flex items-center justify-between bg-slate-50 dark:bg-[#0a1125]">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assign Rescue Dispatch Unit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#152347] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Summary Card */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-slate-50 dark:bg-[#101b3a] border border-slate-200 dark:border-[#1d2d5a] rounded-xl p-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-1.5 py-0.5 rounded">
                  {incident.code}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{incident.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{incident.location} • {incident.distanceFromCenter}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Water Depth: {incident.waterLevelDepth || '1.1m'} | People: ~{incident.peopleAtRisk || 40}</p>
            </div>
          </div>

          {/* Select Rescue Team */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-2">
              Select Field Operational Unit
            </label>
            <div className="space-y-2">
              {teams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-[#132247] border-sky-500 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-slate-50 dark:bg-[#0f1a38] border-slate-200 dark:border-[#18274d] hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#091125] flex items-center justify-center border border-slate-200 dark:border-[#1b2b54] shadow-sm">
                        {getTeamIcon(team.type)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{team.name}</span>
                          {team.status === 'available' ? (
                            <span className="text-[9px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">Available</span>
                          ) : (
                            <span className="text-[9px] font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">Active Duty</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {team.vehicle} • {team.personnelCount} Personnel
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Route Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
              Approved Evacuation / Transit Corridor
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Route A - Primary Elevated Bypass (Clear, 24 km)">Route A - Primary Elevated Bypass (Clear, 24 km)</option>
              <option value="Route C - Secondary Ring Road (Watch for Slush, 29 km)">Route C - Secondary Ring Road (Watch for Slush, 29 km)</option>
              <option value="Air Transit - Direct Helo Extraction (7 mins flight)">Air Transit - Direct Helo Extraction (7 mins flight)</option>
            </select>
          </div>

          {/* Radio Priority */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
              Mission Dispatch Priority
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPriorityLevel('Code Red')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  priorityLevel === 'Code Red'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-100 dark:bg-[#101b3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1d2d5a]'
                }`}
              >
                Code Red (Life Threat)
              </button>
              <button
                type="button"
                onClick={() => setPriorityLevel('Code Amber')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  priorityLevel === 'Code Amber'
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-100 dark:bg-[#101b3a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1d2d5a]'
                }`}
              >
                Code Amber (Supply / Relocation)
              </button>
            </div>
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
              Instructions to Unit Leader
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Carry 4 extra child life jackets and insulin cooler box..."
              className="w-full bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#18274f] bg-slate-50 dark:bg-[#0a1125] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-lg shadow-sky-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Confirm & Dispatch Unit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
