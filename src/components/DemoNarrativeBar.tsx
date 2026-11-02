import React from 'react';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Navigation,
  Bot
} from 'lucide-react';

export interface DemoStep {
  stepNumber: number;
  title: string;
  shortDesc: string;
  badge: string;
  actionLabel: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: "Citizen 1 Reports Flooding",
    shortDesc: "Citizen reports village road flooded at Sigra & uploads photo.",
    badge: "Crowdsource Input",
    actionLabel: "View Citizen Report"
  },
  {
    stepNumber: 2,
    title: "Citizen 2 Reports Same Blockage",
    shortDesc: "Another citizen reports nearby blockage from 180m away.",
    badge: "Spatial Cluster",
    actionLabel: "Simulate Second Report"
  },
  {
    stepNumber: 3,
    title: "AI Detects Duplicate Incident",
    shortDesc: "AI recognizes spatial/semantic match & groups reports together.",
    badge: "Spatial Fusion",
    actionLabel: "Review AI Grouping"
  },
  {
    stepNumber: 4,
    title: "Dashboard Marks Unverified State",
    shortDesc: "Map marks location as Unverified Road Blockage (Amber).",
    badge: "Responsible AI",
    actionLabel: "Show Map Uncertainty"
  },
  {
    stepNumber: 5,
    title: "Field Reporter Submits Photo",
    shortDesc: "Authorized ground unit uploads high-res depth photograph.",
    badge: "Field Telemetry",
    actionLabel: "Inspect Field Photo"
  },
  {
    stepNumber: 6,
    title: "Authority Verifies Danger",
    shortDesc: "Disaster management authority physically verifies 1.2m depth.",
    badge: "Authority Sign-off",
    actionLabel: "Sign-Off Verification"
  },
  {
    stepNumber: 7,
    title: "Map Updates & Safe Routes",
    shortDesc: "Map turns to Verified Danger; AI recommends Route A over Route C.",
    badge: "Route Intelligence",
    actionLabel: "Compare Routes A, B & C"
  },
  {
    stepNumber: 8,
    title: "AI Situation Room Synthesis",
    shortDesc: "Situation Room explains verified ground facts & remaining action items.",
    badge: "Executive Intel",
    actionLabel: "Open Situation Room"
  }
];

interface DemoNarrativeBarProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onResetDemo: () => void;
}

export const DemoNarrativeBar: React.FC<DemoNarrativeBarProps> = ({
  currentStep,
  onSetStep,
  onNextStep,
  onPrevStep,
  onResetDemo
}) => {
  const currentStepData = DEMO_STEPS[currentStep - 1] || DEMO_STEPS[0];

  return (
    <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white border-b border-sky-500/30 px-3 py-2.5 shadow-md font-['Plus_Jakarta_Sans'] select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Title & Stepper Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-sky-500/20 border border-sky-400/30 px-2 py-0.5 rounded-lg text-sky-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>LIVE 8-STEP DEMONSTRATION</span>
          </div>

          <div className="flex items-center gap-1">
            {DEMO_STEPS.map((s) => {
              const isActive = s.stepNumber === currentStep;
              const isPast = s.stepNumber < currentStep;
              return (
                <button
                  key={s.stepNumber}
                  onClick={() => onSetStep(s.stepNumber)}
                  title={`Step ${s.stepNumber}: ${s.title}`}
                  className={`w-6 h-6 rounded-md text-[11px] font-mono font-bold flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-sky-400 text-slate-950 ring-2 ring-sky-300 scale-105 shadow-md shadow-sky-400/40'
                      : isPast
                      ? 'bg-sky-800/80 text-sky-200 hover:bg-sky-700'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {s.stepNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Active Narrative Text */}
        <div className="flex-1 min-w-0 text-center md:text-left px-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-bold text-sky-300">
              Step {currentStepData.stepNumber}: {currentStepData.title}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
              {currentStepData.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">
            {currentStepData.shortDesc}
          </p>
        </div>

        {/* Right: Controller Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onPrevStep}
            disabled={currentStep === 1}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onNextStep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm transition-all"
          >
            <span>{currentStep === 8 ? 'Replay Demo' : `Step ${currentStep + 1} ➔`}</span>
          </button>

          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            title="Reset Narrative to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
