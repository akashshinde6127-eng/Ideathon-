import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  GitMerge, 
  Trash2, 
  MapPin, 
  Clock, 
  Phone, 
  Users,
  ShieldAlert,
  Send
} from 'lucide-react';
import { Incident } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

export interface IncomingSosAlert {
  id: string;
  code: string;
  reporterName: string;
  phone: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  details: string;
  peopleCount: number;
  waterDepth: string;
}

interface SosVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingSos: IncomingSosAlert | null;
  existingIncidents: Incident[];
  onMerge: (existingIncidentId: string, mergedSos: IncomingSosAlert) => void;
  onConfirmUnique: (sos: IncomingSosAlert) => void;
  onDismiss: (sosId: string) => void;
}

// Distance helper in meters between two lat/lng points
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const SosVerificationModal: React.FC<SosVerificationModalProps> = ({
  isOpen,
  onClose,
  incomingSos,
  existingIncidents,
  onMerge,
  onConfirmUnique,
  onDismiss,
}) => {
  if (!isOpen || !incomingSos) return null;

  // Find nearest existing incidents to detect duplicates
  const matches = existingIncidents
    .map((inc) => {
      const distance = calculateDistanceMeters(
        incomingSos.coordinates.lat,
        incomingSos.coordinates.lng,
        inc.coordinates.lat,
        inc.coordinates.lng
      );
      // Proximity score: closer than 600m = high probability duplicate
      const score = Math.max(0, Math.min(99, Math.round(100 - (distance / 600) * 80)));
      return {
        incident: inc,
        distanceMeters: distance,
        similarityScore: distance <= 600 ? score : Math.max(20, Math.round(60 - (distance / 2000) * 50)),
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearestMatch = matches[0];
  const isLikelyDuplicate = nearestMatch && nearestMatch.distanceMeters <= 650;
  const [selectedMergeId, setSelectedMergeId] = useState<string>(nearestMatch?.incident.id || '');

  const handleMerge = () => {
    onMerge(selectedMergeId, incomingSos);
    soundAlert.playDispatchChime();
    onClose();
  };

  const handleConfirmUnique = () => {
    onConfirmUnique(incomingSos);
    soundAlert.playDispatchChime();
    onClose();
  };

  const handleDismiss = () => {
    onDismiss(incomingSos.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#203264] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLikelyDuplicate 
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50' 
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLikelyDuplicate 
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                : 'bg-red-500/20 text-red-600 dark:text-red-400'
            }`}>
              {isLikelyDuplicate ? <GitMerge className="w-4 h-4" /> : <Radio className="w-4 h-4 animate-ping" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isLikelyDuplicate ? 'Potential Duplicate SOS Signal Detected' : 'New Incoming Citizen SOS Verification'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLikelyDuplicate 
                  ? `Spatial AI detected an existing incident within ${nearestMatch.distanceMeters}m.` 
                  : 'Verify distress authenticity and prevent redundant team dispatches.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Comparison Grid */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Incoming SOS Card */}
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50/50 dark:bg-red-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-700 dark:text-red-400 font-mono text-[11px] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                INCOMING SIGNAL • {incomingSos.code}
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">
                {incomingSos.timestamp}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {incomingSos.reporterName}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-2 font-mono text-[11px]">
                  {incomingSos.phone}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121f42] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1b2b54]">
                {incomingSos.peopleCount} People At Risk
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{incomingSos.location}</span>
              <span className="text-slate-400 font-mono text-[10px]">
                ({incomingSos.coordinates.lat.toFixed(4)}, {incomingSos.coordinates.lng.toFixed(4)})
              </span>
            </div>

            <p className="p-2.5 rounded-lg bg-white dark:bg-[#0a1124] text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-[#1a2b54] leading-relaxed">
              "{incomingSos.details}"
            </p>
          </div>

          {/* Proximity Matching / Duplicate Comparison Section */}
          {nearestMatch && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Existing Incident Match in Sector:
                </span>
                <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                  isLikelyDuplicate 
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {nearestMatch.distanceMeters}m Away • {nearestMatch.similarityScore}% Proximity Match
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1c2c58] bg-slate-50 dark:bg-[#0f1b38] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-500/30">
                      {nearestMatch.incident.code}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {nearestMatch.incident.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Status: {nearestMatch.incident.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>{nearestMatch.incident.location}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  {nearestMatch.incident.description}
                </p>

                {nearestMatch.incident.assignedTeam && (
                  <div className="text-[10px] text-sky-600 dark:text-sky-300 font-mono bg-sky-50 dark:bg-sky-500/10 p-1.5 rounded border border-sky-200 dark:border-sky-500/20">
                    Rescue Unit Already Assigned: {nearestMatch.incident.assignedTeam}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Operational Advice Banner */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-200 text-[11px] leading-relaxed">
            {isLikelyDuplicate ? (
              <span>
                💡 <strong>Dispatcher Recommendation:</strong> Merge this distress ping with existing incident <strong>{nearestMatch.incident.code}</strong>. Merging updates the total victim count, appends this citizen's phone to the rescue team's manifest, and avoids dispatching redundant boats to the same street.
              </span>
            ) : (
              <span>
                ✅ <strong>Dispatcher Recommendation:</strong> No nearby incidents within 600m. This appears to be a distinct SOS beacon. Verify and dispatch rescue crew.
              </span>
            )}
          </div>
        </div>

        {/* Footer Decision Buttons */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#18274f] bg-slate-50 dark:bg-[#0a1125] flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dismiss (False/Spam)</span>
          </button>

          <div className="flex items-center gap-2">
            {isLikelyDuplicate && (
              <button
                onClick={handleMerge}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-amber-600/20 transition-all"
              >
                <GitMerge className="w-4 h-4" />
                <span>Merge with {nearestMatch.incident.code}</span>
              </button>
            )}

            <button
              onClick={handleConfirmUnique}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-md shadow-sky-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Unique & Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
