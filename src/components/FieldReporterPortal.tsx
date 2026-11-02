import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  User,
  RefreshCw,
  Signal,
  Wifi,
  Battery
} from 'lucide-react';
import { FLOOD_HERO_IMAGE } from '../data/disasterData';
import { IncidentCategory, Severity } from '../types/disaster';
import { soundAlert } from '../utils/audioAlert';

interface FieldReporterPortalProps {
  onBackToCommand: () => void;
  onSubmitIncident: (newIncident: {
    title: string;
    category: IncidentCategory;
    severity: Severity;
    location: string;
    coordinates: { lat: number; lng: number };
    description: string;
    imageUrl: string;
    waterDepth: string;
  }) => void;
}

export const FieldReporterPortal: React.FC<FieldReporterPortalProps> = ({
  onBackToCommand,
  onSubmitIncident,
}) => {
  const [category, setCategory] = useState<IncidentCategory>('flood');
  const [severity, setSeverity] = useState<Severity>('critical');
  const [description, setDescription] = useState('Water on main road, vehicles stranded. Water depth rising from stormwater backflow.');
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locationName, setLocationName] = useState('Channapatna Expressway Link, KA');
  const [waterDepth, setWaterDepth] = useState('1.2m');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRefreshGps = () => {
    // Slight jitter to simulate real live GPS fix
    const newLat = Number((coords.lat + (Math.random() - 0.5) * 0.005).toFixed(4));
    const newLng = Number((coords.lng + (Math.random() - 0.5) * 0.005).toFixed(4));
    setCoords({ lat: newLat, lng: newLng });
    soundAlert.playDispatchChime();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const title = category === 'flood' 
      ? 'Severe Road Inundation' 
      : category === 'roadblock' 
      ? 'Major Route Blockage' 
      : 'Structural Damage & Cutoff';

    onSubmitIncident({
      title,
      category,
      severity,
      location: locationName,
      coordinates: coords,
      description,
      imageUrl: FLOOD_HERO_IMAGE,
      waterDepth,
    });

    soundAlert.playDispatchChime();
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 bg-slate-100 dark:bg-[#070c1a] transition-colors">
      {/* Top back bar */}
      <div className="w-full max-w-sm mb-3 flex items-center justify-between">
        <button
          onClick={onBackToCommand}
          className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Centre</span>
        </button>
        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-[#241a0d] px-2 py-0.5 rounded border border-amber-300 dark:border-amber-600/30 font-semibold shadow-sm">
          Field Officer Mode
        </span>
      </div>

      {/* Phone Mockup matching Screenshot 2 */}
      <div className="w-full max-w-[370px] bg-gradient-to-b from-[#0e1a38] via-[#091124] to-[#060a16] border-4 border-[#1e3264] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col min-h-[640px]">
        {/* Mobile Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs text-slate-300 font-semibold select-none">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Portal Header */}
        <div className="px-5 py-3 border-b border-[#18274f] flex items-center justify-between bg-[#0a1125]">
          <button onClick={onBackToCommand} className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Field Reporter Portal
          </h2>
          <div className="w-7 h-7 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Reporter Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-5 py-4 space-y-3.5 overflow-y-auto">
          {/* Photo capture banner */}
          <div className="relative rounded-2xl overflow-hidden border border-[#203264] shadow-lg group">
            <img
              src={FLOOD_HERO_IMAGE}
              alt="Hazard Scene Capture"
              className="w-full h-40 object-cover"
              referrerPolicy="no-referrer"
            />
            {/* GPS coordinates floating badge from Screenshot 2 */}
            <div className="absolute top-2 left-2 bg-[#081024]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#1b2b54] flex items-center gap-1.5 text-[10px] font-mono text-white">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{coords.lat}° N, {coords.lng}° E</span>
              <button
                type="button"
                onClick={handleRefreshGps}
                className="text-slate-400 hover:text-sky-300 ml-1"
                title="Recalibrate GPS"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="absolute bottom-2 right-2 bg-sky-600/90 hover:bg-sky-500 text-white px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer">
              <Camera className="w-3 h-3" />
              <span>Retake Photo</span>
            </div>
          </div>

          {/* Location Name */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Sector / Road Location
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-[#0d162f] border border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Incident Category Dropdown matching Screenshot 2 */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Incident Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full bg-[#0d162f] border border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="flood">Flood - High Water Inundation</option>
              <option value="roadblock">Road Blocked - Stranded Vehicles</option>
              <option value="bridge">Bridge / Culvert Structural Damage</option>
              <option value="medical">Medical Emergency in Sector</option>
              <option value="landslide">Landslide / Mud Debris</option>
            </select>
          </div>

          {/* Severity & Water Depth */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Risk Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-[#0d162f] border border-[#1b2b56] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="critical">Critical (Life Risk)</option>
                <option value="warning">Warning (Moderate)</option>
                <option value="reported">Reported (Informational)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Estimated Depth
              </label>
              <input
                type="text"
                value={waterDepth}
                onChange={(e) => setWaterDepth(e.target.value)}
                placeholder="e.g. 1.2m"
                className="w-full bg-[#0d162f] border border-[#1b2b56] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Description Textarea matching Screenshot 2 */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0d162f] border border-[#1b2b56] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Submission status feedback */}
          {submitted && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Report uploaded & broadcasted to Command Centre with 94% confidence!</span>
            </div>
          )}

          {/* Submit Button matching Screenshot 2 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>{isSubmitting ? 'Uploading to HQ...' : 'Submit Report'}</span>
          </button>
        </form>

        {/* Mobile Bottom Home Bar */}
        <div className="py-2 flex justify-center">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
