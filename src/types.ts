/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView = 'DASHBOARD' | 'INVENTORY' | 'BILLING' | 'CUSTOMERS' | 'SUPPLIERS' | 'ORDERS' | 'SETTINGS';

export interface Product {
  id: string;
  name: string;
  category: string; // e.g., 'Pens', 'Papers', 'Ink', 'Luxury', 'Notebooks', 'Accessories'
  brand: string;
  price: number;
  stock: number;
  soldQuantity: number;
  image: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sku: string;
  soldThisWeek: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  initials: string;
  status: 'Active' | 'Away' | 'Dormant';
  loyaltyTier: 'Elite' | 'Gold' | 'Platinum';
  points: number;
  totalSpend: number;
  lastActivity: string;
}

export interface Supplier {
  id: string;
  name: string;
  role: string; // e.g., 'Paper Specialist', 'Ink Chemistry', 'Writing Tools'
  location: string;
  leadTime: string;
  reliability: number; // percentage
  email: string;
  phone: string;
  image: string;
  initials: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  supplierInitials: string;
  dateCreated: string;
  status: 'Received' | 'Sent' | 'Draft';
  totalCost: number;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface SalesRecord {
  id: string;
  customerName: string;
  date: string;
  itemsCount: number;
  amount: number;
  status: 'Shipped' | 'Processing' | 'Delivered';
}

export interface ActiveUser {
  name: string;
  email: string;
  photoURL?: string;
  role: string;
}

