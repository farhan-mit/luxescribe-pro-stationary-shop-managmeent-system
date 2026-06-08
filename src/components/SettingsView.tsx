/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { SlidersHorizontal, Volume2, Landmark, Shield, HelpCircle } from 'lucide-react';

interface SettingsViewProps {
  taxEnabled: boolean;
  setTaxEnabled: (enabled: boolean) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  soundEffects: boolean;
  setSoundEffects: (enabled: boolean) => void;
  onResetDatabase: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SettingsView({
  taxEnabled,
  setTaxEnabled,
  taxRate,
  setTaxRate,
  soundEffects,
  setSoundEffects,
  onResetDatabase,
  showNotification
}: SettingsViewProps) {
  const [localTax, setLocalTax] = useState((taxRate * 100).toFixed(2));

  const handleApplyTax = (e: FormEvent) => {
    e.preventDefault();
    const rateFloat = parseFloat(localTax);
    if (!isNaN(rateFloat) && rateFloat >= 0) {
      setTaxRate(rateFloat / 100);
      showNotification(`Sales tax adjusted to standard ${rateFloat}% in Point of Sale.`, "success");
    } else {
      showNotification("Invalid tax rate value input.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-300 text-zinc-900 font-sans">
      <div>
        <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">System Configuration</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Control cashier behaviors, point of sale parameters, and system values.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation configuration rail */}
        <div className="md:col-span-2 space-y-6">
          {/* General POS Parameters card */}
          <div className="bg-white rounded-none p-6 border border-zinc-200 shadow-sm space-y-5">
            <h3 className="font-serif font-light text-zinc-950 text-base flex items-center gap-2 uppercase tracking-wider border-b border-zinc-100 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-zinc-650" />
              Boutique Register Parameters
            </h3>

            {/* Sound Toggle */}
            <div className="flex justify-between items-center py-3 border-b border-zinc-100">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5 font-sans">
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                  Terminal Sound Cueing
                </p>
                <p className="text-xs text-zinc-450 uppercase tracking-wider">Play responsive ding triggers when scanning products.</p>
              </div>
              <button
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-12 h-6 p-0.5 rounded-full transition-colors border cursor-pointer ${
                  soundEffects ? 'bg-zinc-900 border-zinc-950' : 'bg-zinc-100 border-zinc-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full transform transition-transform ${
                  soundEffects ? 'bg-white translate-x-6' : 'bg-zinc-400 translate-x-0'
                }`} />
              </button>
            </div>

            {/* Tax Active Toggle */}
            <div className="flex justify-between items-center py-3 border-b border-zinc-100">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5 font-sans">
                  <Landmark className="w-4 h-4 text-zinc-400" />
                  Levy Retail Taxes
                </p>
                <p className="text-xs text-zinc-450 uppercase tracking-wider">Apply standard state tax calculations onto order checkout balances.</p>
              </div>
              <button
                onClick={() => setTaxEnabled(!taxEnabled)}
                className={`w-12 h-6 p-0.5 rounded-full transition-colors border cursor-pointer ${
                  taxEnabled ? 'bg-zinc-900 border-zinc-950' : 'bg-zinc-100 border-zinc-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full transform transition-transform ${
                  taxEnabled ? 'bg-white translate-x-6' : 'bg-zinc-400 translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Tax customize form */}
          {taxEnabled && (
            <div className="bg-white rounded-none p-6 border border-zinc-200 shadow-sm animate-in zoom-in-95 duration-200 text-left">
              <form onSubmit={handleApplyTax} className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-serif font-light text-zinc-900 text-sm uppercase tracking-wider">State Tax Rate Percentage (%)</h4>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Configure standard fractional sales tax multipliers applied programmatically.</p>
                </div>

                <div className="flex gap-3 max-w-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={localTax}
                    onChange={(e) => setLocalTax(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-950 text-white px-5 py-2 rounded-none text-[10px] uppercase tracking-widest font-semibold cursor-pointer active:scale-95 transition-all text-center shadow-sm"
                  >
                    Apply Rate
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Administrative safety zone */}
          <div className="bg-rose-50/50 rounded-none p-6 border border-rose-200 space-y-4 shadow-sm text-left">
            <h3 className="font-serif font-light text-rose-750 text-sm flex items-center gap-2 uppercase tracking-widest font-semibold">
              <Shield className="w-4 h-4 text-rose-650" />
              Administrative Safety Zone
            </h3>
            <p className="text-xs text-rose-700 uppercase tracking-wider">Restore factory records cleanly to remove draft orders, custom users and revert product pricing metadata.</p>
            
            <button
              onClick={() => {
                const conf = window.confirm("Are you absolutely sure you want to revert modifications and restore the standard inventory database?");
                if (conf) {
                  onResetDatabase();
                  showNotification("Database coordinates successfully rolled back to default specifications.", "success");
                }
              }}
              className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 rounded-none text-[10px] uppercase tracking-widest font-bold tracking-widest active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Roll Back Ledger Parameters
            </button>
          </div>
        </div>

        {/* Informational Guidelines Panel card */}
        <div className="space-y-6">
          <div className="bg-zinc-100/50 border border-zinc-200 rounded-none p-6 text-left space-y-4 shadow-sm">
            <h3 className="font-serif font-light text-zinc-900 text-base flex items-center gap-2 uppercase tracking-widest mb-2 border-b border-zinc-200 pb-2">
              <HelpCircle className="w-4 h-4 text-zinc-650" />
              Storehouse Guidelines
            </h3>
            <div className="space-y-3.5 text-xs text-zinc-500 leading-relaxed font-sans">
              <p>
                <strong className="text-zinc-850 font-serif tracking-wide block uppercase text-[10px] mb-1">Boutique Sales (POS Register)</strong> handles instantaneous register checks. Build checkout logs, assign customer programs, and process checkout payments.
              </p>
              <p>
                <strong className="text-zinc-850 font-serif tracking-wide block uppercase text-[10px] mb-1">Merchandising (Stocks)</strong> tracks physical box levels. Adding items appends stock to selection rows, and quick restock overlays handles bulk counts.
              </p>
              <p>
                <strong className="text-zinc-850 font-serif tracking-wide block uppercase text-[10px] mb-1">Procuring (Suppliers)</strong> tracks raw import transactions. Placing orders drafts PO logs that increment matching products once marked received.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
