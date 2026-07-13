"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getMyOrders, cancelOrder } from "@/lib/api/orders";
import {
  Package,
  MapPin,
  Phone,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

const API_IMG_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

interface OrderItem {
  productId?: string;
  productName?: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    phone?: string;
  };
  paymentMethod: string;
  createdAt: string;
}

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  icon: React.ElementType;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: RefreshCw,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
  },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  esewa: "eSewa",
  khalti: "Khalti",
};

function OrderCard({
  order,
  onCancel,
}: {
  order: Order;
  onCancel: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const statusCfg: StatusConfig = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: Package,
  };
  const StatusIcon = statusCfg.icon;
  const canCancel = ["pending", "confirmed"].includes(order.status);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await onCancel(order._id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}
          >
            <StatusIcon className={`w-5 h-5 ${statusCfg.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-sm">
                Order #{order._id.slice(-10)}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusCfg.label}
              </span>
              {order.paymentStatus && (
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-50 text-green-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-lg font-bold text-[#1a4731]">
            Rs {order.totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          {order.items.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5"
            >
              {item.productImage ? (
                <img
                  src={`${API_IMG_BASE}${item.productImage}`}
                  alt={item.productName}
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <Package className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-600 max-w-[100px] truncate">
                {item.productName ?? "Product"}
              </span>
              <span className="text-xs text-gray-400">x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <span className="text-xs text-gray-400">
              +{order.items.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-center gap-1 py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-50 mt-3"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" /> Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" /> View Details
          </>
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* All items */}
          <div className="p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={`${API_IMG_BASE}${item.productImage}`}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                        <Package className="w-6 h-6 text-green-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productName ?? "Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x Rs {item.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total row */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>Rs {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="mx-4 mb-4 px-4 py-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Shipping Address
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}
                  {order.shippingAddress.zipCode &&
                  order.shippingAddress.zipCode !== "00000"
                    ? ` - ${order.shippingAddress.zipCode}`
                    : ""}
                </p>
              </div>
              {order.shippingAddress.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p>{order.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancel action */}
          {canCancel && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? (
                  <span className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full inline-block" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserOrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_LIMIT = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard/orders");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async (p = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      const response = await getMyOrders({ page: p, limit: PAGE_LIMIT });
      if (response.success) {
        const incoming: Order[] = response.data.data;
        setOrders((prev) => (append ? [...prev, ...incoming] : incoming));
        setHasMore(incoming.length === PAGE_LIMIT);
        setPage(p);
      }
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-[#1a4731] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track and manage your orders
          </p>
        </div>
        <button
          onClick={() => router.push("/marketplace")}
          className="flex items-center gap-2 bg-[#1a4731] hover:bg-[#1a5c3f] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop More
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            You haven&apos;t placed any orders yet. Start shopping to see your
            orders here.
          </p>
          <button
            onClick={() => router.push("/marketplace")}
            className="flex items-center gap-2 bg-[#1a4731] hover:bg-[#1a5c3f] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </p>

          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchOrders(page + 1, true)}
                disabled={loadingMore}
                className="flex items-center gap-2 border border-[#1a4731] text-[#1a4731] hover:bg-[#1a4731]/5 px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-[#1a4731] border-t-transparent rounded-full inline-block" />
                    Loading...
                  </>
                ) : (
                  "Load More Orders"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
