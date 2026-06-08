/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, HelpCircle, Menu, Sparkles } from 'lucide-react';
import { AppView, ActiveUser } from '../types';

interface HeaderProps {
  currentUser: ActiveUser | null;
  currentView: AppView;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onMenuToggle: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenCoPilot: () => void;
}

export default function Header({ currentUser, currentView, searchQuery, setSearchQuery, onMenuToggle, showNotification, onOpenCoPilot }: HeaderProps) {
  // Get corresponding search placeholder based on selected view
  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'INVENTORY':
        return 'Search inventory...';
      case 'BILLING':
        return 'Search products in stock...';
      case 'CUSTOMERS':
        return 'Search customers, loyalty ID, emails...';
      case 'SUPPLIERS':
        return 'Search suppliers, locations...';
      case 'ORDERS':
        return 'Search purchase orders...';
      default:
        return 'Global search...';
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return 'LuxeScribe';
      case 'INVENTORY':
        return 'Inventory';
      case 'BILLING':
        return 'POS Billing';
      case 'CUSTOMERS':
        return 'Customer Relations';
      case 'SUPPLIERS':
        return 'Supplier Relations';
      case 'ORDERS':
        return 'Purchase Orders';
      case 'SETTINGS':
        return 'System Settings';
      default:
        return 'LuxeScribe';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-zinc-200 px-6 md:px-10 py-4 flex justify-between items-center w-full">
      {/* Search and view indicator */}
      <div className="flex items-center gap-4 flex-1">
        {/* Burger menu button for small screens */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-zinc-100 rounded-xl text-zinc-900 active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h2 className="font-serif font-light text-lg text-zinc-900 tracking-widest uppercase md:hidden">
          {getTitle()}
        </h2>

        {/* Dynamic Search Bar */}
        {currentView !== 'SETTINGS' && currentView !== 'DASHBOARD' ? (
          <div className="relative hidden md:block w-80 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-zinc-100 border border-zinc-200 hover:border-zinc-300 rounded-full py-1.5 pl-10 pr-4 text-xs font-sans text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 focus:outline-none transition-all"
            />
          </div>
        ) : (
          <h2 className="hidden md:block font-serif font-light text-base text-zinc-800 tracking-widest uppercase">
            LuxeScribe Pro Boutique Management
          </h2>
        )}
      </div>

      {/* Notifications, actions, help and profile details */}
      <div className="flex items-center gap-3">
        {/* ScribeOracle AI assistant button */}
        <button 
          onClick={onOpenCoPilot}
          className="relative bg-zinc-900 border border-zinc-950 hover:bg-zinc-800 text-white px-3.5 py-1.5 rounded-none text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md ml-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Oracle AI</span>
        </button>

        {/* Active responsive stats button */}
        <button 
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 transition-transform cursor-pointer border border-zinc-200"
          onClick={() => showNotification("Welcome to LuxeScribe Pro! Real-time alerts are activated.", "info")}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse"></span>
        </button>

        <button 
          className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 transition-transform cursor-pointer border border-zinc-200"
          onClick={() => showNotification("LuxeScribe Help: Use the side drawer navigation to switch between modules, add items to cart, run checkouts, and manage purchase orders.", "info")}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-6 w-[1px] bg-zinc-200 hidden md:block mx-1"></div>

        {/* User Account Small Widget */}
        <div className="flex items-center gap-2 cursor-pointer p-0.5 rounded-full hover:bg-zinc-100 transition-colors">
          <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-250">
            {currentUser?.photoURL ? (
              <img 
                alt="Manager Avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
                src={currentUser.photoURL}
              />
            ) : (
              <span className="text-zinc-600 font-bold text-[10px]">
                {currentUser?.name?.slice(0, 2) || 'AM'}
              </span>
            )}
          </div>
          <span className="hidden md:block text-[10px] uppercase tracking-widest font-medium text-zinc-700 mr-2">
            {currentUser?.name || 'Alex Mercer'}
          </span>
        </div>
      </div>
    </header>
  );
}
