/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowRight, Calendar, Landmark, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, Sparkles, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Product, SalesRecord, AppView } from '../types';

interface DashboardViewProps {
  products: Product[];
  salesRecords: SalesRecord[];
  totalRevenue: number;
  activeOrdersCount: number;
  customerGrowthCount: number;
  setView: (view: AppView) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DashboardView({
  products,
  salesRecords,
  totalRevenue,
  activeOrdersCount,
  customerGrowthCount,
  setView,
  showNotification
 }: DashboardViewProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>('Fri');

  // ScribeAI Trend Forecast states
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastData, setForecastData] = useState<{
    summary: string;
    priorities: Array<{ category: string; skuOrItem: string; actionRequired: string; urgency: string }>;
    marketInsight: string;
  } | null>(null);
  const [showForecastSection, setShowForecastSection] = useState(false);

  // Chart data matching high fidelity layout with Rupees
  const barChartData = [
    { day: 'Mon', height: '40%', value: '₹1.2k' },
    { day: 'Tue', height: '60%', value: '₹1.8k' },
    { day: 'Wed', height: '55%', value: '₹1.6k' },
    { day: 'Thu', height: '85%', value: '₹2.4k' },
    { day: 'Fri', height: '95%', value: '₹2.8k' },
    { day: 'Sat', height: '70%', value: '₹2.1k' },
    { day: 'Sun', height: '50%', value: '₹1.5k' },
  ];

  // Specific highlighted trending products to match mockup
  const trendingProductsMock = [
    {
      id: 'p1',
      name: 'Azure Gold Series III',
      category: 'FOUNTAIN PENS',
      price: 18500.00,
      soldThisWeek: '42 sold this week',
      tag: 'Best Seller',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH9vORW9-1twdvCe8A9iL-mlzkmE11GNEcSh6LLr4fF02zl32EwCnL5xd5xssdjomoQjcEk7L_6UYZGhg3Ib6sTu95a2mMTh0XcHnL3-2hELv9JcqnEaP2rcDrlLzY7d3iCoJavBfSU1x_c90j7cq7PzCS5mbMo6OKqjTv0KuThS6hT-y2IPLHdd3WKzUp7kuebp1HitTxVPZjxgolvHIDZam4OzJj8yPxvMaH_8DGi3uOnxuVpZh3wbYinF-4LS5d3LOHYvAvoDY',
    },
    {
      id: 'p4',
      name: 'Heritage Leather Journal',
      category: 'NOTEBOOKS',
      price: 6400.00,
      soldThisWeek: '18 sold this week',
      tag: 'Low Stock',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgLYiouDeI7v9pOpxk39vFLoTPPFHuqrg6rbDCz-rKBAQPfGMTOCNfEfM83o7v-wqxgaPbU-PyeWVRo8aYebRlTLSCuvB9A69DxNIXHNxW3gOtGhz9O3Y2x25BoV5X6BygeHKnUgMnf_8a0ImWaYjhij-ZZj8rmm1tjadysvZDKfBKjTsbNHwacMyIDm6py4ur05t8WB5SQcI4CdrpjnGbgq4baVjGeTEUYLRp1R25_xm_D6PAwLYoUEjblkdWAe2h79QoxU2UVdY',
    },
    {
      id: 'p3',
      name: 'Midnight Indigo Ink Set',
      category: 'INKS',
      price: 3200.00,
      soldThisWeek: '35 sold this week',
      tag: null,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmbV9Lj5gzj_nl4uXzBsi5lz5mSO-y5f3H0ssuhF3mw5iSgKGw2maYK5QEFctzm49pxAuXk9w_jojDQNljvMEAoknTBf2QbeWgdTcUxO9g6YINhRQoOW2_66BIKZvDv73R9t0O9G2LuWI52ZrNGLpq66X8zW1Wq-L1cZUTRh6BxY3pNOsJlf2wlVM6PeTfWQx3eKjZaOMD7cB6zdlMbDGuL6nPNisJMtZ-j8drAcLjmFL3j77YbclEoMTWo_TcF7qyB5Z7OJ6SNe0',
    },
    {
      id: 'p12',
      name: 'Modernist Brass Tray',
      category: 'ACCESSORIES',
      price: 9500.00,
      soldThisWeek: '12 sold this week',
      tag: 'New',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfRIpRt_w2DzhRjFJQGpQxRAhYz6WaP51JpNWOcIJxnCj9J_imNGl5oAmXCVlVaPIIOwPX19J7EH4Dx-umwqPQryPUgj-b6vvqNvgNS71BdR-OwJkAOwtFAx0bD-c2TtmWPkdILE5WPdSLtLfjEPGi1D3o0KuQffH-Lfhur_6WQNdQCbrTZUnH-SMVbXvKjHRsnXjnWDKQ_iGtzcGUBgoPGkQwmgA4eaX0ucR_xGlC3f3KYythGAd3optPr5KrUKvPa7olBrkarHM',
    }
  ];

  // Category sales statistics matching design scheme
  const categoryStats = [
    { name: 'Fountain Pens', percentage: 45 },
    { name: 'Leather Notebooks', percentage: 30 },
    { name: 'Archival Inks', percentage: 15 },
    { name: 'Accessories', percentage: 10 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-zinc-900 font-sans">
      {/* Title Header area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="font-serif font-light text-3xl text-zinc-900 tracking-widest uppercase">Performance</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">LuxeScribe Register Analytics & movement.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 border border-zinc-200 rounded-none text-[11px] uppercase tracking-widest font-medium flex items-center gap-2 bg-white hover:border-zinc-900 text-zinc-800 transition-colors cursor-pointer"
            onClick={() => showNotification("Calendar Filter: Filtering sales for the past 30 days.", "info")}
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            Last 30 Days
          </button>
          <button 
            className="px-5 py-2 bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-950 rounded-none text-[11px] uppercase tracking-[0.2em] font-semibold transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer shadow-md"
            onClick={() => {
              const csvData = "Order ID,Customer,Date,Amount,Status\n" + salesRecords.map(r => `${r.id},${r.customerName},${r.date},${r.amount},${r.status}`).join('\n');
              const blob = new Blob([csvData], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('href', url);
              a.setAttribute('download', 'luxescribe_sales_report.csv');
              a.click();
            }}
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Bento Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-white p-6 border border-zinc-200 rounded-none relative group hover:border-zinc-400 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-800">
              <Landmark className="w-5 h-5 text-zinc-500" />
            </div>
            <span className="text-zinc-600 text-[10px] tracking-wider uppercase bg-zinc-50 px-2.5 py-1 border border-zinc-200 rounded-none flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              +12.4%
            </span>
          </div>
          <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.2em]">Total Revenue</p>
          <h3 className="font-serif font-light text-3xl text-zinc-900 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* Card 2: Customers */}
        <div className="bg-white p-6 border border-zinc-200 rounded-none relative group hover:border-zinc-400 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-800">
              <Users className="w-5 h-5 text-zinc-500" />
            </div>
            <span className="text-zinc-600 text-[10px] tracking-wider uppercase bg-zinc-50 px-2.5 py-1 border border-zinc-200 rounded-none flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              +8.2%
            </span>
          </div>
          <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.2em]">Customer Growth</p>
          <h3 className="font-serif font-light text-3xl text-zinc-900 mt-1">
            {customerGrowthCount.toLocaleString('en-IN')}
          </h3>
        </div>

        {/* Card 3: Active Orders */}
        <div className="bg-white p-6 border border-zinc-200 rounded-none relative group hover:border-zinc-400 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-800">
              <ShoppingBag className="w-5 h-5 text-zinc-500" />
            </div>
            <span className="text-zinc-500 text-[10px] tracking-wider uppercase bg-zinc-50 px-2.5 py-1 border border-zinc-200 rounded-none flex items-center gap-1 font-mono">
              <ArrowDownRight className="w-3 h-3 text-red-500" />
              -2.1%
            </span>
          </div>
          <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.2em]">Active Orders</p>
          <h3 className="font-serif font-light text-3xl text-zinc-900 mt-1">
            {activeOrdersCount}
          </h3>
        </div>
      </div>

      {/* ScribeAI Predictive Logistics Module */}
      <div className="bg-white border border-zinc-200 p-6 rounded-none shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-900 border border-zinc-950 text-white rounded-none">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
                ScribeAI Predictive Logistics
              </h4>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Demand forecasting, trends, and inventory health metrics</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowForecastSection(!showForecastSection)}
            className="px-4 py-2 border border-zinc-200 hover:border-zinc-900 text-zinc-800 text-[10px] uppercase tracking-widest font-bold font-sans transition-all cursor-pointer inline-flex items-center gap-2"
          >
            {showForecastSection ? (
              <>Hide Predictive Analytics <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /></>
            ) : (
              <>Load ScribeAI Intelligence <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /></>
            )}
          </button>
        </div>

        {showForecastSection && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {!forecastData && !forecastLoading && (
              <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200">
                <p className="text-xs text-zinc-400 font-serif mb-4 max-w-md mx-auto uppercase tracking-wider font-semibold">
                  Generate instant demand predictive projections and restocking priorities compiled dynamically using ScribeOracle live inventory telemetry.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    setForecastLoading(true);
                    try {
                      const res = await fetch("/api/ai/demand-forecast", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ products }),
                      });

                      if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.error || "Failed to generate trend forecasts.");
                      }

                      const data = await res.json();
                      setForecastData(data);
                      showNotification("Predictive inventory health compiled!", "success");
                    } catch (err: any) {
                      showNotification(err.message || "Predictive logistical model failed.", "error");
                    } finally {
                      setForecastLoading(false);
                    }
                  }}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-950 text-[10px] uppercase tracking-widest font-bold shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  Compute Trend Analysis
                </button>
              </div>
            )}

            {forecastLoading && (
              <div className="py-12 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-t-zinc-900 border-zinc-200 rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-405">Consulting ScribeOracle Strategic Logistics Engine...</p>
              </div>
            )}

            {forecastData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left: General Market Insight & Executive Summary */}
                <div className="space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 p-5 space-y-2 text-left">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 font-mono">Curator Trend Outlook</span>
                    <p className="text-xs text-zinc-800 leading-relaxed font-serif font-semibold whitespace-pre-line">
                      {forecastData.summary}
                    </p>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200/50 p-5 space-y-2 text-left font-serif">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-amber-700 font-sans">ScribeOracle Core Insight</span>
                    <p className="text-xs text-amber-950 leading-relaxed font-semibold">
                      {forecastData.marketInsight}
                    </p>
                  </div>
                </div>

                {/* Right: Procurement Urgency list */}
                <div className="bg-white border border-zinc-200 overflow-hidden text-left flex flex-col justify-between">
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Procurement & Restock Priorities</span>
                  </div>
                  <div className="divide-y divide-zinc-150 overflow-y-auto max-h-64 font-sans">
                    {forecastData.priorities && forecastData.priorities.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-zinc-900 font-serif uppercase tracking-wider">{item.skuOrItem}</p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                          <p className="text-xs text-zinc-650 mt-1 font-semibold">{item.actionRequired}</p>
                        </div>
                        <span className={`px-2 py-0.5 border text-[8px] font-bold uppercase tracking-widest rounded-none ${
                          item.urgency === 'High' 
                            ? 'border-red-200 text-red-700 bg-red-50' 
                            : item.urgency === 'Medium'
                            ? 'border-amber-200 text-amber-700 bg-amber-50'
                            : 'border-zinc-200 text-zinc-500 bg-zinc-50'
                        }`}>
                          {item.urgency}
                        </span>
                      </div>
                    ))}
                    {(!forecastData.priorities || forecastData.priorities.length === 0) && (
                      <div className="p-6 text-center text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                        Supplies currently balanced.
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-zinc-100 bg-zinc-50/20 text-right font-sans">
                    <button
                      type="button"
                      onClick={() => setForecastData(null)}
                      className="text-[9px] uppercase tracking-widest font-bold text-zinc-505 hover:text-zinc-900 hover:underline cursor-pointer"
                    >
                      Reset Model Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Graphs / Analytics area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Custom Sales Trend Graph */}
        <div className="lg:col-span-8 bg-white rounded-none p-6 border border-zinc-200 overflow-hidden relative shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-3 border-b border-zinc-150">
            <div>
              <h4 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest">Sales Overview</h4>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-0.5">Daily boutique cash flow tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Revenue</span>
            </div>
          </div>

          {/* Bar Charts representing high-fidelity mockup */}
          <div className="h-56 flex items-end justify-between gap-3 px-4 relative mt-12 pb-2">
            {barChartData.map((data) => {
              const isSelected = selectedDay === data.day;
              return (
                <div 
                  key={data.day}
                  onMouseEnter={() => setSelectedDay(data.day)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group animate-in slide-in-from-bottom duration-300"
                >
                  {/* Tooltip on hovering or selected */}
                  <div className={`absolute top-0 transition-all duration-200 bg-zinc-900 text-white text-[10px] uppercase tracking-widest border border-zinc-800 px-2.5 py-1 rounded-none shadow-xl ${
                    isSelected ? 'opacity-100 scale-100 translate-y-[-10px]' : 'opacity-0 scale-90 pointer-events-none'
                  }`}>
                    {data.value}
                  </div>

                  {/* Visual Bar element */}
                  <div 
                    style={{ height: data.height }}
                    className={`w-full rounded-none transition-all duration-300 ${
                      isSelected 
                        ? 'bg-zinc-900 shadow-md shadow-zinc-950/10' 
                        : 'bg-zinc-150 hover:bg-zinc-200'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Label coordinates */}
          <div className="flex justify-between mt-4 px-4 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold border-t border-zinc-100 pt-3 font-mono">
            {barChartData.map((data) => (
              <span 
                key={data.day}
                className={`transition-colors duration-200 ${selectedDay === data.day ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}
                onClick={() => setSelectedDay(data.day)}
              >
                {data.day}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Sales categories progress bars */}
        <div className="lg:col-span-4 bg-white rounded-none p-6 border border-zinc-200 shadow-sm">
          <h4 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest mb-6 border-b border-zinc-150 pb-3">Sales by Category</h4>
          <div className="space-y-5">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="group cursor-pointer">
                <div className="flex justify-between text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-900 uppercase tracking-wider transition-colors mb-2">
                  <span>{cat.name}</span>
                  <span>{cat.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-none h-1.5 overflow-hidden">
                  <div 
                    className="bg-zinc-800 h-full rounded-none transition-all duration-1000 ease-out" 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Trending Products row */}
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-zinc-200 pb-4">
          <h4 className="font-serif font-light text-xl text-zinc-900 uppercase tracking-widest">Trending Products</h4>
          <button 
            onClick={() => setView('INVENTORY')}
            className="text-zinc-500 hover:text-zinc-900 font-semibold text-[11px] uppercase tracking-widest flex items-center gap-1 active:translate-x-1 transition-all cursor-pointer hover:underline"
          >
            View Inventory 
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProductsMock.map((prod) => (
            <div 
              key={prod.name} 
              className="bg-white rounded-none overflow-hidden border border-zinc-200 hover:border-zinc-400 transition-all duration-300 group flex flex-col cursor-pointer shadow-sm"
              onClick={() => setView('INVENTORY')}
            >
              <div className="h-52 overflow-hidden relative bg-zinc-50">
                <img 
                  alt={prod.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter group-hover:filter-none brightness-95" 
                  src={prod.image}
                  referrerPolicy="no-referrer"
                />
                {prod.tag && (
                  <div className="absolute top-3 right-3 bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-none text-[9px] uppercase tracking-widest font-semibold text-white">
                    {prod.tag}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1 font-mono">{prod.category}</p>
                  <h5 className="font-serif font-light text-zinc-900 group-hover:text-zinc-650 text-sm leading-snug transition-colors mb-2 uppercase tracking-wide">
                    {prod.name}
                  </h5>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-150">
                  <span className="text-zinc-900 font-semibold text-xs font-mono tracking-wider">₹{prod.price.toLocaleString('en-IN')}</span>
                  <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-mono">{prod.soldThisWeek}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent High-Value Orders table area */}
      <div className="bg-white rounded-none border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <h4 className="font-serif font-light text-lg text-zinc-900 uppercase tracking-widest">Recent High-Value Orders</h4>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold font-mono">Active cash registers synced</span>
        </div>
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest font-mono">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Items</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {salesRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-zinc-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 text-xs font-semibold text-zinc-900 font-mono">{rec.id}</td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-800">{rec.customerName}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500 font-mono">{rec.date}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{rec.itemsCount} {rec.itemsCount === 1 ? 'Item' : 'Items'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-900 font-mono">₹{rec.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-block px-2.5 py-1 border text-[9px] font-medium uppercase tracking-wider rounded-none ${
                      rec.status === 'Shipped' 
                        ? 'border-zinc-200 text-zinc-500 bg-zinc-50 font-mono' 
                        : rec.status === 'Processing'
                        ? 'border-amber-200 text-amber-700 bg-amber-50 animate-pulse font-mono'
                        : 'border-zinc-300 text-zinc-800 bg-zinc-100 font-mono'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
