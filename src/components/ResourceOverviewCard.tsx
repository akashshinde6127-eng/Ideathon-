import React from 'react';
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { ResourceMetric } from '../types/disaster';

interface ResourceOverviewCardProps {
  resources: ResourceMetric[];
  onRequestSupplies: () => void;
  disasterRegion: string;
}

export const ResourceOverviewCard: React.FC<ResourceOverviewCardProps> = ({
  resources,
  onRequestSupplies,
  disasterRegion,
}) => {
  return (
    <div className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-[#18274f]">
        <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
          Resource Overview
        </h3>
      </div>

      {/* 4 Circular Percentage Gauges */}
      <div className="grid grid-cols-4 gap-2 py-3">
        {resources.map((item) => {
          const r = 18;
          const circum = 2 * Math.PI * r;
          const strokeOffset = circum - (item.percentage / 100) * circum;
          const isWarning = item.percentage < 50;

          return (
            <div key={item.name} className="flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r={r}
                    className="stroke-slate-200 dark:stroke-[#132145]"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={r}
                    stroke={isWarning ? '#f59e0b' : '#0ea5e9'}
                    strokeWidth="3.5"
                    strokeDasharray={circum}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {item.percentage}%
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Low Supply Alert Banner */}
      <div className="bg-amber-50 dark:bg-[#24171a] border border-amber-200 dark:border-amber-600/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <p className="text-[10px] font-medium text-amber-800 dark:text-amber-200/90 truncate">
            Medical supplies low in {disasterRegion.split(' ')[0]} zone
          </p>
        </div>
        <button
          onClick={onRequestSupplies}
          className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white flex items-center gap-1 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 px-2 py-1 rounded-lg transition-colors shrink-0"
        >
          <span>Request</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
