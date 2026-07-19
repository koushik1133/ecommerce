import type { Product } from "./products";
import { products as CATALOG } from "./products";

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: "cod" | "upi" | "card";
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Customer ─────────────────────────────────────────────────────────────────
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderAt: string;
  tags: string[];
  joinedAt: string;
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export type DayRevenue = {
  date: string; // "2025-06-01"
  revenue: number;
  orders: number;
};

// ─── Seed helpers ─────────────────────────────────────────────────────────────
const NAMES = [
  "Arjun Sharma", "Priya Mehta", "Rahul Verma", "Sneha Iyer", "Kunal Bose",
  "Nisha Kapoor", "Dev Patel", "Ananya Reddy", "Vikram Singh", "Pooja Nair",
  "Aditya Kumar", "Meera Joshi", "Rohan Gupta", "Isha Chatterjee", "Siddharth Rao",
  "Kavya Pillai", "Manish Shah", "Ritika Agarwal", "Abhishek Das", "Divya Menon",
];
const CITIES = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];
const STATES = ["Maharashtra", "Karnataka", "Delhi", "Telangana", "Tamil Nadu", "Maharashtra", "West Bengal", "Gujarat"];
const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "delivered", "delivered", "shipped"];
const PAYMENTS = ["cod", "upi", "card"] as const;

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}
function isoStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 20) + 4);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

function makeItems(): OrderItem[] {
  const count = Math.floor(Math.random() * 2) + 1;
  const used = new Set<number>();
  const items: OrderItem[] = [];
  for (let i = 0; i < count; i++) {
    let idx: number;
    do { idx = Math.floor(Math.random() * CATALOG.length); } while (used.has(idx));
    used.add(idx);
    const p = CATALOG[idx];
    const color = p.colors[Math.floor(Math.random() * p.colors.length)];
    const size = p.sizes[Math.floor(Math.random() * p.sizes.length)];
    const qty = Math.random() > 0.7 ? 2 : 1;
    items.push({
      productId: p.id,
      name: p.name,
      color: color.name,
      size,
      quantity: qty,
      price: p.price,
    });
  }
  return items;
}

function makeOrder(index: number): Order {
  const name = NAMES[index % NAMES.length];
  const cityIdx = Math.floor(Math.random() * CITIES.length);
  const items = makeItems();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 1999 ? 0 : 79;
  const daysAgo = Math.floor(Math.random() * 60);
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  return {
    id: `ord-${String(index + 1).padStart(4, "0")}`,
    orderNumber: `#${10001 + index}`,
    customer: name,
    email: name.toLowerCase().replace(" ", ".") + "@gmail.com",
    phone: `+91 ${9000000000 + index * 7 + 123456}`.slice(0, 15),
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status,
    payment: PAYMENTS[Math.floor(Math.random() * PAYMENTS.length)],
    address: `${Math.floor(Math.random() * 900) + 100}, ${["MG Road", "Link Road", "Park Street", "Brigade Road"][Math.floor(Math.random() * 4)]}`,
    city: CITIES[cityIdx],
    state: STATES[cityIdx],
    pincode: `${400000 + Math.floor(Math.random() * 99999)}`,
    createdAt: isoStr(daysAgo),
    updatedAt: isoStr(Math.max(0, daysAgo - 1)),
  };
}

function makeCustomer(index: number): Customer {
  const name = NAMES[index % NAMES.length];
  const cityIdx = index % CITIES.length;
  const orders = Math.floor(Math.random() * 5) + 1;
  const spend = orders * (999 + Math.floor(Math.random() * 1200));
  return {
    id: `cus-${String(index + 1).padStart(4, "0")}`,
    name,
    email: name.toLowerCase().replace(" ", ".") + "@gmail.com",
    phone: `+91 ${9000000000 + index * 13 + 654321}`.slice(0, 15),
    city: CITIES[cityIdx],
    state: STATES[cityIdx],
    totalOrders: orders,
    totalSpend: spend,
    lastOrderAt: isoStr(Math.floor(Math.random() * 30)),
    tags: orders > 3 ? ["VIP", "Repeat"] : orders > 1 ? ["Repeat"] : ["New"],
    joinedAt: isoStr(Math.floor(Math.random() * 180) + 30),
  };
}

export const SEED_ORDERS: Order[] = [];

export const SEED_CUSTOMERS: Customer[] = [];

// 90-day revenue series
export const SEED_ANALYTICS: DayRevenue[] = [];

// Quick KPIs derived from seed data
export function getKPIs() {
  const totalRevenue = SEED_ORDERS
    .filter(o => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const today = new Date().toISOString().split("T")[0];
  const ordersToday = SEED_ORDERS.filter(o => o.createdAt.startsWith(today)).length;
  const avgOrder = totalRevenue / SEED_ORDERS.filter(o => o.status !== "cancelled").length;
  return {
    totalRevenue,
    ordersToday,
    avgOrder: Math.round(avgOrder),
    totalCustomers: SEED_CUSTOMERS.length,
    activeProducts: CATALOG.filter(p => !p.comingSoon).length,
    pendingOrders: SEED_ORDERS.filter(o => o.status === "pending" || o.status === "processing").length,
  };
}
