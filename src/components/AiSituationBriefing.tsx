import React, { useState } from 'react';
import { Radio, FileText, CheckCircle, RefreshCw, Copy, Check, Activity, ShieldAlert, Satellite } from 'lucide-react';
import { soundAlert } from '../utils/audioAlert';

interface AiSituationBriefingProps {
  disasterName: string;
  region: string;
  roadBlockagesCount: number;
  teamsDeployedCount: number;
  onOpenReportModal?: () => void;
}

export const AiSituationBriefing: React.FC<AiSituationBriefingProps> = ({
  disasterName,
  region,
  roadBlockagesCount,
  teamsDeployedCount,
  onOpenReportModal,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [briefingText, setBriefingText] = useState({
    situation: `Hydrological telemetry confirms river stage at +1.58m above danger threshold in ${region}. ${roadBlockagesCount} primary arterials impassable. ${teamsDeployedCount} NDRF/SDRF tactical waterborne teams active in forward sectors.`,
    actions: [
      'Prioritize medical supply drop & pediatric kits in low-lying zones via Route A bypass',
      'Maintain police barricades on submerged expressway underpasses',
      'Authorize civil defence distribution of 2,400 dry ration packs at BHU hub'
    ]
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    soundAlert.playDispatchChime();

    setTimeout(() => {
      setBriefingText({
        situation: `Sensor Fusion Cycle [${new Date().toLocaleTimeString()}]: Satellite radar detects +8% flood recession in western sector, but drainage bottlenecks persist near old city culverts. Critical SOS alerts concentrated around low-lying river wards.`,
        actions: [
          'Deploy Team Alpha inflatable zodiac boats to Varanasi sector 4 immediately',
          'Authorize civil defence distribution of 2,400 dry ration packs at BHU hub',
          'Enforce strict heavy-vehicle restriction along partially submerged causeways'
        ]
      });
      setIsGenerating(false);
      if (onOpenReportModal) onOpenReportModal();
    }, 1000);
  };

  const handleCopy = () => {
    const text = `ResQGrid Geospatial SitRep (${disasterName} - ${region})\n\nSituation:\n${briefingText.situation}\n\nRecommended Actions:\n${briefingText.actions.map(a => `• ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between relative group transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#18274f]">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
            Geospatial Intelligence SitRep
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
              CWC • IMD Feed
            </span>
          </h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1 text-[11px] font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 px-2.5 py-1 rounded-lg shadow transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing...' : 'Refresh Intel'}</span>
        </button>
      </div>

      {/* Body: Live Radar Telemetry Visualizer + Briefing text */}
      <div className="flex items-start gap-3 py-2.5">
        {/* Radar Telemetry Graphic (Replaced toy robot with high-tech CWC/IMD radar gauge) */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-sky-400/40 shrink-0 shadow-md flex items-center justify-center">
          {/* Radar Sweep Animation */}
          <div className="absolute inset-0 rounded-full border border-sky-500/20 m-1" />
          <div className="absolute inset-0 rounded-full border border-sky-500/40 m-3" />
          <div className="absolute inset-0 rounded-full border border-sky-500/60 m-5" />
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent to-sky-400 origin-center animate-spin" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 top-3 right-4 animate-ping" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 bottom-3 left-4" />
          <span className="absolute bottom-0.5 text-[8px] font-mono text-sky-300 font-bold tracking-tighter">
            RADAR-04
          </span>
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0 space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              Operational Assessment:
            </span>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 mt-0.5">
              {briefingText.situation}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Forward Tactical Priority:
            </span>
            <ul className="space-y-1 mt-1 text-[11px] text-slate-700 dark:text-slate-300">
              {briefingText.actions.slice(0, 2).map((act, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <CheckCircle className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span className="truncate">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-[#18274f] flex items-center justify-between text-[11px]">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          Source: CWC Hydro Telemetry & NDRF 11th Bn
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
            title="Copy SitRep"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <FileText className="w-3 h-3" />
            <span className="text-[10px]">Full Intel PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
