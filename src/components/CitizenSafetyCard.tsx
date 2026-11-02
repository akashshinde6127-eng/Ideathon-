import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { CitizenSafetyStats } from '../types/disaster';

interface CitizenSafetyCardProps {
  stats: CitizenSafetyStats;
  onViewDetails: () => void;
}

export const CitizenSafetyCard: React.FC<CitizenSafetyCardProps> = ({
  stats,
  onViewDetails,
}) => {
  const total = stats.safeCount + stats.needHelpCount + stats.sosActiveCount;
  const safePercent = total > 0 ? Math.round((stats.safeCount / total) * 100) : 82;
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#18274f]">
        <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
          Citizen Safety Status
        </h3>
      </div>

      {/* Chart & Legend Row */}
      <div className="flex items-center justify-between py-3 gap-3">
        {/* Donut Chart */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-slate-200 dark:text-[#132044]"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Safe segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-emerald-500"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono leading-none">
              {safePercent}%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Safe
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">Safe</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] tabular-nums">
              {stats.safeCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">Need Help</span>
            </div>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-300 text-[11px] tabular-nums">
              {stats.needHelpCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">SOS Active</span>
            </div>
            <span className="font-mono font-bold text-red-600 dark:text-red-400 text-[11px] tabular-nums">
              {stats.sosActiveCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <button
        onClick={onViewDetails}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#101b3a] dark:hover:bg-[#162550] border border-slate-200 dark:border-[#1d2d5a] text-xs font-semibold text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white transition-colors"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
