import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Check, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  Camera, 
  Radio, 
  ExternalLink,
  Users,
  Droplets
} from 'lucide-react';
import { Incident } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

interface IncidentDetailsPanelProps {
  incident: Incident | null;
  onVerifyIncident: (id: string) => void;
  onOpenAssignModal: (incident: Incident) => void;
  onResolveIncident: (id: string) => void;
}

type TabType = 'details' | 'evidence' | 'actions';

export const IncidentDetailsPanel: React.FC<IncidentDetailsPanelProps> = ({
  incident,
  onVerifyIncident,
  onOpenAssignModal,
  onResolveIncident,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!incident) {
    return (
      <div className="w-full h-full min-h-[540px] bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors">
        <Radio className="w-12 h-12 text-slate-400 dark:text-slate-500 animate-pulse mb-3" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">No Incident Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Click on any marker on the tactical map or choose an item from the activity feed.
        </p>
      </div>
    );
  }

  const isVerified = incident.status === 'verified' || incident.status === 'dispatched';

  return (
    <div className="w-full h-full min-h-[540px] bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] rounded-2xl flex flex-col overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Top Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-[#18274f] px-4 pt-3 gap-6 bg-slate-50 dark:bg-[#0a1125]">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 ${
            activeTab === 'details'
              ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Incident Details
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Evidence ({incident.evidenceList.length || 1})</span>
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 ${
            activeTab === 'actions'
              ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Actions
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Header: Badge & Incident Code */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm shadow-red-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {incident.severity}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#14234b] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {incident.code}
                </span>
              </div>
              {incident.assignedTeam && (
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-500/20">
                  {incident.assignedTeam}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {incident.title}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{incident.timestamp}</span>
                  <span>•</span>
                  <span>{incident.distanceFromCenter}</span>
                </div>
              </div>
            </div>

            {/* Uncertainty-Aware Responsible AI State Banner */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              incident.uncertaintyStatus === 'verified_danger'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300'
                : incident.uncertaintyStatus === 'unverified_report'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  incident.uncertaintyStatus === 'verified_danger' ? 'bg-red-500' : incident.uncertaintyStatus === 'unverified_report' ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'
                }`} />
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  {incident.uncertaintyStatus === 'verified_danger' ? '1. Verified Danger' : incident.uncertaintyStatus === 'unverified_report' ? '2. Unverified Report' : '3. Unknown Condition'}
                </span>
              </div>
              <span className="text-[10px] font-mono opacity-80">
                {incident.uncertaintyStatus === 'verified_danger' ? '100% Confirmed' : incident.uncertaintyStatus === 'unverified_report' ? 'Crowdsourced' : 'Survey Needed'}
              </span>
            </div>

            {incident.uncertaintyReason && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic px-1">
                "{incident.uncertaintyReason}"
              </p>
            )}

            {/* Incident Photo */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#1b2b54] shadow-md group">
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 dark:bg-[#091122]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3 text-sky-400" />
                  Ground Sensor Camera 04
                </span>
                <span className="font-mono text-emerald-400">Live Feed Active</span>
              </div>
            </div>

            {/* Evidence Confidence Metric */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Evidence Confidence</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {incident.evidenceConfidence}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#142142] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm shadow-emerald-400/50"
                  style={{ width: `${incident.evidenceConfidence}%` }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 dark:bg-[#0f1a38] border border-slate-200 dark:border-[#1a2b56] rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {incident.description}
            </div>

            {/* Telemetry Pills */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-50 dark:bg-[#091125] p-2 rounded-lg border border-slate-200 dark:border-[#18274d] flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">Water Depth</span>
                  <span className="font-bold text-slate-900 dark:text-white">{incident.waterLevelDepth || '0.9m'}</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#091125] p-2 rounded-lg border border-slate-200 dark:border-[#18274d] flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase">People at Risk</span>
                  <span className="font-bold text-slate-900 dark:text-white">{incident.peopleAtRisk || 45}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Visual & Sensor Telemetry ({incident.evidenceList.length} Items)
            </div>
            {incident.evidenceList.map((ev, index) => (
              <div 
                key={ev.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPhotoIndex === index 
                    ? 'bg-sky-50 dark:bg-[#132247] border-sky-400 dark:border-sky-500/60 shadow-sm' 
                    : 'bg-slate-50 dark:bg-[#0f1a38] border-slate-200 dark:border-[#1a2b56] hover:border-slate-400'
                }`}
              >
                <div className="flex gap-2.5">
                  <img 
                    src={ev.url} 
                    alt={ev.caption} 
                    className="w-14 h-12 object-cover rounded-lg border border-slate-200 dark:border-[#203264]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-sky-600 dark:text-sky-400 uppercase">{ev.source}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{ev.confidence}% Conf</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{ev.caption}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">{ev.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-3 text-xs">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Operational Directives</div>
            <button
              onClick={() => {
                onVerifyIncident(incident.id);
                soundAlert.playDispatchChime();
              }}
              className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-[#0f1a38] border border-slate-200 dark:border-[#1a2b56] hover:border-sky-500/50 transition-colors"
            >
              <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>1. Official Incident Verification</span>
                {isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Confirm authenticity to trigger automated alert SMS to nearby subscribers.
              </p>
            </button>

            <button
              onClick={() => onOpenAssignModal(incident)}
              className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-[#0f1a38] border border-slate-200 dark:border-[#1a2b56] hover:border-sky-500/50 transition-colors"
            >
              <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>2. Dispatch NDRF / Boat Squad</span>
                <Send className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Assign nearest available rapid extraction unit or medical evacuation helicopter.
              </p>
            </button>

            <button
              onClick={() => {
                onResolveIncident(incident.id);
                soundAlert.playDispatchChime();
              }}
              className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-[#0f1a38] border border-slate-200 dark:border-[#1a2b56] hover:border-emerald-500/50 transition-colors"
            >
              <div className="font-semibold text-emerald-600 dark:text-emerald-300 flex items-center justify-between">
                <span>3. Mark as Cleared / Resolved</span>
                <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Water receded or evacuation completed. Archive incident and reopen route.
              </p>
            </button>
          </div>
        )}

        {/* Bottom Primary Action Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#18274f] flex items-center gap-3">
          <button
            onClick={() => {
              onVerifyIncident(incident.id);
              soundAlert.playDispatchChime();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
              isVerified
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50'
                : 'bg-slate-100 dark:bg-[#101b3b] text-sky-700 dark:text-sky-300 border border-slate-300 dark:border-[#1f3162] hover:bg-slate-200 dark:hover:bg-[#162550]'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isVerified ? 'Verified ✓' : 'Verify'}</span>
          </button>

          <button
            onClick={() => onOpenAssignModal(incident)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>Assign Rescue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
