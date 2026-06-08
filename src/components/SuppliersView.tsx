/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, Dispatch, SetStateAction } from 'react';
import { Truck, MapPin, Map, Mail, Phone, CalendarRange } from 'lucide-react';
import { Supplier, PurchaseOrder } from '../types';

interface SuppliersViewProps {
  suppliers: Supplier[];
  setSuppliers: Dispatch<SetStateAction<Supplier[]>>;
  appendPurchaseOrder: (po: PurchaseOrder) => void;
  searchQuery: string;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SuppliersView({ suppliers, setSuppliers, appendPurchaseOrder, searchQuery, showNotification }: SuppliersViewProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('');

  // States for adding a new supplier
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLeadTime, setNewLeadTime] = useState('');
  const [newReliability, setNewReliability] = useState('');

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSupplier = (e: FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newLocation || !newEmail || !newLeadTime || !newReliability) {
      showNotification("Please fill in all supplier fields.", "error");
      return;
    }

    const reliabilityNum = parseInt(newReliability);
    if (isNaN(reliabilityNum) || reliabilityNum < 0 || reliabilityNum > 100) {
      showNotification("Reliability percentage must be between 0 and 100.", "error");
      return;
    }

    const initials = newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const added: Supplier = {
      id: `s-${Date.now()}`,
      name: newName,
      role: newRole,
      location: newLocation,
      email: newEmail,
      leadTime: newLeadTime,
      reliability: reliabilityNum,
      phone: '+1 (555) 019-2834', // Default placeholder
      initials,
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400'
    };

    setSuppliers(prev => [...prev, added]);
    setShowAddModal(false);
    
    // Reset fields
    setNewName('');
    setNewRole('');
    setNewLocation('');
    setNewEmail('');
    setNewLeadTime('');
    setNewReliability('');

    showNotification("Supplier affiliate added successfully!", "success");
  };

  const handleCreateOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !skuCode || !itemName || !itemPrice || !itemQty) {
      showNotification("Please populate all purchase order coordinates.", "error");
      return;
    }

    const priceNum = parseFloat(itemPrice);
    const qtyNum = parseInt(itemQty);

    if (isNaN(priceNum) || isNaN(qtyNum) || qtyNum <= 0) {
      showNotification("Invalid numeric input dimensions.", "error");
      return;
    }

    const supObj = suppliers.find(s => s.id === selectedSupplierId);
    if (!supObj) return;

    const totalCost = priceNum * qtyNum;
    const po: PurchaseOrder = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: supObj.name,
      supplierInitials: supObj.initials,
      dateCreated: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Sent',
      totalCost,
      items: [
        { sku: skuCode, name: itemName, quantity: qtyNum, price: priceNum }
      ]
    };

    appendPurchaseOrder(po);
    setShowOrderModal(false);

    // Reset fields
    setSelectedSupplierId('');
    setSkuCode('');
    setItemName('');
    setItemPrice('');
    setItemQty('');

    showNotification("Purchase order dispatched! View it in the orders drawer log.", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-zinc-900 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">Supplier Partnerships</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Coordinate global raw material specialized writing vendors and place procurement requests.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-800 hover:text-zinc-900 px-5 py-2.5 rounded-none text-[11px] uppercase tracking-[0.2em] font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            + Affiliate Supplier
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="bg-zinc-900 border border-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-none text-[11px] uppercase tracking-[0.2em] font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            Procure Wares
          </button>
        </div>
      </div>

      {/* Supplier Grid list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(sup => (
          <div 
            key={sup.id} 
            className="bg-white rounded-none p-6 border border-zinc-200 shadow-sm hover:border-zinc-400 hover:shadow-md transition-all flex flex-col justify-between text-left group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <img 
                  alt={sup.name} 
                  className="w-14 h-14 rounded-none object-cover border border-zinc-250 bg-zinc-50 filter brightness-95" 
                  src={sup.image}
                  referrerPolicy="no-referrer"
                />
                
                {/* Reliability rating indicator */}
                <div className="text-right">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Reliability</span>
                  <p className="text-emerald-600 font-mono font-bold text-sm mt-0.5">{sup.reliability}%</p>
                </div>
              </div>

              <h4 className="font-serif font-light text-zinc-900 text-lg leading-tight tracking-wide uppercase">{sup.name}</h4>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1 font-semibold">{sup.role}</p>

              <div className="space-y-2.5 mt-5 text-xs text-zinc-500 font-mono">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{sup.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-zinc-400" />
                  <span>Lead Time: <strong className="text-zinc-850 font-sans">{sup.leadTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span className="truncate">{sup.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-150 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedSupplierId(sup.id);
                  setShowOrderModal(true);
                }}
                className="w-full bg-zinc-50 hover:bg-zinc-900 text-zinc-800 hover:text-white border border-zinc-250 hover:border-zinc-950 text-[10px] uppercase tracking-widest font-semibold py-2 rounded-none transition-all active:scale-[0.98] text-center cursor-pointer"
              >
                Assemble Procurements
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Procure supplies procurement PO generator form */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-md w-full p-8 border border-zinc-300 text-left space-y-4 shadow-2xl">
            <h3 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3">Procure Core Supplies</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Formulate purchase orders to request fresh custom elements from premium vendors.</p>

            <form onSubmit={handleCreateOrder} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Target Vendor</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-2 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans cursor-pointer font-semibold"
                  required
                >
                  <option value="">Select Vendor...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Item Title</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., German Gold Tips"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">SKU Identification</label>
                  <input
                    type="text"
                    required
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value)}
                    placeholder="e.g., GER-NIB-01"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Estimated Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="850.00"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Quantity Requested</label>
                  <input
                    type="number"
                    required
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    placeholder="100"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-zinc-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 text-[10px] uppercase tracking-wider bg-transparent rounded-none transition-all cursor-pointer"
                >
                  Discard Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-805 text-[10px] uppercase tracking-widest font-semibold rounded-none transition-all cursor-pointer shadow"
                >
                  Dispatch PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add New Supplier Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-sm w-full p-8 border border-zinc-300 text-left space-y-4 shadow-2xl">
            <h3 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3">Affiliate Supplier</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Enlist a new bespoke raw material specialist or writing instrument artisan.</p>

            <form onSubmit={handleCreateSupplier} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Company / Artisan Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Dresden Nib Atelier"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Specialty Guild / Role</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g., German Gold Nibsmith"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Lead Time</label>
                  <input
                    type="text"
                    required
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(e.target.value)}
                    placeholder="e.g., 4-6 Days"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Reliability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newReliability}
                    onChange={(e) => setNewReliability(e.target.value)}
                    placeholder="98"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="atelier@dresden.de"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Location City</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Dresden, DE"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-zinc-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 text-[10px] uppercase tracking-wider bg-transparent rounded-none transition-all cursor-pointer"
                >
                  Discard Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-805 text-[10px] uppercase tracking-widest font-semibold rounded-none transition-all cursor-pointer shadow"
                >
                  Affiliate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
