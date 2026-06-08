/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from 'react';
import { PlusCircle, Package, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  searchQuery: string;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function InventoryView({ products, setProducts, searchQuery, showNotification }: InventoryViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // ScribeAI Product copywriter state controllers
  const [aiConcept, setAiConcept] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiCopywriter, setShowAiCopywriter] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // Add Product form state
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Pens');
  const [newSKU, setNewSKU] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newImage, setNewImage] = useState('');

  // Filtering
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.stockStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick diagnostics
  const totalItems = products.length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < 10).length;

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newSKU || !newStock) {
      showNotification("Please populate name, price, SKU, and initial stock level.", "error");
      return;
    }

    const priceNum = parseFloat(newPrice);
    const stockNum = parseInt(newStock);

    if (isNaN(priceNum) || isNaN(stockNum)) {
      showNotification("Invalid numerical input values.", "error");
      return;
    }

    const defaultImagesByCat: Record<string, string> = {
      Pens: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtAurLSR-Da6ufLVWrcycW26cKVyvXziChcebcwF_72JtxADFJ3xaYDEKFb_AS4Gz3rHfoJUlreJYVQCIPKtAShtIhkriVk-fDF-bvK-ChUQuiI9JFNuR7pcjU9QFeNFZ91VEIOw5OzAB7tlW4GNyR_bWx4NuWZrpb9HwxVgpAxdQCmwO7sqCOIdCCsjC8TFqmpqFAL7yP8U2uRsJkBSB7ZGpA5FZg2JkqNSBe2jJ1xHAaqMjybXjwRlOWQX6lAJG75CO9gI-SpMo',
      Papers: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbgXA8Qd-9xaPCORvrWPSLyN281w296jjCUXaV3SI-vg4Eq-4YiXBoXWhbimIeM2zatkKPSbGj2yUKLIHGMgWbOUCXiYGn1gNDbfneAK0JTVVTBsLmw_vtX61RfQfW0-_HYaOqS0V7EcUQLUECnIjMMfmYNF6FAtSH4YBMtO0FrHXfYa_y65TACT2w6U-MRQJK7YEZ9UUKYzR82gAe6WuUIYAXrGiOtsJZXrbkUd6JB4_cy9Ac55JimT3Mkj4W_bpOC8hh9QqdqPI',
      Ink: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDURBH9_LOCXw07FPwf656wHEWb7u-UY4AjCyoFagvRHPJ8dLYqMLX5CSZrk_WLLxEm5Mn1PXD23U25KyRzFvirfeboFSeZDzuxPwmNtecP5nTRqjC5xRafBkFL9Swza3fzt5HXlQmIH5pSOVvv8GcN41PF5pRBrPiy7xrFCWzi68syVBFIYNCN39CMxYfHvr18yE40TBrqROy20M5XGlVV4uTwf2thS0PWNvmln0zCd7JJKymdMFHBWniaEboFCl4SsKYmerUXFJ0',
      Accessories: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfRIpRt_w2DzhRjFJQGpQxRAhYz6WaP51JpNWOcIJxnCj9J_imNGl5oAmXCVlVaPIIOwPX19J7EH4Dx-umwqPQryPUgj-b6vvqNvgNS71BdR-OwJkAOwtFAx0bD-c2TtmWPkdILE5WPdSLtLfjEPGi1D3o0KuQffH-Lfhur_6WQNdQCbrTZUnH-SMVbXvKjHRsnXjnWDKQ_iGtzcGUBgoPGkQwmgA4eaX0ucR_xGlC3f3KYythGAd3optPr5KrUKvPa7olBrkarHM',
    };

    const addedProd: Product = {
      id: `p-${Date.now()}`,
      name: newName,
      brand: newBrand || 'LuxeScribe',
      price: priceNum,
      stock: stockNum,
      category: newCategory,
      soldQuantity: 0,
      sku: newSKU,
      image: newImage || defaultImagesByCat[newCategory] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtAurLSR-Da6ufLVWrcycW26cKVyvXziChcebcwF_72JtxADFJ3xaYDEKFb_AS4Gz3rHfoJUlreJYVQCIPKtAShtIhkriVk-fDF-bvK-ChUQuiI9JFNuR7pcjU9QFeNFZ91VEIOw5OzAB7tlW4GNyR_bWx4NuWZrpb9HwxVgpAxdQCmwO7sqCOIdCCsjC8TFqmpqFAL7yP8U2uRsJkBSB7ZGpA5FZg2JkqNSBe2jJ1xHAaqMjybXjwRlOWQX6lAJG75CO9gI-SpMo',
      stockStatus: stockNum <= 0 ? 'Out of Stock' : stockNum < 10 ? 'Low Stock' : 'In Stock',
      soldThisWeek: 0
    };

    setProducts(prev => [addedProd, ...prev]);
    setShowAddModal(false);

    // Reset fields
    setNewName('');
    setNewBrand('');
    setNewPrice('');
    setNewCategory('Pens');
    setNewSKU('');
    setNewStock('');
    setNewImage('');

    showNotification("Product catalog item created successfully!", "success");
  };

  const handleRestockSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRestock) return;

    setProducts(prev => prev.map(p => {
      if (p.id === selectedProductForRestock.id) {
        const addedValue = parseInt(restockQty as any);
        const resolvedStock = p.stock + addedValue;
        return {
          ...p,
          stock: resolvedStock,
          stockStatus: resolvedStock <= 0 ? 'Out of Stock' : resolvedStock < 10 ? 'Low Stock' : 'In Stock'
        };
      }
      return p;
    }));

    setShowRestockModal(false);
    setSelectedProductForRestock(null);

    showNotification("Product inventory restocked successfully!", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-zinc-900 font-sans">
      
      {/* Title + Action Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">Storehouse Inventory</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Add custom premium writing instruments, notebooks and archival inks.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-zinc-900 border border-zinc-950 hover:bg-zinc-850 text-white px-5 py-2.5 rounded-none text-[11px] uppercase tracking-[0.2em] font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Diagnostics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-100/50 p-4 rounded-none border border-zinc-200">
        <div className="p-4 bg-white rounded-none border border-zinc-200 text-left shadow-sm">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Catalog SKUs</span>
          <p className="text-2xl font-serif font-light text-zinc-900 mt-1">{totalItems}</p>
        </div>
        <div className="p-4 bg-white rounded-none border border-zinc-200 text-left shadow-sm">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Low Stock Alert</span>
          <p className="text-2xl font-serif font-light text-amber-600 mt-1">{lowStockItems} Items</p>
        </div>
        <div className="p-4 bg-white rounded-none border border-zinc-200 text-left shadow-sm">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">Out of Stock</span>
          <p className="text-2xl font-serif font-light text-rose-600 mt-1">{outOfStockItems} Items</p>
        </div>
      </div>

      {/* Grid Filters Tab Row */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex gap-2">
          {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-none text-[10px] uppercase tracking-widest font-semibold transition-all cursor-pointer ${
                statusFilter === tab 
                  ? 'bg-zinc-900 text-white border border-zinc-950 font-bold' 
                  : 'text-zinc-500 hover:text-zinc-900 border border-transparent hover:bg-zinc-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold font-mono">{filtered.length} Items Listed</span>
      </div>

      {/* Complete Desk Wares Inventory Table */}
      <div className="bg-white border border-zinc-200 rounded-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-55 border-b border-zinc-200">
                <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Product</th>
                <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">SKU Code</th>
                <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Unit Price</th>
                <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right">Boutique Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(prod => (
                <tr key={prod.id} className="hover:bg-zinc-50/50 transition-colors">
                  {/* Product block cell */}
                  <td className="px-6 py-4 flex items-center gap-4 text-left">
                    <img 
                      alt={prod.name} 
                      className="w-10 h-10 rounded-none object-cover border border-zinc-200 bg-zinc-50 filter brightness-95" 
                      src={prod.image}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif font-light text-zinc-900 text-sm leading-snug tracking-wide uppercase">{prod.name}</h4>
                      <p className="text-zinc-400 text-xs mt-0.5 font-mono">{prod.brand}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-zinc-550 uppercase tracking-wider">{prod.category}</td>
                  
                  <td className="px-6 py-4 text-xs font-mono text-zinc-500">{prod.sku}</td>

                  <td className="px-6 py-4 text-xs font-mono text-zinc-900 font-semibold">₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>

                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-0.5 border text-[9px] font-semibold uppercase tracking-widest rounded-none ${
                        prod.stockStatus === 'In Stock' 
                          ? 'border-zinc-200 bg-zinc-50 text-zinc-700' 
                          : prod.stockStatus === 'Low Stock' 
                          ? 'border-amber-200 text-amber-700 bg-amber-50' 
                          : 'border-red-250 text-red-700 bg-red-50'
                      }`}>
                        {prod.stockStatus === 'In Stock' ? `${prod.stock} In Stock` : prod.stockStatus === 'Low Stock' ? `${prod.stock} Low Stock` : 'Out of Stock'}
                      </span>
                    </div>
                  </td>

                  {/* Inline quick updates trigger actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedProductForRestock(prod);
                        setRestockQty(10);
                        setShowRestockModal(true);
                      }}
                      className="px-3 py-1.5 border border-zinc-200 hover:border-zinc-900 text-zinc-600 hover:text-white bg-zinc-50 hover:bg-zinc-900 rounded-none text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1"
                    >
                      Restock Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Overlay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-lg w-full p-8 border border-zinc-300 text-left space-y-4 shadow-2xl">
            <h3 className="font-serif font-light text-xl text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3">Add Premium Ware</h3>
            
            {/* ScribeAI Auto-Copywriter Integration Section */}
            <div className="bg-zinc-100/50 border border-zinc-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-800">ScribeAI Instrument Designer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiCopywriter(!showAiCopywriter)}
                  className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-950 cursor-pointer underline decoration-dotted decoration-zinc-400"
                >
                  {showAiCopywriter ? "[ Hide Co-Pilot ]" : "[ Configure with AI ]"}
                </button>
              </div>

              {showAiCopywriter ? (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <p className="text-[10px] text-zinc-500 font-serif leading-relaxed uppercase tracking-wider">
                    Describe your luxury writing ware concepts (e.g., "Sapphire blue celluloid pen, handcrafted silver trim").
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiConcept}
                      onChange={(e) => setAiConcept(e.target.value)}
                      placeholder="e.g., Starry night fountain pen in polished obsidian..."
                      className="flex-1 bg-white border border-zinc-200 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 font-semibold"
                    />
                    <button
                      type="button"
                      disabled={aiLoading || !aiConcept.trim()}
                      onClick={async () => {
                        setAiLoading(true);
                        try {
                          const res = await fetch("/api/ai/copywriter", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              concept: aiConcept,
                              category: newCategory,
                              brand: newBrand || "LuxeScribe Artisans",
                            })
                          });

                          if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.error || "Failed to generate copy.");
                          }

                          const data = await res.json();
                          setNewName(data.name || "");
                          setNewBrand("LuxeScribe Artisans");
                          setNewPrice(data.price ? String(data.price) : "");
                          setNewSKU(data.sku || "");
                          showNotification("LuxeScribe AI compiled product details successfully!", "success");
                          
                          if (data.reasoning) {
                            showNotification(`Boutique Justification: ${data.reasoning}`, "info");
                          }
                        } catch (err: any) {
                          showNotification(err.message || "Boutique AI failed.", "error");
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white disabled:bg-zinc-300 border border-zinc-950 px-3.5 py-2 text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {aiLoading ? "Consulting..." : "Forge Details"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Slimline Mechanical Pencil"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">Brand Name</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g., LuxeScribe"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">Stock Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-2 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans cursor-pointer"
                  >
                    <option value="Pens">Pens</option>
                    <option value="Papers">Papers</option>
                    <option value="Ink">Ink</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="3500.00"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">Stock Vol</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="25"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">SKU Unique ID</label>
                  <input
                    type="text"
                    required
                    value={newSKU}
                    onChange={(e) => setNewSKU(e.target.value)}
                    placeholder="LX-SL-PENCIL"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="URL address"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-150 text-[10px] uppercase tracking-wider bg-transparent rounded-none transition-all cursor-pointer"
                >
                  Discard Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-800 text-[10px] uppercase tracking-widest font-semibold rounded-none transition-all cursor-pointer shadow"
                >
                  Put to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restocking Modal Overlay */}
      {showRestockModal && selectedProductForRestock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-sm w-full p-8 border border-zinc-300 text-left space-y-4 shadow-2xl font-sans">
            <h3 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-2">Restock Product</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">
              Increase storehouse stock level for <strong>{selectedProductForRestock.name}</strong>.
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Restock Volume Added</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-[10px] uppercase tracking-wider bg-transparent rounded-none transition-all cursor-pointer"
                >
                  Discard Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-800 text-[10px] uppercase tracking-widest font-semibold rounded-none transition-all cursor-pointer shadow"
                >
                  Restock Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
