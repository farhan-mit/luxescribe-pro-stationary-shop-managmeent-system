/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  User, 
  CheckCircle,
  X,
  CreditCard,
  Smartphone,
  Coins
} from 'lucide-react';
import { Product, CartItem, Customer, SalesRecord } from '../types';

interface BillingViewProps {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  appendSalesRecord: (record: SalesRecord) => void;
  incrementRevenue: (amount: number) => void;
  incrementActiveOrders: () => void;
  searchQuery: string;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function BillingView({
  products,
  setProducts,
  customers,
  setCustomers,
  appendSalesRecord,
  incrementRevenue,
  incrementActiveOrders,
  searchQuery,
  showNotification
}: BillingViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TAP'>('CARD');
  
  // Invoice overlay modal
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [invoiceDetails, setInvoiceDetails] = useState<{
    id: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    customer: Customer | null;
    paymentMethod: string;
  } | null>(null);

  const categories = ['All', 'Pens', 'Papers', 'Ink', 'Luxury', 'Accessories'];

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Add to cart handler
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        // Guard checking stock limit
        if (prevCart[existingIndex].quantity >= product.stock) {
          showNotification(`Unable to add: Only ${product.stock} items available in boutique inventory.`, "error");
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Adjust cart items
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          // Guard stock limits
          if (newQty > item.product.stock) {
            showNotification(`Unable to increase: Max stock reached (${item.product.stock} available)`, "error");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  // Price calculations
  const calculateSubtotal = () => cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const TAX_RATE = 0.18; // 18% GST for luxury boutique in Rupee calculations
  const subtotal = calculateSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Complete checkout transaction
  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotification("Billing Cart is empty.", "error");
      return;
    }

    const assignedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

    // Deduct stock levels from our React state index
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const cartItem = cart.find(ci => ci.product.id === p.id);
        if (cartItem) {
          const remainingStock = p.stock - cartItem.quantity;
          return {
            ...p,
            stock: remainingStock,
            soldQuantity: p.soldQuantity + cartItem.quantity,
            soldThisWeek: p.soldThisWeek + cartItem.quantity,
            stockStatus: remainingStock <= 0 ? 'Out of Stock' : remainingStock < 10 ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      });
    });

    // Award loyalty points to the customer
    if (assignedCustomer) {
      setCustomers(prevCustomers => {
        return prevCustomers.map(c => {
          if (c.id === assignedCustomer.id) {
            const addedPoints = Math.floor(subtotal / 500); // 1 loyalty point per 500 Rupees spent
            return {
              ...c,
              points: c.points + addedPoints,
              totalSpend: c.totalSpend + total,
              lastActivity: 'Just Now'
            };
          }
          return c;
        });
      });
    }

    const uniqueOrderId = `LX-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: SalesRecord = {
      id: uniqueOrderId,
      customerName: assignedCustomer ? assignedCustomer.name : 'Walk-in Customer',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      itemsCount: cart.reduce((acc, item) => acc + item.quantity, 0),
      amount: total,
      status: 'Delivered'
    };

    // Append history & metrics
    appendSalesRecord(record);
    incrementRevenue(total);
    incrementActiveOrders();

    // Stage invoice receipt visual popup details
    setInvoiceDetails({
      id: uniqueOrderId,
      items: cart,
      subtotal,
      tax,
      total,
      customer: assignedCustomer,
      paymentMethod
    });
    setShowInvoice(true);

    // Reset shopping state
    setCart([]);
    setSelectedCustomerId('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-300 text-zinc-900 font-sans">
      
      {/* Products Selection Catalog */}
      <div className="xl:col-span-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">POS Registers</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Select boutique writing instruments & luxury sets.</p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-none text-[10px] uppercase tracking-widest font-semibold cursor-pointer transition-all active:scale-[0.98] ${
                  selectedCategory === cat 
                    ? 'bg-zinc-900 text-white border border-zinc-950 font-bold' 
                    : 'bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => (
            <div 
              key={prod.id} 
              className={`bg-white overflow-hidden border transition-all duration-300 flex flex-col justify-between rounded-none ${
                prod.stock <= 0 
                  ? 'border-zinc-200 opacity-45' 
                  : 'border-zinc-200 hover:border-zinc-400 hover:shadow-xl'
              }`}
            >
              {/* Product Card Image with level tag */}
              <div className="h-44 bg-zinc-50 relative overflow-hidden">
                <img 
                  alt={prod.name} 
                  className="w-full h-full object-cover filter brightness-95 hover:filter-none transition-all duration-300" 
                  src={prod.image}
                  referrerPolicy="no-referrer"
                />
                
                {/* Level Tag Overlay */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 border text-[9px] font-semibold uppercase tracking-widest rounded-none ${
                  prod.stockStatus === 'In Stock' 
                    ? 'border-zinc-200 text-zinc-800 bg-white/95' 
                    : prod.stockStatus === 'Low Stock' 
                    ? 'border-amber-200 text-amber-700 bg-amber-50' 
                    : 'border-red-200 text-red-700 bg-red-50'
                }`}>
                  {prod.stockStatus === 'In Stock' ? `${prod.stock} Units` : prod.stockStatus === 'Low Stock' ? `${prod.stock} Left` : 'Sold Out'}
                </span>
              </div>

              {/* Informative details */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono">{prod.category}</span>
                  <h4 className="font-serif font-light text-zinc-900 text-sm leading-tight mt-1 uppercase tracking-wide">{prod.name}</h4>
                  <p className="text-zinc-500 text-[10px] mt-1 font-mono">SKU: {prod.sku} • {prod.brand}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-150">
                  <span className="text-zinc-900 font-semibold text-xs font-mono tracking-wider">₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  
                  {/* Cart trigger action button */}
                  <button
                    onClick={() => addToCart(prod)}
                    disabled={prod.stock <= 0}
                    className={`p-2 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      prod.stock <= 0 
                        ? 'border-zinc-100 text-zinc-300 cursor-not-allowed bg-zinc-50' 
                        : 'border-zinc-200 text-zinc-650 hover:text-white hover:bg-zinc-900 hover:border-zinc-950 active:scale-90 bg-zinc-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full bg-white border border-zinc-200 rounded-none p-12 text-center text-zinc-400 uppercase tracking-widest text-xs">
              No beautiful boutique desk supplies match your active query.
            </div>
          )}
        </div>
      </div>

      {/* Cart Checkout Right Panel */}
      <div className="xl:col-span-4 bg-white border border-zinc-200 rounded-none shadow-xl p-6 flex flex-col h-[calc(100vh-140px)] sticky top-[96px] text-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-700" />
            <h3 className="font-serif font-light text-base text-zinc-900 uppercase tracking-widest">Checkout</h3>
          </div>
          <span className="text-[9px] uppercase tracking-widest bg-zinc-100 text-zinc-650 border border-zinc-200 rounded-none px-2.5 py-1 font-mono font-bold">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
          </span>
        </div>

        {/* Customer Register Picker */}
        <div className="mb-4">
          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Assign Customer</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-none py-2.5 pl-9 pr-4 text-xs text-zinc-900 outline-none focus:border-zinc-400 transition-all cursor-pointer font-sans"
            >
              <option value="" className="bg-white text-zinc-900">Walk-in Customer (No Loyalty Program)</option>
              {customers.map(cust => (
                <option key={cust.id} value={cust.id} className="bg-white text-zinc-900">
                  {cust.name} ({cust.loyaltyTier} - {cust.points} Pts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Item Checklist Scrollbar */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-10">
              <div className="w-12 h-12 bg-zinc-50 rounded-none flex items-center justify-center text-zinc-400 mb-3 border border-zinc-200">
                <Plus className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Ready to draft bills</p>
              <p className="text-[10px] leading-relaxed max-w-[200px] mt-1 text-zinc-400">Select writing tools or luxury sets to place orders.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 justify-between items-center bg-zinc-50 p-3 rounded-none border border-zinc-150 hover:border-zinc-250 transition-colors">
                <img 
                  alt={item.product.name} 
                  className="w-10 h-10 rounded-none object-cover border border-zinc-200 bg-zinc-100" 
                  src={item.product.image}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 text-left min-w-0">
                  <h5 className="font-sans text-xs text-zinc-905 font-semibold truncate mb-0.5">{item.product.name}</h5>
                  <p className="text-[10px] text-zinc-500 font-mono">₹{item.product.price.toLocaleString('en-IN')}</p>
                </div>

                {/* Adjustments */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 hover:bg-zinc-200 text-zinc-500 cursor-pointer rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-mono font-semibold text-zinc-900 w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1 hover:bg-zinc-200 text-zinc-500 cursor-pointer rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 hover:bg-red-50 text-red-600 cursor-pointer rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Subtotals summary */}
        {cart.length > 0 && (
          <div className="border-t border-zinc-200 pt-4 mt-4 space-y-2 bg-white">
            <div className="flex justify-between text-[11px] text-zinc-550 font-medium tracking-wider uppercase">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-550 font-medium tracking-wider uppercase">
              <span>GST (18.00%)</span>
              <span className="font-mono">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-zinc-950 font-serif tracking-widest pt-2 border-t border-dashed border-zinc-200">
              <span className="uppercase">Total Price</span>
              <span className="font-mono font-bold">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4 pt-2">
              <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-none border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CARD' 
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' 
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold font-sans">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2.5 rounded-none border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'CASH' 
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' 
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold font-sans">Cash POS</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('TAP')}
                  className={`p-2.5 rounded-none border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'TAP' 
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' 
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold font-sans">Tap Pay</span>
                </button>
              </div>
            </div>

            {/* Complete Transaction */}
            <button
              onClick={handleCheckout}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-950 py-3 mt-4 rounded-none text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer font-serif"
            >
              Complete POS & Print
            </button>
          </div>
        )}
      </div>

      {/* Invoice receipt printed view overlay popup */}
      {showInvoice && invoiceDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-none max-w-sm w-full p-8 shadow-2xl border border-zinc-350 animate-in zoom-in-95 duration-200 text-left text-zinc-900 font-sans relative">
            <div className="flex justify-between items-start mb-4">
              <span className="border border-zinc-250 text-zinc-900 px-2.5 py-1 rounded-none text-[9px] font-semibold tracking-widest uppercase flex items-center gap-1 bg-zinc-50">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Receipt Verified
              </span>
              <button 
                onClick={() => setShowInvoice(false)}
                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt visual style */}
            <div className="text-center pb-4 border-b border-dashed border-zinc-200">
              <h4 className="font-serif font-light text-xl text-zinc-900 uppercase tracking-widest">LuxeScribe</h4>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-0.5">Boutique Register Invoice • {invoiceDetails.id}</p>
              <p className="text-zinc-400 text-[9px] tracking-wider mt-1 font-mono">{new Date().toLocaleString('en-IN')}</p>
            </div>

            <div className="py-4 space-y-3">
              {invoiceDetails.items.map(item => (
                <div key={item.product.id} className="flex justify-between text-[11px] uppercase tracking-wide">
                  <span className="text-zinc-750 font-medium truncate max-w-[200px]">
                    {item.product.name} <span className="text-zinc-400 font-mono font-bold ml-1">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-zinc-900 font-mono">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-zinc-200 pt-3 space-y-2 text-[11px] uppercase tracking-wider text-zinc-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900 font-mono">₹{invoiceDetails.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18.00%)</span>
                <span className="font-medium text-zinc-900 font-mono">₹{invoiceDetails.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-zinc-950 font-serif tracking-widest pt-2 border-t border-zinc-200 uppercase">
                <span>Receipt Total</span>
                <span className="font-mono font-bold">₹{invoiceDetails.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-none p-4 border border-zinc-200 text-center mt-5">
              <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono">Checkout Attributes</div>
              <p className="text-xs text-zinc-900 font-semibold mt-1.5 font-serif tracking-wide capitalize">
                {invoiceDetails.customer ? `${invoiceDetails.customer.name}` : 'Walk-in Register Checkout'}
              </p>
              <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-[0.15em] mt-1">
                Settled via {invoiceDetails.paymentMethod}
              </p>
            </div>

            <button
              onClick={() => {
                showNotification("Receipt printed successfully!", "success");
                setShowInvoice(false);
              }}
              className="w-full bg-zinc-900 text-white border border-zinc-950 hover:bg-zinc-800 py-3 mt-5 rounded-none text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all text-center cursor-pointer font-serif"
            >
              Print Receipt Paper
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
