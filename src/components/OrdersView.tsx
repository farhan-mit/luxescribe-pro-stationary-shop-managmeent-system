/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction } from 'react';
import { Clock, Check } from 'lucide-react';
import { PurchaseOrder, Product } from '../types';

interface OrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: Dispatch<SetStateAction<PurchaseOrder[]>>;
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  searchQuery: string;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function OrdersView({
  purchaseOrders,
  setPurchaseOrders,
  products,
  setProducts,
  searchQuery,
  showNotification
}: OrdersViewProps) {
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const filtered = purchaseOrders.filter(po => 
    po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Receipt process - increments corresponding product stock!
  const recordReceipt = (po: PurchaseOrder) => {
    // 1. Move Status to Received
    setPurchaseOrders(prevPOs => {
      return prevPOs.map(currentPO => {
        if (currentPO.id === po.id) {
          return { ...currentPO, status: 'Received' };
        }
        return currentPO;
      });
    });

    // 2. Loop PO items, increment matching stock inside Products index
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        // Look for items in PO
        const matchedItem = po.items.find(item => item.sku === p.sku);
        if (matchedItem) {
          const freshStock = p.stock + matchedItem.quantity;
          return {
            ...p,
            stock: freshStock,
            stockStatus: freshStock <= 0 ? 'Out of Stock' : freshStock < 10 ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      });
    });

    // Update focused PO reference if open
    setSelectedPO(prev => prev && prev.id === po.id ? { ...prev, status: 'Received' } : prev);

    showNotification(`Receipt recorded! Material stock coordinates for ${po.supplier} successfully merged into inventory.`, "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 text-zinc-900 font-sans">
      
      {/* Orders Ledger Column */}
      <div className={`${selectedPO ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
        <div>
          <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">Purchase Order Logbooks</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Monitor ongoing shipments, raw restock manifests, and ledger transactions.</p>
        </div>

        {/* Orders List Container */}
        <div className="bg-white border border-zinc-200 rounded-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-55 border-b border-zinc-200">
                  <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">PO Number</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Source Partner</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Dispatch Date</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Invoice Cost</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map(po => {
                   const isFocused = selectedPO?.id === po.id;
                   return (
                     <tr 
                       key={po.id} 
                       onClick={() => setSelectedPO(po)}
                       className={`cursor-pointer transition-colors ${
                         isFocused ? 'bg-zinc-100' : 'hover:bg-zinc-50/50'
                       }`}
                     >
                       <td className="px-6 py-4 text-xs font-mono font-semibold text-zinc-900">{po.id}</td>
                       <td className="px-6 py-4 text-sm font-serif font-light text-zinc-800 uppercase tracking-wide">{po.supplier}</td>
                       <td className="px-6 py-4 text-xs text-zinc-500 font-mono">{po.dateCreated}</td>
                       <td className="px-6 py-4 text-xs font-mono text-zinc-900 font-semibold">₹{po.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-block px-2.5 py-0.5 border text-[9px] font-bold uppercase tracking-widest rounded-none ${
                           po.status === 'Received' 
                             ? 'border-zinc-200 bg-zinc-100 text-zinc-600' 
                             : 'border-amber-200 bg-amber-50 text-amber-700'
                         }`}>
                           {po.status}
                         </span>
                       </td>
                     </tr>
                   );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-400 text-xs font-mono uppercase tracking-wider">
                      No purchase order drafts are registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PO Details Drawer Overlay on selection */}
      {selectedPO && (
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-none p-6 shadow-xl flex flex-col justify-between h-[calc(100vh-140px)] sticky top-[96px] animate-in slide-in-from-right-8 duration-300 font-sans text-zinc-900">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">{selectedPO.id}</span>
                <h3 className="font-serif font-light text-lg text-zinc-900 mt-1 uppercase tracking-wider">{selectedPO.supplier}</h3>
              </div>
              <button 
                onClick={() => setSelectedPO(null)}
                className="text-zinc-500 hover:text-zinc-900 text-[10px] uppercase tracking-widest font-bold hover:underline"
              >
                Close Panel
              </button>
            </div>

            {/* Timelines and items */}
            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Shipment Pipeline</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-none bg-zinc-50 border border-zinc-200 text-zinc-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-serif font-light text-zinc-900 text-sm uppercase">Draft Completed & Dispatched</p>
                    <p className="text-zinc-500 font-mono text-[10px]">{selectedPO.dateCreated}</p>
                  </div>
                </div>

                {selectedPO.status === 'Received' && (
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-none border border-emerald-250 text-emerald-700 bg-emerald-50">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-serif font-light text-zinc-900 text-sm uppercase">Materials Integrated</p>
                      <p className="text-zinc-500 font-mono text-[10px]">Stock elements counted and indexed.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Details */}
              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 font-mono">Invoice Inventory Manifest</h4>
                <div className="space-y-3">
                  {selectedPO.items.map(item => (
                    <div key={item.sku} className="bg-zinc-50 p-3 rounded-none border border-zinc-200 flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-serif font-light text-sm text-zinc-900 truncate max-w-[200px] uppercase tracking-wide">{item.name}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1">SKU: {item.sku} • Vol {item.quantity}</p>
                      </div>
                      <span className="text-xs font-mono text-zinc-900 font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 mt-6">
            <div className="flex justify-between items-center mb-4 text-xs font-mono text-zinc-400 font-bold">
              <span className="uppercase tracking-wider">Purchase Account Total</span>
              <span className="text-lg font-bold text-zinc-900 font-mono">₹{selectedPO.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Record Receipt action button */}
            {selectedPO.status === 'Sent' ? (
              <button
                onClick={() => recordReceipt(selectedPO)}
                className="w-full bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-800 py-3 rounded-none text-[10px] uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                Drape Inventory & Restock
              </button>
            ) : (
              <div className="bg-zinc-50 rounded-none py-2.5 text-center text-[10px] uppercase tracking-widest text-zinc-650 font-bold border border-zinc-200 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Inventory Counts Merged
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
