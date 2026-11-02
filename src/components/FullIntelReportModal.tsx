import React from 'react';
import { X, FileText, Download, Printer, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { DisasterScenario } from '../types/disaster';
import { AI_ROBOT_IMAGE } from '../data/disasterData';

interface FullIntelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: DisasterScenario;
}

export const FullIntelReportModal: React.FC<FullIntelReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-[#203264] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#18274f] flex items-center justify-between bg-slate-50 dark:bg-[#080e1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Disaster Intelligence & Operational Briefing</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Document Ref: RG-SITREP-2026-0428 • NDRF Command Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#152347] transition-colors"
              title="Print Briefing"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#152347] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
          {/* Situation Title Banner */}
          <div className="bg-slate-50 dark:bg-[#101b3b] border border-slate-200 dark:border-[#1d2d5a] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                CLASSIFIED TACTICAL SITREP • LEVEL 3 ALERT
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {scenario.name} – {scenario.region}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                Operational Window: Active since {scenario.activeSince}
              </span>
            </div>
            <img
              src={AI_ROBOT_IMAGE}
              alt="AI Assistant"
              className="w-12 h-12 rounded-xl border border-sky-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Key Quantitative Indicators */}
          <div>
            <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2 font-mono">
              01. Executive Key Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-slate-50 dark:bg-[#0e1732] p-3 rounded-xl border border-slate-200 dark:border-[#1a2b54]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Total Affected</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                  ~ {scenario.stats.totalAffected.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0e1732] p-3 rounded-xl border border-slate-200 dark:border-[#1a2b54]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Citizen Confirmed Safe</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {scenario.stats.safeCount.toLocaleString()} ({Math.round((scenario.stats.safeCount / scenario.stats.totalAffected) * 100)}%)
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0e1732] p-3 rounded-xl border border-slate-200 dark:border-[#1a2b54]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Critical Active SOS</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
                  {scenario.stats.sosActiveCount}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0e1732] p-3 rounded-xl border border-slate-200 dark:border-[#1a2b54]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Rescue Units Deployed</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {scenario.stats.rescueTeamsDeployed} Teams
                </span>
              </div>
            </div>
          </div>

          {/* Meteorological & Hydrological Synthesis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider font-mono">
              02. Meteorological & Hydrological Synthesis
            </h4>
            <div className="bg-slate-50 dark:bg-[#0e1732] p-4 rounded-xl border border-slate-200 dark:border-[#1a2b54] space-y-2 text-slate-700 dark:text-slate-300">
              <p>{scenario.summary}</p>
              <p>
                River gauge sensors along the basin indicate high discharge rates resulting from sustained cloudburst precipitation.
                Satellite optical and Synthetic Aperture Radar (SAR) imagery confirm inundation of low-lying settlements across 6 municipal wards.
              </p>
            </div>
          </div>

          {/* High Priority Directives */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
              03. Recommended Operational Directives
            </h4>
            <div className="bg-slate-50 dark:bg-[#0e1732] p-4 rounded-xl border border-slate-200 dark:border-[#1a2b54] space-y-2.5 text-slate-800 dark:text-slate-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Route Corridors:</span> Maintain primary convoy routing exclusively via Route A (Elevated Bypass). Prohibit civilian and light vehicle access onto submerged low-elevation causeways.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Medical Supply Replenishment:</span> Dispatch emergency pediatric rehydration kits, anti-venom, and water purification tablets to staging camps.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Drone Aerial Surveillance:</span> Continuous 30-minute orbit surveillance over bridge pillars to verify structural soundness before reopening arterial transit.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-[#18274f] bg-slate-50 dark:bg-[#080e1e] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono text-[11px]">ResQGrid Disaster Response Intelligence v3.2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors shadow"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
