/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, Product, Customer, Supplier, PurchaseOrder, SalesRecord, ActiveUser } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_SALES_RECORDS 
} from './data';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CoPilotPanel from './components/CoPilotPanel';
import DashboardView from './components/DashboardView';
import BillingView from './components/BillingView';
import InventoryView from './components/InventoryView';
import CustomersView from './components/CustomersView';
import SuppliersView from './components/SuppliersView';
import OrdersView from './components/OrdersView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
          })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function seedCollection<T extends { id: string }>(uid: string, collectionName: string, initialData: T[]) {
  try {
    for (const item of initialData) {
      await setDoc(doc(db, 'users', uid, collectionName, item.id), item);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/${collectionName}`);
  }
}

export default function App() {
  // Authentication bypass / checks
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCoPilotOpen, setIsCoPilotOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>({
    name: 'Alex Mercer',
    email: 'alex.mercer@luxescribe.com',
    photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD5YsGKpJKTzuuh418xaKVew5XA0yOIx9GyXhIjmjXfVRBwAktCDA3-59nSWgBcHt632aT15i_u-HEDCgGtB5TNX6aldNyrBEbWte66BMKlb44bQu7ex8EzqHifrDyxfyMvcr71Z8wfbs-b8Ksh8dQzNhic1DWCrq87mVHL3MwOf-xEvHPTUTDGnhu6dKx91JenW-lPmAyopYhwntk7fZBBcV0ENjrEOCLSQ7TVavXBzd9bdvu7WNKxQjRWlCS9-hMrFdD6jxeQk0',
    role: 'Store Manager'
  });

  // Attach Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'Boutique Owner'
        });
        setIsAuthenticated(true);
      }
    });
    return unsubscribe;
  }, []);

  // Base raw Firestore states
  const [productsState, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customersState, setCustomersState] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliersState, setSuppliersState] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrdersState, setPurchaseOrdersState] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [salesRecordsState, setSalesRecordsState] = useState<SalesRecord[]>(INITIAL_SALES_RECORDS);

  // Database initialization and notification states
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Synced live database state selectors
  const products = productsState;
  const customers = customersState;
  const suppliers = suppliersState;
  const purchaseOrders = purchaseOrdersState;
  const salesRecords = salesRecordsState;

  // Intercept state updates to synchronously replicate local adjustments into cloud-native Firestore collections
  const setProducts = (value: React.SetStateAction<Product[]>) => {
    setProductsState((prev) => {
      const resolved = typeof value === 'function' ? (value as Function)(prev) : value;
      if (isAuthenticated && auth.currentUser) {
        const uid = auth.currentUser.uid;
        // Delete items no longer present
        prev.forEach(async (oldItem) => {
          if (!resolved.some(item => item.id === oldItem.id)) {
            try {
              await deleteDoc(doc(db, 'users', uid, 'products', oldItem.id));
            } catch (e) {
              console.error("Firestore product delete error:", e);
            }
          }
        });
        // Add/update items
        resolved.forEach(async (item: Product) => {
          const oldItem = prev.find(p => p.id === item.id);
          if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
            try {
              await setDoc(doc(db, 'users', uid, 'products', item.id), item);
            } catch (e) {
              console.error("Firestore product write error:", e);
            }
          }
        });
      }
      return resolved;
    });
  };

  const setCustomers = (value: React.SetStateAction<Customer[]>) => {
    setCustomersState((prev) => {
      const resolved = typeof value === 'function' ? (value as Function)(prev) : value;
      if (isAuthenticated && auth.currentUser) {
        const uid = auth.currentUser.uid;
        // Delete items no longer present
        prev.forEach(async (oldItem) => {
          if (!resolved.some(item => item.id === oldItem.id)) {
            try {
              await deleteDoc(doc(db, 'users', uid, 'customers', oldItem.id));
            } catch (e) {
              console.error("Firestore customer delete error:", e);
            }
          }
        });
        // Add/update items
        resolved.forEach(async (item: Customer) => {
          const oldItem = prev.find(c => c.id === item.id);
          if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
            try {
              await setDoc(doc(db, 'users', uid, 'customers', item.id), item);
            } catch (e) {
              console.error("Firestore customer write error:", e);
            }
          }
        });
      }
      return resolved;
    });
  };

  const setSuppliers = (value: React.SetStateAction<Supplier[]>) => {
    setSuppliersState((prev) => {
      const resolved = typeof value === 'function' ? (value as Function)(prev) : value;
      if (isAuthenticated && auth.currentUser) {
        const uid = auth.currentUser.uid;
        // Delete items no longer present
        prev.forEach(async (oldItem) => {
          if (!resolved.some(item => item.id === oldItem.id)) {
            try {
              await deleteDoc(doc(db, 'users', uid, 'suppliers', oldItem.id));
            } catch (e) {
              console.error("Firestore supplier delete error:", e);
            }
          }
        });
        // Add/update items
        resolved.forEach(async (item: Supplier) => {
          const oldItem = prev.find(s => s.id === item.id);
          if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
            try {
              await setDoc(doc(db, 'users', uid, 'suppliers', item.id), item);
            } catch (e) {
              console.error("Firestore supplier write error:", e);
            }
          }
        });
      }
      return resolved;
    });
  };

  const setPurchaseOrders = (value: React.SetStateAction<PurchaseOrder[]>) => {
    setPurchaseOrdersState((prev) => {
      const resolved = typeof value === 'function' ? (value as Function)(prev) : value;
      if (isAuthenticated && auth.currentUser) {
        const uid = auth.currentUser.uid;
        // Delete items no longer present
        prev.forEach(async (oldItem) => {
          if (!resolved.some(item => item.id === oldItem.id)) {
            try {
              await deleteDoc(doc(db, 'users', uid, 'purchase_orders', oldItem.id));
            } catch (e) {
              console.error("Firestore order delete error:", e);
            }
          }
        });
        // Add/update items
        resolved.forEach(async (item: PurchaseOrder) => {
          const oldItem = prev.find(o => o.id === item.id);
          if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
            try {
              await setDoc(doc(db, 'users', uid, 'purchase_orders', item.id), item);
            } catch (e) {
              console.error("Firestore order write error:", e);
            }
          }
        });
      }
      return resolved;
    });
  };

  const setSalesRecords = (value: React.SetStateAction<SalesRecord[]>) => {
    setSalesRecordsState((prev) => {
      const resolved = typeof value === 'function' ? (value as Function)(prev) : value;
      if (isAuthenticated && auth.currentUser) {
        const uid = auth.currentUser.uid;
        // Delete items no longer present
        prev.forEach(async (oldItem) => {
          if (!resolved.some(item => item.id === oldItem.id)) {
            try {
              await deleteDoc(doc(db, 'users', uid, 'sales_records', oldItem.id));
            } catch (e) {
              console.error("Firestore sale delete error:", e);
            }
          }
        });
        // Add/update items
        resolved.forEach(async (item: SalesRecord) => {
          const oldItem = prev.find(s => s.id === item.id);
          if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
            try {
              await setDoc(doc(db, 'users', uid, 'sales_records', item.id), item);
            } catch (e) {
              console.error("Firestore sale write error:", e);
            }
          }
        });
      }
      return resolved;
    });
  };

  // Live snapshot hooks synchronization
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) {
      setProductsState(INITIAL_PRODUCTS);
      setCustomersState(INITIAL_CUSTOMERS);
      setSuppliersState(INITIAL_SUPPLIERS);
      setPurchaseOrdersState(INITIAL_PURCHASE_ORDERS);
      setSalesRecordsState(INITIAL_SALES_RECORDS);
      setIsDbReady(true);
      return;
    }

    const uid = auth.currentUser.uid;
    setIsDbReady(false);

    const initializeAndListen = async () => {
      try {
        // Products check and seed
        const prodCheck = await getDocs(collection(db, 'users', uid, 'products'));
        if (prodCheck.empty) {
          await seedCollection(uid, 'products', INITIAL_PRODUCTS);
        }

        // Customers check and seed
        const custCheck = await getDocs(collection(db, 'users', uid, 'customers'));
        if (custCheck.empty) {
          await seedCollection(uid, 'customers', INITIAL_CUSTOMERS);
        }

        // Suppliers check and seed
        const suppCheck = await getDocs(collection(db, 'users', uid, 'suppliers'));
        if (suppCheck.empty) {
          await seedCollection(uid, 'suppliers', INITIAL_SUPPLIERS);
        }

        // Orders check and seed
        const ordersCheck = await getDocs(collection(db, 'users', uid, 'purchase_orders'));
        if (ordersCheck.empty) {
          await seedCollection(uid, 'purchase_orders', INITIAL_PURCHASE_ORDERS);
        }

        // Sales check and seed
        const salesCheck = await getDocs(collection(db, 'users', uid, 'sales_records'));
        if (salesCheck.empty) {
          await seedCollection(uid, 'sales_records', INITIAL_SALES_RECORDS);
        }
        setIsDbReady(true);
      } catch (err) {
        console.error("Firestore synchronization initial seeding failed:", err);
        // Fallback to local sandbox active mode on error
        setIsDbReady(true);
      }
    };

    initializeAndListen();

    // Setup active, real-time listeners returning active state
    const unsubscribeProducts = onSnapshot(collection(db, 'users', uid, 'products'), (snapshot) => {
      const dataList: Product[] = [];
      snapshot.forEach(docSnap => {
        dataList.push(docSnap.data() as Product);
      });
      // Sort to preserve order
      setProductsState(dataList.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/products`);
    });

    const unsubscribeCustomers = onSnapshot(collection(db, 'users', uid, 'customers'), (snapshot) => {
      const dataList: Customer[] = [];
      snapshot.forEach(docSnap => {
        dataList.push(docSnap.data() as Customer);
      });
      setCustomersState(dataList.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/customers`);
    });

    const unsubscribeSuppliers = onSnapshot(collection(db, 'users', uid, 'suppliers'), (snapshot) => {
      const dataList: Supplier[] = [];
      snapshot.forEach(docSnap => {
        dataList.push(docSnap.data() as Supplier);
      });
      setSuppliersState(dataList.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/suppliers`);
    });

    const unsubscribeOrders = onSnapshot(collection(db, 'users', uid, 'purchase_orders'), (snapshot) => {
      const dataList: PurchaseOrder[] = [];
      snapshot.forEach(docSnap => {
        dataList.push(docSnap.data() as PurchaseOrder);
      });
      setPurchaseOrdersState(dataList.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/purchase_orders`);
    });

    const unsubscribeSales = onSnapshot(collection(db, 'users', uid, 'sales_records'), (snapshot) => {
      const dataList: SalesRecord[] = [];
      snapshot.forEach(docSnap => {
        dataList.push(docSnap.data() as SalesRecord);
      });
      setSalesRecordsState(dataList.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/sales_records`);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCustomers();
      unsubscribeSuppliers();
      unsubscribeOrders();
      unsubscribeSales();
    };
  }, [isAuthenticated, auth.currentUser?.uid]);

  // App Navigation & Interaction states
  const [currentView, setView] = useState<AppView>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Settings states
  const [taxEnabled, setTaxEnabled] = useState<boolean>(true);
  const [taxRate, setTaxRate] = useState<number>(0.0825);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);

  // Calculable top state metrics
  const totalRevenue = salesRecords.reduce((acc, r) => acc + r.amount, 0);
  const activeOrdersCount = salesRecords.filter(r => r.status === 'Processing' || r.status === 'Shipped').length;
  const customerGrowthCount = customers.length;

  // Actions for data synchronization across views
  const appendSalesRecord = (record: SalesRecord) => {
    setSalesRecords(prev => [record, ...prev]);
    if (soundEffects) {
      try {
        // Play standard register sound chime
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high chime frequency
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        console.log("Audio cue bypassed in standard sandbox context.", e);
      }
    }
  };

  const appendPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => [po, ...prev]);
  };

  const handleResetDatabase = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setSalesRecords(INITIAL_SALES_RECORDS);
    setView('DASHBOARD');
  };

  // Helper callbacks to dynamically increment state metrics
  const incrementRevenue = (amount: number) => {
    // Already handled by appending standard records which recalcs totalRevenue
  };

  const incrementActiveOrders = () => {
    // Already tracked reactively inside components
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }).catch((err) => {
      console.error("Firebase SignOut Error", err);
      setIsAuthenticated(false);
    });
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={(googleUser?: ActiveUser) => {
      if (googleUser) {
        setCurrentUser(googleUser);
      }
      setIsAuthenticated(true);
    }} />;
  }

  if (!isDbReady) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-zinc-50 font-sans">
        <div className="w-10 h-10 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="font-serif font-light text-xl text-zinc-900 tracking-widest uppercase mb-1 animate-pulse">Synchronizing</h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest animate-pulse">Replicating premium inventory database...</p>
      </div>
    );
  }

  // Active Screen Renderer
  const renderActiveView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <DashboardView 
            products={products}
            salesRecords={salesRecords}
            totalRevenue={totalRevenue}
            activeOrdersCount={activeOrdersCount}
            customerGrowthCount={customerGrowthCount}
            setView={setView}
            showNotification={showNotification}
          />
        );
      case 'BILLING':
        return (
          <BillingView 
            products={products}
            setProducts={setProducts}
            customers={customers}
            setCustomers={setCustomers}
            appendSalesRecord={appendSalesRecord}
            incrementRevenue={incrementRevenue}
            incrementActiveOrders={incrementActiveOrders}
            searchQuery={searchQuery}
            showNotification={showNotification}
          />
        );
      case 'INVENTORY':
        return (
          <InventoryView 
            products={products}
            setProducts={setProducts}
            searchQuery={searchQuery}
            showNotification={showNotification}
          />
        );
      case 'CUSTOMERS':
        return (
          <CustomersView 
            customers={customers}
            setCustomers={setCustomers}
            searchQuery={searchQuery}
            showNotification={showNotification}
          />
        );
      case 'SUPPLIERS':
        return (
          <SuppliersView 
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            appendPurchaseOrder={appendPurchaseOrder}
            searchQuery={searchQuery}
            showNotification={showNotification}
          />
        );
      case 'ORDERS':
        return (
          <OrdersView 
            purchaseOrders={purchaseOrders}
            setPurchaseOrders={setPurchaseOrders}
            products={products}
            setProducts={setProducts}
            searchQuery={searchQuery}
            showNotification={showNotification}
          />
        );
      case 'SETTINGS':
        return (
          <SettingsView 
            taxEnabled={taxEnabled}
            setTaxEnabled={setTaxEnabled}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
            soundEffects={soundEffects}
            setSoundEffects={setSoundEffects}
            onResetDatabase={handleResetDatabase}
            showNotification={showNotification}
          />
        );
      default:
        return <div>Selected Module Unknown</div>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans antialiased text-zinc-900">
      {/* Drawer Navigation Bar */}
      <Sidebar 
         currentUser={currentUser}
        currentView={currentView}
        setView={(v) => {
          setView(v);
          setSearchQuery(''); // Reset queries across module jumps
        }}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main viewport Container */}
      <div className="flex-1 flex flex-col md:pl-[280px]">
        {/* Module horizontal tracker bar */}
        <Header 
          currentUser={currentUser}
          currentView={currentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          showNotification={showNotification}
          onOpenCoPilot={() => setIsCoPilotOpen(!isCoPilotOpen)}
        />

        {/* Dynamic Inner body viewport area with scroll containment */}
        <main className="p-6 md:p-10 max-w-[1600px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      <CoPilotPanel 
        isOpen={isCoPilotOpen} 
        onClose={() => setIsCoPilotOpen(false)} 
        products={products} 
        showNotification={showNotification} 
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-zinc-900 border border-zinc-950 text-white px-5 py-3.5 rounded-none shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'
          }`} />
          <span className="text-[11px] uppercase tracking-wider font-semibold font-sans">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-zinc-400 hover:text-white text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
