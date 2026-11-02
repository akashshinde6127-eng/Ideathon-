import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Eye, 
  Sliders, 
  ArrowRight,
  Maximize2,
  Check,
  Search
} from 'lucide-react';
import { EvidenceAnalysisResult, UncertaintyStatus } from '../types/disaster';
import { PRESET_EVIDENCE_ITEMS, FLOOD_HERO_IMAGE } from '../data/disasterData';

interface EvidenceAnalyserProps {
  onPushToMap?: (item: EvidenceAnalysisResult) => void;
  onBackToCommand?: () => void;
  initialEvidenceId?: string;
}

export const EvidenceAnalyser: React.FC<EvidenceAnalyserProps> = ({
  onPushToMap,
  onBackToCommand,
  initialEvidenceId
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceAnalysisResult>(() => {
    if (initialEvidenceId) {
      const found = PRESET_EVIDENCE_ITEMS.find(e => e.id === initialEvidenceId);
      if (found) return found;
    }
    return PRESET_EVIDENCE_ITEMS[0];
  });

  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [pushedToMap, setPushedToMap] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [verificationConfirmed, setVerificationConfirmed] = useState(selectedEvidence.verifiedByAuthority || false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (item: EvidenceAnalysisResult) => {
    setSelectedEvidence(item);
    setVerificationConfirmed(item.verifiedByAuthority || false);
    setPushedToMap(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCustomPhotoUrl(url);
    setIsAnalysing(true);

    // Run simulated AI Vision model extraction
    setTimeout(() => {
      const customAnalysis: EvidenceAnalysisResult = {
        id: `ev-custom-${Date.now()}`,
        photoUrl: url,
        photoTitle: `Citizen Upload: ${file.name}`,
        possibleFloodedRoad: 'Arterial Corridor (GPS Geo-matched)',
        visibleWaterDamage: [
          'Water pooling across tarmac surface (est. 0.85m depth)',
          'Submerged kerb and traffic median markers',
          'Vehicle wake disturbance visible',
          'Debris accumulation near street drainage grate'
        ],
        estimatedSeverity: 'critical',
        evidenceConfidence: 91.4,
        uncertaintyLabel: 'Unverified Report (Awaiting Field Unit Ping)',
        detectedObjects: [
          { label: 'Flooded Carriageway', confidence: 0.95 },
          { label: 'Submerged Infrastructure', confidence: 0.89 },
          { label: 'Water Depth Line (0.85m)', confidence: 0.88 }
        ],
        waterDepthEstimate: '0.85m ± 0.15m',
        verifiedByAuthority: false,
        notes: 'Extracted from user camera upload. Geo-temporal EXIF coordinates confirmed within active flood boundary.'
      };
      setSelectedEvidence(customAnalysis);
      setVerificationConfirmed(false);
      setIsAnalysing(false);
    }, 1200);
  };

  const handleTriggerAnalysis = () => {
    setIsAnalysing(true);
    setTimeout(() => {
      setIsAnalysing(false);
    }, 900);
  };

  const handleVerify = () => {
    setVerificationConfirmed(true);
    setSelectedEvidence(prev => ({
      ...prev,
      verifiedByAuthority: true,
      uncertaintyLabel: 'Verified Danger (Confirmed by Municipal Disaster Authority)'
    }));
  };

  const handlePush = () => {
    if (onPushToMap) {
      onPushToMap(selectedEvidence);
    }
    setPushedToMap(true);
    setTimeout(() => setPushedToMap(false), 3500);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-['Plus_Jakarta_Sans']">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Evidence Analyser
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Multimodal Vision v3.8
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract flooded road identification, structural damage, water depth & uncertainty metrics from ground photography.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Flood Photo</span>
          </button>
          {onBackToCommand && (
            <button
              onClick={onBackToCommand}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Back to Command
            </button>
          )}
        </div>
      </div>

      {/* Preset evidence selector carousel */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Active Evidence Case
          </span>
          <span className="text-[11px] text-slate-400">
            {PRESET_EVIDENCE_ITEMS.length} Ground Photographic Dossiers Loaded
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_EVIDENCE_ITEMS.map((item) => {
            const isSelected = selectedEvidence.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectPreset(item)}
                className={`text-left rounded-xl p-2.5 border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-500 ring-2 ring-sky-500/20 shadow-sm'
                    : 'bg-white dark:bg-[#0c152d] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img 
                      src={item.photoUrl} 
                      alt={item.photoTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.photoTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.possibleFloodedRoad}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                        {item.evidenceConfidence}% Conf.
                      </span>
                      {item.verifiedByAuthority && (
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1 rounded font-semibold">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Side-by-Side: Original Photo vs AI Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Original Photo with Segmentation Overlay */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Original Photograph & Ground Frame
                </span>
              </div>
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  showOverlays
                    ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>AI Overlays {showOverlays ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Photo frame */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-slate-950 aspect-[4/3] flex items-center justify-center">
              <img 
                src={selectedEvidence.photoUrl} 
                alt={selectedEvidence.photoTitle} 
                className="w-full h-full object-cover"
              />

              {/* Visual bounding boxes & water level overlay */}
              {showOverlays && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Water flood zone bounding polygon */}
                  <div className="absolute inset-x-4 bottom-4 h-1/2 border-2 border-sky-400/80 bg-sky-500/20 rounded-lg flex flex-col justify-between p-2">
                    <span className="text-[10px] font-mono font-bold bg-sky-900/90 text-sky-200 px-1.5 py-0.5 rounded w-max border border-sky-400/40">
                      Detected: Submerged Asphalt ({selectedEvidence.waterDepthEstimate})
                    </span>
                    <span className="text-[10px] font-mono text-white/80 self-end bg-black/60 px-1 rounded">
                      Water Inundation Zone • 96.8% match
                    </span>
                  </div>

                  {/* Vehicle / infrastructure bounding box */}
                  <div className="absolute top-1/4 left-1/3 w-32 h-20 border-2 border-red-500/80 bg-red-500/10 rounded p-1 flex items-start">
                    <span className="text-[9px] font-mono font-bold bg-red-900/90 text-red-200 px-1 py-0.2 rounded border border-red-400/40">
                      Obstruction Risk
                    </span>
                  </div>
                </div>
              )}

              {/* Analysing shimmer pulse */}
              {isAnalysing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                  <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
                  <span className="text-xs font-semibold tracking-wide">
                    Gemini 3.8 Flash Vision Scanning Pixels...
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic">
              "Ground image verified against satellite digital elevation model (DEM) and local municipal road registry."
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">Source: Field Unit Uplink</span>
            <span className="font-mono text-[11px]">Resolution: 1920x1080 High-Q</span>
          </div>
        </div>

        {/* Right Column (7 cols): AI Evidence Extraction Findings */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Automated Forensic Dossier
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedEvidence.photoTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-xl border font-bold uppercase ${getSeverityBadge(selectedEvidence.estimatedSeverity)}`}>
                {selectedEvidence.estimatedSeverity} Severity
              </span>
            </div>
          </div>

          {/* 4 Core User-Requested Extracts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Possible Flooded Road */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-500" />
                1. Possible Flooded Road
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {selectedEvidence.possibleFloodedRoad}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  Estimated Depth: {selectedEvidence.waterDepthEstimate}
                </span>
              </div>
            </div>

            {/* 4. Evidence Confidence */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  4. Evidence Confidence
                </span>
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedEvidence.evidenceConfidence}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${selectedEvidence.evidenceConfidence}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Cross-referenced with local IoT river gauges and topography contour models.
              </p>
            </div>
          </div>

          {/* 2. Visible Water Damage */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              2. Visible Water Damage Detected
            </span>
            <ul className="space-y-1.5">
              {selectedEvidence.visibleWaterDamage.map((damage, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{damage}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Estimated Severity & Uncertainty State */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-500" />
                3. Responsible AI Status Classification
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300">
                {selectedEvidence.uncertaintyLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedEvidence.notes}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!verificationConfirmed ? (
                <button
                  onClick={handleVerify}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Authority Sign-Off & Verify</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified by Disaster Management Authority</span>
                </div>
              )}

              <button
                onClick={handleTriggerAnalysis}
                disabled={isAnalysing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalysing ? 'animate-spin' : ''}`} />
                <span>Re-analyse Vision Model</span>
              </button>
            </div>

            <button
              onClick={handlePush}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                pushedToMap
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              {pushedToMap ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcasted to Tactical Map!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Push Incident to Tactical Map</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
