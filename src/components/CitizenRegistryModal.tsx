import React, { useState } from 'react';
import { X, Users, Search, Phone, MapPin, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { CitizenSafetyStats } from '../types/disaster';

interface CitizenRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CitizenSafetyStats;
  disasterRegion: string;
}

interface CitizenRecord {
  id: string;
  name: string;
  phone: string;
  location: string;
  status: 'safe' | 'need_help' | 'sos';
  lastPing: string;
  familyMembers: number;
}

export const CitizenRegistryModal: React.FC<CitizenRegistryModalProps> = ({
  isOpen,
  onClose,
  stats,
  disasterRegion,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'need_help' | 'sos'>('all');

  // Realistic roster of citizens
  const [records, setRecords] = useState<CitizenRecord[]>([
    { id: 'c-1', name: 'Rameshwar Verma', phone: '+91 98391 22810', location: 'Assi Ghat, Ward 12', status: 'sos', lastPing: '3 mins ago', familyMembers: 4 },
    { id: 'c-2', name: 'Sunita Devi', phone: '+91 94152 78190', location: 'Shivpur Sector B', status: 'sos', lastPing: '8 mins ago', familyMembers: 3 },
    { id: 'c-3', name: 'Anil Kumar Yadav', phone: '+91 98890 14421', location: 'Sigra Crossing', status: 'need_help', lastPing: '14 mins ago', familyMembers: 2 },
    { id: 'c-4', name: 'Pooja Tripathi', phone: '+91 97931 55601', location: 'BHU South Gate', status: 'safe', lastPing: '18 mins ago', familyMembers: 5 },
    { id: 'c-5', name: 'Mahesh Pandey', phone: '+91 94500 88291', location: 'Dashashwamedh', status: 'safe', lastPing: '22 mins ago', familyMembers: 1 },
    { id: 'c-6', name: 'Geeta Shinde', phone: '+91 98451 90211', location: 'Channapatna Town', status: 'need_help', lastPing: '25 mins ago', familyMembers: 6 },
    { id: 'c-7', name: 'Vikram Gowda', phone: '+91 99002 43100', location: 'Ramanagara Ward 4', status: 'safe', lastPing: '30 mins ago', familyMembers: 4 },
    { id: 'c-8', name: 'Dr. Sanjay Nandan', phone: '+91 98380 61720', location: 'Mughalsarai Cantt', status: 'safe', lastPing: '35 mins ago', familyMembers: 2 },
  ]);

  if (!isOpen) return null;

  const toggleStatus = (id: string, newStatus: CitizenRecord['status']) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filtered = records.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#203264] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#18274f] flex items-center justify-between bg-slate-50 dark:bg-[#0a1125]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Citizen Welfare & Safety Registry</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Alerted: {stats.peopleAlerted.toLocaleString()} • {disasterRegion}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-[#18274f] flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#0d162f]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by citizen name, phone, ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#101c3d] border border-slate-200 dark:border-[#1d2d5a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('sos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filter === 'sos' ? 'bg-red-600 text-white' : 'text-red-600 dark:text-red-400 hover:bg-red-500/10'}`}
            >
              SOS ({records.filter(r => r.status === 'sos').length})
            </button>
            <button
              onClick={() => setFilter('need_help')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filter === 'need_help' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'}`}
            >
              Need Help
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${filter === 'safe' ? 'bg-emerald-600 text-white' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'}`}
            >
              Safe
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-[#17254c]">
          {filtered.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">({c.familyMembers} in household)</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    {c.phone}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {c.location}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Pinged: {c.lastPing}</span>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {c.status === 'sos' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/40 px-2 py-0.5 rounded-full">
                    <Radio className="w-3 h-3 text-red-500 dark:text-red-400 animate-pulse" />
                    SOS ACTIVE
                  </span>
                )}
                {c.status === 'need_help' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    NEED HELP
                  </span>
                )}
                {c.status === 'safe' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    SAFE
                  </span>
                )}

                {/* Quick Toggle for Emergency Operator */}
                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-[#1a2c58] pl-2">
                  <button
                    onClick={() => toggleStatus(c.id, 'safe')}
                    className="p-1 rounded bg-slate-100 dark:bg-[#101b38] hover:bg-emerald-600 text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
                    title="Mark Confirmed Safe"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </button>
                  <button
                    onClick={() => toggleStatus(c.id, 'sos')}
                    className="p-1 rounded bg-slate-100 dark:bg-[#101b38] hover:bg-red-600 text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
                    title="Trigger SOS Priority"
                  >
                    <Radio className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#18274f] bg-slate-50 dark:bg-[#0a1125] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Displaying {filtered.length} registered citizens</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold shadow hover:bg-sky-500 transition-colors">
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
