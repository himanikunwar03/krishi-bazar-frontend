"use client";

import { useState, useEffect } from "react";
import { getMyOrders } from "@/lib/api/orders";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  ChevronRight,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: { productName?: string; quantity: number; price: number }[];
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
  confirmed: { label: "Confirmed", bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
  processing: { label: "Processing", bg: "bg-purple-100", text: "text-purple-700", icon: Package },
  shipped: { label: "Shipped", bg: "bg-indigo-100", text: "text-indigo-700", icon: Truck },
  delivered: { label: "Delivered", bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  esewa: "eSewa",
  khalti: "Khalti",
};

export default function OrdersSummary() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders({ page: 1, limit: 20 });
        if (res.success) setOrders(res.data.data);
      } catch {
        // silently fail — non-critical widget
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const total = orders.length;
  const pending = orders.filter((o) =>
    ["pending", "confirmed", "processing"].includes(o.status)
  ).length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;

  const recentOrders = orders.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Stat skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        {/* Recent order skeletons */}
        <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: total,
            icon: Package,
            color: "text-[#1a4731]",
            bg: "bg-[#1a4731]/10",
          },
          {
            label: "In Progress",
            value: pending,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Delivered",
            value: delivered,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Cancelled",
            value: cancelled,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <div
                  className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/dashboard/orders"
            className="text-sm text-[#1a4731] hover:text-[#22c55e] font-medium flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No orders yet</p>
            <Link
              href="/marketplace"
              className="mt-3 text-sm text-[#1a4731] font-medium hover:underline"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? {
                label: order.status,
                bg: "bg-gray-100",
                text: "text-gray-600",
                icon: Package,
              };
              const CfgIcon = cfg.icon;
              const firstItem = order.items[0];
              return (
                <div
                  key={order._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <CfgIcon className={`w-5 h-5 ${cfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {firstItem?.productName ?? "Order"}{" "}
                      {order.items.length > 1 && (
                        <span className="text-gray-400 font-normal">
                          +{order.items.length - 1} more
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1a4731]">
                      Rs {order.totalAmount.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
