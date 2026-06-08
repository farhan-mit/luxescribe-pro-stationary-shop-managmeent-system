/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from 'react';
import { UserPlus, Award, ShieldCheck, Mail, Sparkles, X, Copy } from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  searchQuery: string;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CustomersView({ customers, setCustomers, searchQuery, showNotification }: CustomersViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState<'Gold' | 'Platinum' | 'Elite'>('Gold');

  // ScribeAI VIP Outreach state controllers
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [outreachPurpose, setOutreachPurpose] = useState('Loyalty appreciation & elite invitation');
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<{ subject: string; body: string; recommendation: string } | null>(null);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = (e: FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      showNotification("Please fill in name and email coordinates.", "error");
      return;
    }

    const initials = newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const added: Customer = {
      id: `c-${Date.now()}`,
      name: newName,
      email: newEmail,
      initials,
      status: 'Active',
      loyaltyTier: newTier,
      points: 100, // Welcome points
      totalSpend: 0.00,
      lastActivity: 'Just Enrolled'
    };

    setCustomers(prev => [...prev, added]);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    showNotification(`Patron ${newName} successfully registered!`, "success");
  };

  // Highlights calculated values
  const totalSpend = customers.reduce((acc, c) => acc + c.totalSpend, 0);
  const avgSpend = totalSpend / (customers.length || 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-zinc-900 font-sans">
      
      {/* Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">Patrons</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Coordinate VIP loyalty parameters and review customer lifetime value.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-zinc-900 border border-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-none text-[11px] uppercase tracking-[0.2em] font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Enlist New Patron
        </button>
      </div>

      {/* Relations Summary Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-zinc-200 rounded-none text-left relative group shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Active Patrons</span>
            <span className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse"></span>
          </div>
          <p className="text-3xl font-serif font-light text-zinc-900">{customers.length}</p>
        </div>

        <div className="bg-white p-6 border border-zinc-200 rounded-none text-left relative group shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Average Lifetime LTV</span>
          </div>
          <p className="text-3xl font-serif font-light text-zinc-900">₹{avgSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-6 border border-zinc-200 rounded-none text-left relative group shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Loyalty Pool Earned</span>
            <Award className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-3xl font-serif font-light text-zinc-900">
            {customers.reduce((acc, c) => acc + c.points, 0).toLocaleString('en-IN')} <span className="text-xs text-zinc-400 uppercase tracking-[0.2em] ml-1 font-sans font-bold">Pts</span>
          </p>
        </div>
      </div>

      {/* Patrons Card List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(cust => (
          <div 
            key={cust.id} 
            className="bg-white p-6 border border-zinc-200 rounded-none hover:border-zinc-400 hover:shadow-xl transition-all flex flex-col justify-between text-left group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-none border border-zinc-200 bg-zinc-50 flex items-center justify-center font-serif font-light text-zinc-900 text-xs tracking-wider uppercase font-bold">
                  {cust.initials}
                </div>
                
                {/* Loyalty Tag */}
                <span className={`px-2.5 py-1 border text-[9px] font-semibold uppercase tracking-widest flex items-center gap-1 rounded-none ${
                  cust.loyaltyTier === 'Elite' 
                    ? 'border-purple-200 text-purple-700 bg-purple-50 font-mono' 
                    : cust.loyaltyTier === 'Platinum'
                    ? 'border-zinc-300 text-zinc-800 bg-zinc-100 font-mono'
                    : 'border-amber-200 text-amber-700 bg-amber-50 font-mono'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {cust.loyaltyTier}
                </span>
              </div>

              <h4 className="font-serif font-light text-zinc-900 text-base tracking-wide uppercase">{cust.name}</h4>
              <p className="text-zinc-500 text-xs mt-1.5 truncate flex items-center gap-1 font-mono">
                <Mail className="w-3 h-3 text-zinc-400" />
                {cust.email}
              </p>

              <button
                onClick={() => {
                  setSelectedCustomer(cust);
                  setGeneratedLetter(null);
                  setShowOutreachModal(true);
                }}
                className="mt-4 w-full px-3 py-2 border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-900 hover:text-white text-zinc-600 bg-zinc-50/50 rounded-none text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Relations Concierge
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-150 flex justify-between items-center text-[10px] uppercase tracking-wider">
              <div>
                <p className="text-zinc-400 font-bold font-mono">LTV Spend</p>
                <p className="text-zinc-900 font-semibold font-mono text-xs mt-0.5">₹{cust.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 font-sans font-bold">Loyalty Pool</p>
                <p className="text-zinc-900 font-semibold font-mono text-xs mt-0.5">{cust.points} Pts</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white border border-zinc-200 rounded-none p-12 text-center text-zinc-400 uppercase tracking-widest text-xs">
            No patrons listed under matching search keys.
          </div>
        )}
      </div>

      {/* Add New Patron modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-sm w-full p-8 border border-zinc-300 text-left space-y-4 shadow-2xl">
            <h3 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3">Enlist New Patron</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Draft high-value boutique coordinates for loyalty credentials.</p>

            <form onSubmit={handleAddCustomer} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Charles Foster"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g., charles@guild.co"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Loyalty Rewards Tier</label>
                <select
                  value={newTier}
                  onChange={(e: any) => setNewTier(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-2 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans cursor-pointer font-semibold"
                >
                  <option value="Gold">Gold Tier (Welcome bonus 100 points)</option>
                  <option value="Platinum">Platinum Tier (Welcome bonus 100 points)</option>
                  <option value="Elite">Elite Tier VIP (Welcome bonus 100 points)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-505 hover:bg-zinc-100 text-[10px] uppercase tracking-wider bg-transparent rounded-none transition-all cursor-pointer"
                >
                  Discard Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-800 text-[10px] uppercase tracking-widest font-semibold rounded-none transition-all cursor-pointer shadow"
                >
                  Register Patron
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ScribeAI VIP Outreach dialog */}
      {showOutreachModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-2xl w-full p-8 border border-zinc-300 text-left space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">ScribeAI Guest Relations</span>
                <h3 className="font-serif font-light text-xl text-zinc-900 uppercase tracking-widest">VIP Concierge Outreach</h3>
              </div>
              <button
                onClick={() => {
                  setShowOutreachModal(false);
                  setGeneratedLetter(null);
                }}
                className="text-zinc-400 hover:text-zinc-900 p-1 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 border border-zinc-200">
              <div className="text-[10px] uppercase tracking-wider space-y-1 text-zinc-650">
                <p><strong>Guest Name:</strong> {selectedCustomer.name}</p>
                <p><strong>Coordinates:</strong> {selectedCustomer.email}</p>
                <p><strong>Loyalty Level:</strong> {selectedCustomer.loyaltyTier} Tier</p>
              </div>
              <div className="text-[10px] uppercase tracking-wider space-y-1 text-zinc-650">
                <p><strong>Lifetime LTV Spent:</strong> ₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}</p>
                <p><strong>Loyalty Point Pool:</strong> {selectedCustomer.points} Pts</p>
                <p><strong>Current Standing:</strong> {selectedCustomer.status}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Outreach Strategic Imperative</label>
              <select
                value={outreachPurpose}
                onChange={(e) => setOutreachPurpose(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all font-semibold cursor-pointer"
              >
                <option value="Loyalty appreciation & elite invitation">Exclusive VIP Loyalty Appreciation & Lounge Invitation</option>
                <option value="Dormant winback & special voucher release">Winback outreach for dormant patron (Special premium inks gift)</option>
                <option value="Milestone anniversary congratulations">Congratulations on Platinum milestone & writing instrument advice</option>
                <option value="Sneak peek product release VIP access">Private boutique preview access to newly forged products</option>
              </select>
            </div>

            {generatedLetter ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Exquisite Subject Line</span>
                  <div className="bg-zinc-50 border border-zinc-200 p-3 text-xs font-serif text-zinc-900 font-semibold selection:bg-zinc-200">
                    {generatedLetter.subject}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Concierge Forged Copywork</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${generatedLetter.subject}\n\n${generatedLetter.body}`);
                        showNotification("VIP Letter copied to clipboard!", "success");
                      }}
                      className="text-[9px] uppercase tracking-widest font-bold text-zinc-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy Full Message
                    </button>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-4 text-xs font-serif leading-relaxed text-zinc-800 h-48 overflow-y-auto selection:bg-zinc-200 whitespace-pre-wrap font-semibold">
                    {generatedLetter.body}
                  </div>
                </div>

                {generatedLetter.recommendation && (
                  <div className="bg-amber-50/50 border border-amber-200/50 p-3 text-[10px] text-amber-950 leading-relaxed font-serif uppercase tracking-wider font-semibold">
                    <strong>Concierge Product Suggestion:</strong> {generatedLetter.recommendation}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-zinc-100/50 p-8 text-center border border-dashed border-zinc-250 text-zinc-400 text-xs font-serif font-semibold">
                Configure your strategic imperative and click compose below to forge a bespoke outreach copy using LuxeScribe AI.
              </div>
            )}

            <div className="flex gap-3 justify-end pt-3 border-t border-zinc-150">
              <button
                type="button"
                onClick={() => {
                  setShowOutreachModal(false);
                  setGeneratedLetter(null);
                }}
                className="px-4 py-2 border border-zinc-200 text-zinc-505 hover:bg-zinc-150 hover:text-zinc-900 text-[10px] uppercase tracking-wider bg-transparent rounded-none transition-all cursor-pointer font-semibold"
              >
                Discard Close
              </button>
              <button
                type="button"
                disabled={outreachLoading}
                onClick={async () => {
                  setOutreachLoading(true);
                  try {
                    const res = await fetch("/api/ai/vip-outreach", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: selectedCustomer.name,
                        email: selectedCustomer.email,
                        loyaltyTier: selectedCustomer.loyaltyTier,
                        points: selectedCustomer.points,
                        totalSpend: selectedCustomer.totalSpend,
                        purpose: outreachPurpose,
                      }),
                    });

                    if (!res.ok) {
                      const errData = await res.json();
                      throw new Error(errData.error || "Failed to generate outreach letter.");
                    }

                    const data = await res.json();
                    setGeneratedLetter(data);
                    showNotification("Bespoke outreach message finalized!", "success");
                  } catch (err: any) {
                    showNotification(err.message || "Failed guest relations outreach compose.", "error");
                  } finally {
                    setOutreachLoading(false);
                  }
                }}
                className="px-5 py-2 bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-800 text-[10px] uppercase tracking-widest font-bold rounded-none transition-all cursor-pointer shadow inline-flex items-center gap-1.5"
              >
                {outreachLoading ? "Forging Copy..." : "Forge Response with AI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
