import React, { useState } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Send, 
  Clock, 
  Droplets, 
  Filter, 
  ExternalLink 
} from 'lucide-react';
import { Incident, Severity } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

interface SosQueueViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onVerifyIncident: (id: string) => void;
  onOpenAssignModal: (inc: Incident) => void;
  title: string;
  subtitle: string;
}

export const SosQueueView: React.FC<SosQueueViewProps> = ({
  incidents,
  onSelectIncident,
  onVerifyIncident,
  onOpenAssignModal,
  title,
  subtitle,
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unverified' | 'verified' | 'dispatched'>('all');

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase()) ||
      inc.code.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || inc.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-[#18274f] pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* Total stats pill */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-100 dark:bg-[#0f1b38] border border-slate-200 dark:border-[#1b2b54] px-3 py-1.5 rounded-xl font-mono">
            <span className="text-slate-500 dark:text-slate-400">Total Entries: </span>
            <span className="text-slate-900 dark:text-white font-bold">{incidents.length}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-1.5 rounded-xl font-mono text-red-600 dark:text-red-400">
            <span>Critical Priority: </span>
            <span className="font-bold">{incidents.filter(i => i.severity === 'critical').length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d162f] p-3 rounded-2xl border border-slate-200 dark:border-[#1b2b54] shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident code, title, street or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#101c3d] border border-slate-200 dark:border-[#1d2d5a] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              severityFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              severityFilter === 'critical' ? 'bg-red-600 text-white' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              severityFilter === 'warning' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
            }`}
          >
            Warning
          </button>
        </div>
      </div>

      {/* Grid of Incidents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            onClick={() => onSelectIncident(inc)}
            className="bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#17254c] hover:border-sky-500/60 rounded-2xl p-4 shadow-sm dark:shadow-xl cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      inc.severity === 'critical'
                        ? 'bg-red-600 text-white'
                        : inc.severity === 'warning'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#121f42] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1c2c58]">
                    {inc.code}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {inc.timestamp}
                </span>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                  {inc.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{inc.location}</span>
                </div>
              </div>

              {/* Image & Description */}
              <div className="flex gap-2.5">
                <img
                  src={inc.imageUrl}
                  alt={inc.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-[#192954]"
                  referrerPolicy="no-referrer"
                />
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {inc.description}
                </p>
              </div>

              {/* Telemetry pill */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-100 dark:bg-[#091125] p-2 rounded-xl border border-slate-200 dark:border-[#16254a]">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500 dark:text-blue-400" /> Depth: {inc.waterLevelDepth || '0.9m'}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {inc.evidenceConfidence}% Conf
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-[#17254c] flex items-center justify-between gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVerifyIncident(inc.id);
                  soundAlert.playDispatchChime();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                  inc.status === 'verified' || inc.status === 'dispatched'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50'
                    : 'bg-slate-100 dark:bg-[#101b38] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#162550]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{inc.status === 'verified' || inc.status === 'dispatched' ? 'Verified' : 'Verify'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAssignModal(inc);
                }}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 flex items-center justify-center gap-1 transition-colors shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
