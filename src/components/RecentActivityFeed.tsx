import React from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Radio, 
  Camera, 
  Truck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ActivityItem } from '../types/disaster';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  onViewAll: () => void;
  onSelectActivity?: (item: ActivityItem) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  onViewAll,
  onSelectActivity,
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'safe':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'sos':
        return <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />;
      case 'report':
        return <Camera className="w-3.5 h-3.5 text-sky-400" />;
      case 'dispatch':
        return <Truck className="w-3.5 h-3.5 text-purple-400" />;
      case 'resolved':
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getIconContainerStyle = (type: ActivityItem['type']) => {
    switch (type) {
      case 'safe':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'sos':
        return 'bg-red-500/10 border-red-500/30';
      case 'report':
        return 'bg-sky-500/10 border-sky-500/30';
      case 'dispatch':
        return 'bg-purple-500/10 border-purple-500/30';
      default:
        return 'bg-amber-500/10 border-amber-500/30';
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#18274f]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
            Recent Activity
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Feed list */}
      <div className="py-2 space-y-2.5 overflow-hidden">
        {activities.slice(0, 4).map((act) => (
          <div
            key={act.id}
            onClick={() => onSelectActivity && onSelectActivity(act)}
            className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121f42] cursor-pointer transition-colors"
          >
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-0.5 shrink-0 tabular-nums">
              {act.timestamp}
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${getIconContainerStyle(act.type)}`}>
              {getActivityIcon(act.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                {act.text}
              </div>
              {act.subtext && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {act.subtext}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-200 dark:border-[#18274f] flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live Telemetry Stream
        </span>
        <span>Auto-sync 3s</span>
      </div>
    </div>
  );
};
