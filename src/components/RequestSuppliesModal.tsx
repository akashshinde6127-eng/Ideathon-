import React, { useState } from 'react';
import { X, Package, CheckCircle2, Truck } from 'lucide-react';
import { soundAlert } from '../utils/audioAlert';

interface RequestSuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  disasterRegion: string;
  onConfirmRequest: (category: string, quantity: string, destination: string) => void;
}

export const RequestSuppliesModal: React.FC<RequestSuppliesModalProps> = ({
  isOpen,
  onClose,
  disasterRegion,
  onConfirmRequest,
}) => {
  const [supplyType, setSupplyType] = useState('Medical Trauma & Anti-Venom Kits');
  const [quantity, setQuantity] = useState('250 units');
  const [targetHub, setTargetHub] = useState(`${disasterRegion} Central Relief Staging Base`);
  const [urgency, setUrgency] = useState<'Immediate Flight Airlift' | 'Standard Relief Convoy'>('Immediate Flight Airlift');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRequest(supplyType, quantity, targetHub);
    soundAlert.playDispatchChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0c152d] border border-slate-200 dark:border-[#203264] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#18274f] flex items-center justify-between bg-slate-50 dark:bg-[#0a1125]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Supply Requisition</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
              Material / Relief Consumable
            </label>
            <select
              value={supplyType}
              onChange={(e) => setSupplyType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Medical Trauma & Anti-Venom Kits">Medical Trauma & Anti-Venom Kits (Urgent Low)</option>
              <option value="Potable Drinking Water Pouches (5L)">Potable Drinking Water Pouches (5L)</option>
              <option value="High-Calorie Ready-to-Eat Rations">High-Calorie Ready-to-Eat Rations</option>
              <option value="Waterproof Modular Family Tents">Waterproof Modular Family Tents</option>
              <option value="High-Volume Diesel Water Extraction Pumps">High-Volume Diesel Water Extraction Pumps</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
                Quantity Required
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
                Delivery Priority
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as unknown as 'Immediate Flight Airlift')}
                className="w-full bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Immediate Flight Airlift">Air Force Drop (1 hr)</option>
                <option value="Standard Relief Convoy">Truck Convoy (3-4 hrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 dark:text-white block mb-1.5">
              Destination Relief Camp / Hub
            </label>
            <input
              type="text"
              value={targetHub}
              onChange={(e) => setTargetHub(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1b2b56] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#111c3a] border border-slate-200 dark:border-[#1a2b54] rounded-xl text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-sky-600 dark:text-sky-400 block mb-0.5">Automated State Depot Routing:</span>
            Requisition request will automatically issue digital cargo dispatch orders to National Disaster Resource Reserve (NDRR).
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Submit Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
