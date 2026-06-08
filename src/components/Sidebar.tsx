/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppView, ActiveUser } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Truck, 
  ShoppingCart, 
  Settings, 
  X
} from 'lucide-react';

interface SidebarProps {
  currentUser: ActiveUser | null;
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ currentUser, currentView, setView, onLogout, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'DASHBOARD' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'INVENTORY' as AppView, label: 'Inventory', icon: Package },
    { id: 'BILLING' as AppView, label: 'Billing', icon: Receipt },
    { id: 'CUSTOMERS' as AppView, label: 'Customers', icon: Users },
    { id: 'SUPPLIERS' as AppView, label: 'Suppliers', icon: Truck },
    { id: 'ORDERS' as AppView, label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <>
      {/* Mobile Backdrop blur overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        id="sidebar" 
        className={`fixed left-0 top-0 h-full w-[280px] z-50 flex flex-col py-8 bg-white border-r border-zinc-200 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding header */}
        <div className="px-6 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-zinc-900 flex items-center justify-center rounded-full">
              <div className="w-4 h-4 bg-zinc-900 rounded-sm"></div>
            </div>
            <div>
              <h2 className="font-serif font-light text-base text-zinc-900 tracking-widest uppercase">LuxeScribe</h2>
              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em]">Boutique PM</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 hover:bg-zinc-100 rounded-lg text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 pt-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`w-[calc(100%-32px)] flex items-center px-4 py-2.5 mx-4 border transition-all active:scale-[0.98] group ${
                  isActive 
                    ? 'bg-zinc-900 text-white border-zinc-950 font-medium' 
                    : 'text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <IconComponent className={`w-4 h-4 mr-3 transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'
                }`} />
                <span className="text-[11px] uppercase tracking-[0.2em]">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setView('SETTINGS');
              setIsOpen(false);
            }}
            className={`w-[calc(100%-32px)] flex items-center px-4 py-2.5 mx-4 border transition-all active:scale-[0.98] group ${
              currentView === 'SETTINGS'
                ? 'bg-zinc-900 text-white border-zinc-950 font-medium' 
                : 'text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Settings className={`w-4 h-4 mr-3 transition-colors ${
              currentView === 'SETTINGS' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'
            }`} />
            <span className="text-[11px] uppercase tracking-[0.2em]">Settings</span>
          </button>
        </nav>

        {/* User profile section */}
        <div className="mt-auto px-6 pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-full border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                {currentUser?.photoURL ? (
                  <img 
                    alt="Manager Profile" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                    src={currentUser.photoURL}
                  />
                ) : (
                  <span className="text-zinc-600 font-bold text-xs uppercase">
                    {currentUser?.name?.slice(0, 2) || 'AM'}
                  </span>
                )}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-[12px] font-medium text-zinc-900 truncate">
                  {currentUser?.name || 'Alex Mercer'}
                </p>
                <p className="text-[9px] text-zinc-400 tracking-widest uppercase truncate">
                  {currentUser?.role || 'Store Manager'}
                </p>
              </div>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-[9px] text-zinc-500 hover:text-red-650 font-bold uppercase tracking-widest cursor-pointer hover:underline transition-colors ml-2 shrink-0"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
