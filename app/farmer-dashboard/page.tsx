"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getFarmerProducts } from "@/lib/api/products";
import { getFarmerOrders } from "@/lib/api/orders";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// ── Market Price Data ──────────────────────────────────────────────────────────
const BASE_PRICES = {
  vegetables: [
    { name: "Tomato", base: 40, unit: "kg" },
    { name: "Potato", base: 25, unit: "kg" },
    { name: "Onion", base: 35, unit: "kg" },
    { name: "Garlic", base: 180, unit: "kg" },
    { name: "Ginger", base: 120, unit: "kg" },
    { name: "Carrot", base: 60, unit: "kg" },
    { name: "Cauliflower", base: 45, unit: "piece" },
    { name: "Cabbage", base: 30, unit: "piece" },
    { name: "Spinach", base: 25, unit: "bunch" },
    { name: "Beans", base: 80, unit: "kg" },
    { name: "Peas", base: 100, unit: "kg" },
    { name: "Cucumber", base: 30, unit: "kg" },
    { name: "Bitter Gourd", base: 60, unit: "kg" },
    { name: "Eggplant", base: 40, unit: "kg" },
  ],
  fruits: [
    { name: "Apple", base: 180, unit: "kg" },
    { name: "Banana", base: 8, unit: "piece" },
    { name: "Mango", base: 120, unit: "kg" },
    { name: "Orange", base: 80, unit: "kg" },
    { name: "Papaya", base: 35, unit: "kg" },
    { name: "Guava", base: 60, unit: "kg" },
    { name: "Watermelon", base: 25, unit: "kg" },
    { name: "Pineapple", base: 80, unit: "piece" },
    { name: "Grapes", base: 200, unit: "kg" },
    { name: "Pomegranate", base: 250, unit: "kg" },
  ],
};

type PriceItem = { name: string; base: number; unit: string; current: number; change: number };
type PriceTab = "vegetables" | "fruits";

function generatePrices(tab: PriceTab): PriceItem[] {
  return BASE_PRICES[tab].map((item) => {
    const fluctuation = (Math.random() * 10 - 5) / 100;
    const current = Math.round(item.base * (1 + fluctuation));
    const change = parseFloat(((current - item.base) / item.base * 100).toFixed(1));
    return { ...item, current, change };
  });
}

// ── Status badge helpers ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  "out of stock": "bg-red-100 text-red-700",
  out_of_stock: "bg-red-100 text-red-700",
  disabled: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  const label = status?.replace(/_/g, " ");
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls} capitalize`}>
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`${iconBg} rounded-xl p-3 flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FarmerDashboardPage() {
  const { isAuthenticated, user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [priceTab, setPriceTab] = useState<PriceTab>("vegetables");
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshPrices = useCallback((tab: PriceTab) => {
    setPrices(generatePrices(tab));
    setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  useEffect(() => {
    refreshPrices(priceTab);
    intervalRef.current = setInterval(() => refreshPrices(priceTab), 60000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [priceTab, refreshPrices]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "farmer") return;
    (async () => {
      setLoadingData(true);
      try {
        const [pRes, oRes] = await Promise.allSettled([
          getFarmerProducts(),
          getFarmerOrders(),
        ]);
        if (pRes.status === "fulfilled" && pRes.value?.success) {
          const d = pRes.value.data?.data || pRes.value.data || [];
          setProducts(Array.isArray(d) ? d : []);
        }
        if (oRes.status === "fulfilled" && oRes.value?.success) {
          const d = oRes.value.data?.data || oRes.value.data || [];
          setOrders(Array.isArray(d) ? d : []);
        }
      } finally {
        setLoadingData(false);
      }
    })();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "farmer") return null;

  const totalProducts = products.length;
  const availableProducts = products.filter(
    (p) => p.status?.toLowerCase() === "available"
  ).length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status?.toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const recentProducts = [...products].slice(0, 5);
  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back,{" "}
            <span className="text-[#1a4731] font-semibold">
              {user?.firstName || user?.username || "Farmer"}
            </span>
            ! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats Row */}
        {loadingData ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Products"
              value={totalProducts}
              icon={Package}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              label="Available Products"
              value={availableProducts}
              icon={CheckCircle}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <StatCard
              label="Total Orders"
              value={totalOrders}
              icon={ShoppingBag}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatCard
              label="Total Revenue"
              value={`Rs ${totalRevenue.toLocaleString()}`}
              icon={TrendingUp}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              sub="Excluding cancelled"
            />
          </div>
        )}

        {/* Live Market Price Board */}
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <div>
              <h2 className="text-white font-bold text-lg">📊 Live Market Reference Prices</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Last updated:{" "}
                <span className="text-emerald-400 font-medium">{lastUpdated}</span>
                <span className="ml-2 text-gray-500">· Auto-refreshes every 60s</span>
              </p>
            </div>
            <button
              onClick={() => refreshPrices(priceTab)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {(["vegetables", "fruits"] as PriceTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setPriceTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                  priceTab === tab
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-gray-800/50"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Price Grid */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {prices.map((item) => (
              <div
                key={item.name}
                className="bg-gray-800 rounded-lg px-3 py-3 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <p className="text-gray-300 text-xs font-medium truncate">{item.name}</p>
                <p className="text-white font-bold text-sm mt-1">
                  Rs {item.current}
                  <span className="text-gray-400 font-normal text-xs">/{item.unit}</span>
                </p>
                <div
                  className={`flex items-center gap-0.5 mt-1 text-xs font-semibold ${
                    item.change >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  <span>{item.change >= 0 ? "▲" : "▼"}</span>
                  <span>{Math.abs(item.change)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Products Quick View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">My Products</h3>
              <a
                href="/farmer-dashboard/products"
                className="text-xs text-[#1a4731] hover:underline font-medium"
              >
                View all →
              </a>
            </div>
            {loadingData ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No products yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-900 truncate max-w-[120px]">
                          {p.name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 capitalize">{p.category}</td>
                        <td className="px-4 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                          Rs {p.price}/{p.unit}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {p.stock ?? p.quantity ?? "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={p.status || "available"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <a
                href="/farmer-dashboard/orders"
                className="text-xs text-[#1a4731] hover:underline font-medium"
              >
                View all →
              </a>
            </div>
            {loadingData ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                          #{o._id?.slice(-8)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                          Rs {(o.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
