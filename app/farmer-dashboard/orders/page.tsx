"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getFarmerOrders, updateOrderStatus } from "@/lib/api/orders";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Package,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  farmerId?: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  createdAt: string;
}

// ── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-yellow-100 text-yellow-700" },
  confirmed:  { label: "Confirmed",  cls: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", cls: "bg-purple-100 text-purple-700" },
  shipped:    { label: "Shipped",    cls: "bg-orange-100 text-orange-700" },
  delivered:  { label: "Delivered",  cls: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-100 text-red-700" },
};

const STATUS_FLOW: Record<string, string[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

const ALL_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls} capitalize`}>
      {cfg.label}
    </span>
  );
}

// ── Status Update Dropdown ─────────────────────────────────────────────────────
function StatusDropdown({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: string;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const nextStatuses = STATUS_FLOW[currentStatus] || [];

  if (nextStatuses.length === 0) return null;

  const handleSelect = async (status: string) => {
    setOpen(false);
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, { status });
      toast.success(`Order status updated to ${status}`);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={updating}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-60"
      >
        {updating ? (
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
        Update Status
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
          {nextStatuses.map((s) => {
            const cfg = STATUS_CONFIG[s] || { label: s, cls: "" };
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${cfg.cls.replace("text-", "bg-").split(" ")[0]}`} />
                <span className="capitalize font-medium text-gray-700">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Order Row ──────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  currentUserId,
  onUpdated,
}: {
  order: Order;
  currentUserId: string;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const myItems = order.items.filter(
    (item) => !item.farmerId || item.farmerId === currentUserId
  );
  const itemSummary = myItems
    .slice(0, 2)
    .map((i) => `${i.productName} ×${i.quantity}`)
    .join(", ");
  const moreCount = myItems.length > 2 ? myItems.length - 2 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Main Row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Order ID + Date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              #{order._id.slice(-10)}
            </span>
            <StatusBadge status={order.status} />
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                order.paymentStatus === "paid"
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            ·{" "}
            <span className="text-gray-500 capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            Customer: <span className="font-mono text-gray-400">{order.userId?.slice(-12) || "—"}</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {itemSummary}
            {moreCount > 0 && (
              <span className="text-[#1a4731] font-medium"> +{moreCount} more</span>
            )}
          </p>
        </div>

        {/* Amount + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold text-gray-900">Rs {order.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{myItems.length} item{myItems.length !== 1 ? "s" : ""}</p>
          </div>
          <StatusDropdown
            orderId={order._id}
            currentStatus={order.status}
            onUpdated={onUpdated}
          />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Items */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Order Items
            </h4>
            <div className="space-y-3">
              {myItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={`http://localhost:8088${item.productImage}`}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                        <Package className="w-5 h-5 text-emerald-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × Rs {item.price}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Shipping Address
              </h4>
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>
                  {[
                    order.shippingAddress.street,
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              {order.shippingAddress.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function FarmerOrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getFarmerOrders();
      if (res?.success) {
        const d = res.data?.data || res.data || [];
        setOrders(Array.isArray(d) ? d : []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "farmer") fetchOrders();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "farmer") return null;

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  // Count per status for tab badges
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage and update status for your product orders
          </p>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1.5 flex flex-wrap gap-1 mb-6">
          {ALL_STATUSES.map((s) => {
            const isActive = statusFilter === s;
            const count = s === "all" ? orders.length : (counts[s] || 0);
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  isActive
                    ? "bg-[#1a4731] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {s === "all" ? "All" : (STATUS_CONFIG[s]?.label || s)}
                {count > 0 && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter !== "all"
                ? `No ${statusFilter} orders at this time`
                : "Orders for your products will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                currentUserId={user?._id || user?.id || ""}
                onUpdated={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
