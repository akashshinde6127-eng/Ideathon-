import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Phone, 
  Radio, 
  Check, 
  MapPin, 
  ArrowLeft,
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  Navigation
} from 'lucide-react';
import { FLOOD_HERO_IMAGE } from '../data/disasterData';
import { soundAlert } from '../utils/audioAlert';

interface CitizenMobileViewProps {
  regionName: string;
  onMarkSafe: (citizenName: string, location: string) => void;
  onSendHelp: (name: string, location: string, phone: string, details: string) => void;
  onBackToCommand: () => void;
}

export const CitizenMobileView: React.FC<CitizenMobileViewProps> = ({
  regionName,
  onMarkSafe,
  onSendHelp,
  onBackToCommand,
}) => {
  const [safeStatusLogged, setSafeStatusLogged] = useState(false);
  const [showSosForm, setShowSosForm] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [callingHelpline, setCallingHelpline] = useState(false);

  // Form states
  const [citizenName, setCitizenName] = useState('Ananya Sen');
  const [phone, setPhone] = useState('+91 98450 11928');
  const [landmark, setLandmark] = useState('Near Kali Temple, Ward 8');
  const [medicalAssistance, setMedicalAssistance] = useState(false);

  const handleSafeClick = () => {
    onMarkSafe(citizenName, landmark || regionName);
    setSafeStatusLogged(true);
    soundAlert.playDispatchChime();
    setTimeout(() => setSafeStatusLogged(false), 4000);
  };

  const handleSosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendHelp(
      citizenName,
      landmark || regionName,
      phone,
      medicalAssistance ? 'Medical emergency + water entering house' : 'Stranded on first floor, water rising'
    );
    setSosSent(true);
    soundAlert.playEmergencyBeep();
    setTimeout(() => {
      setSosSent(false);
      setShowSosForm(false);
    }, 3500);
  };

  const handleCallHelpline = () => {
    setCallingHelpline(true);
    soundAlert.playEmergencyBeep();
    setTimeout(() => setCallingHelpline(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 bg-slate-100 dark:bg-[#070c1a] transition-colors">
      {/* Back to Command Bar */}
      <div className="w-full max-w-sm mb-3 flex items-center justify-between">
        <button
          onClick={onBackToCommand}
          className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Centre</span>
        </button>
        <span className="text-[10px] font-mono text-slate-700 dark:text-slate-400 bg-white dark:bg-[#121c3b] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1d2d5a] shadow-sm">
          Citizen Mobile View
        </span>
      </div>

      {/* Mobile Device Mockup matching Screenshot 2 */}
      <div className="w-full max-w-[370px] bg-gradient-to-b from-[#0e1a38] via-[#091124] to-[#060a16] border-4 border-[#1e3264] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col min-h-[640px]">
        {/* Mobile Status Bar (9:41, wifi, battery) */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs text-slate-300 font-semibold select-none">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Brand App Header */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 p-1 flex items-center justify-center shadow">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L19 8.5v7l-7 3.9-7-3.9v-7L12 4.2zM7 11.5c1.2-1.2 2.8-1.2 4 0 1.2 1.2 2.8 1.2 4 0v1.8c-1.2 1.2-2.8 1.2-4 0-1.2-1.2-2.8-1.2-4 0v-1.8zm0 3.5c1.2-1.2 2.8-1.2 4 0 1.2 1.2 2.8 1.2 4 0v1.8c-1.2 1.2-2.8 1.2-4 0-1.2-1.2-2.8-1.2-4 0V15z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-none">ResQGrid</h2>
              <p className="text-[10px] text-sky-400 font-medium">Stay Safe. Get Help.</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Mobile Body Content */}
        <div className="flex-1 px-5 py-3 space-y-4 overflow-y-auto">
          {/* Emergency Alert Banner matching Screenshot 2 */}
          <div className="relative bg-gradient-to-r from-red-500/20 via-red-600/15 to-orange-500/10 border border-red-500/40 rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    Flood Alert – {regionName.split(' ')[0]}
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-red-400 uppercase bg-red-500/20 px-1.5 py-0.5 rounded">
                    Red Alert
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Heavy rainfall & rising river level expected in your area. Follow emergency directives.
                </p>
              </div>
            </div>
          </div>

          {/* SOS Modal or Form */}
          {showSosForm ? (
            <form onSubmit={handleSosSubmit} className="bg-[#101b3b] border border-red-500/50 rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1b2b54] pb-2">
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>EMERGENCY SOS DISPATCH</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSosForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-[#0a1226] border border-[#1b2b54] rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a1226] border border-[#1b2b54] rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">GPS Location / Landmark</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#0a1226] border border-[#1b2b54] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="med"
                  checked={medicalAssistance}
                  onChange={(e) => setMedicalAssistance(e.target.checked)}
                  className="rounded text-red-500 focus:ring-0"
                />
                <label htmlFor="med" className="text-xs text-slate-300">
                  Urgent medical support required (elderly/child)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Transmit Emergency SOS Now</span>
              </button>
            </form>
          ) : (
            /* The 2 Big Hero Action Buttons from Screenshot 2 */
            <div className="space-y-3">
              {/* Green "I'M SAFE" Button */}
              <button
                onClick={handleSafeClick}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-xl shadow-emerald-600/30 transition-all active:scale-95 text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Check className="w-7 h-7 text-white stroke-[3]" />
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight">I'M SAFE</div>
                  <div className="text-xs text-emerald-100 font-medium">Let us know you are safe</div>
                </div>
              </button>

              {/* Red "SEND HELP" Button */}
              <button
                onClick={() => setShowSosForm(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/40 transition-all active:scale-95 text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="font-mono font-extrabold text-sm tracking-wider">SOS</span>
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight">SEND HELP</div>
                  <div className="text-xs text-red-100 font-medium">Share your location</div>
                </div>
              </button>
            </div>
          )}

          {/* Feedback toasts */}
          {safeStatusLogged && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Status recorded: You are marked Safe in Command HQ!</span>
            </div>
          )}

          {sosSent && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-xs text-red-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Radio className="w-4 h-4 text-red-400 animate-ping" />
              <span>SOS Transmitted! Rescue team dispatched to your GPS coordinates.</span>
            </div>
          )}

          {/* Flooded Road Alert & Safe Route Suggestions for Citizens */}
          <div className="bg-[#0f1a38] border border-[#1b2b54] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                Flooded Roads in {regionName.split(' ')[0]}
              </span>
              <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-bold">
                Live Status
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30">
                <div className="flex items-center justify-between font-bold text-red-300">
                  <span>⛔ Sigra – Vidyapeeth Link</span>
                  <span className="text-[10px] font-mono text-red-400">1.4m Deep</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Main road submerged. <strong>Suggested detour:</strong> Use NH-19 Elevated Bypass via Lahartara.
                </p>
              </div>

              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <span>✅ NH-19 Southern Bypass</span>
                  <span className="text-[10px] font-mono text-emerald-400">0.0m Dry</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Elevated corridor fully open for all light & heavy vehicles to reach BHU Relief Camp.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Helpline matching Screenshot 2 */}
          <div 
            onClick={handleCallHelpline}
            className="bg-[#0f1a38] border border-[#1b2b54] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-sky-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Emergency Helpline</span>
                <span className="text-lg font-bold font-mono text-white tracking-wider">112</span>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg">
              {callingHelpline ? 'Calling 112...' : 'Tap to Dial'}
            </div>
          </div>

          {/* Bottom Flood Photo Frame matching screenshot 2 */}
          <div className="rounded-2xl overflow-hidden border border-[#1b2b54] shadow-md relative">
            <img
              src={FLOOD_HERO_IMAGE}
              alt="Local water levels"
              className="w-full h-28 object-cover brightness-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2.5 flex flex-col justify-end">
              <span className="text-[11px] font-bold text-white">Live Ward Surveillance</span>
              <span className="text-[9px] text-slate-300 font-mono">Assi River Embankment • Drone Cam 2</span>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Home Bar */}
        <div className="py-2 flex justify-center">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
