"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getProductById } from "@/lib/api/products";
import { createOrder } from "@/lib/api/orders";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  ChevronRight,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";

const CART_KEY = "krishi_cart";
const API_IMG_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";
const DELIVERY_FEE = 100;
const FREE_DELIVERY_THRESHOLD = 2000;

type CartMap = { [productId: string]: number };

interface ProductData {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  unit: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: ProductData;
}

interface DeliveryForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  landmark: string;
}

type PaymentMethod = "esewa" | "khalti" | "cod";
type Step = 1 | 2 | 3 | 4;

const NEPAL_CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Biratnagar",
  "Birgunj",
  "Dharan",
  "Butwal",
  "Hetauda",
  "Nepalgunj",
  "Bharatpur",
  "Janakpur",
];

const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

function readCart(): CartMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCart(cart: CartMap) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Vegetables: "from-green-400 to-emerald-500",
  Fruits: "from-orange-400 to-amber-500",
  Grains: "from-yellow-500 to-amber-600",
  Dairy: "from-blue-200 to-sky-300",
  "Organic Certified": "from-lime-400 to-green-500",
  Other: "from-purple-400 to-violet-500",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Vegetables: "🥕",
  Fruits: "🍎",
  Grains: "🌾",
  Dairy: "🥛",
  "Organic Certified": "✅",
  Other: "🌿",
};

const STEP_LABELS = ["Cart", "Delivery", "Payment", "Confirmation"];

export default function CartPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [cartMap, setCartMap] = useState<CartMap>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [delivery, setDelivery] = useState<DeliveryForm>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    province: "",
    landmark: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payId, setPayId] = useState("");
  const [payMpin, setPayMpin] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/cart");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load cart from localStorage
  useEffect(() => {
    const map = readCart();
    setCartMap(map);
  }, []);

  // Fetch product details for cart items
  const loadCartProducts = useCallback(async (map: CartMap) => {
    if (Object.keys(map).length === 0) {
      setCartItems([]);
      setLoadingProducts(false);
      return;
    }
    setLoadingProducts(true);
    const items: CartItem[] = [];
    await Promise.all(
      Object.entries(map).map(async ([productId, quantity]) => {
        try {
          const res = await getProductById(productId);
          if (res.success) {
            items.push({ productId, quantity, product: res.data });
          }
        } catch {
          // silently skip missing products
        }
      })
    );
    setCartItems(items);
    setLoadingProducts(false);
  }, []);

  useEffect(() => {
    loadCartProducts(cartMap);
  }, [cartMap, loadCartProducts]);

  // ── Cart helpers ──
  const updateQty = (productId: string, delta: number) => {
    const item = cartItems.find((i) => i.productId === productId);
    const max = item?.product.stock ?? Infinity;
    const current = cartMap[productId] || 0;
    const next = current + delta;
    if (next <= 0) {
      const newMap = { ...cartMap };
      delete newMap[productId];
      writeCart(newMap);
      setCartMap(newMap);
      toast.info("Item removed from cart");
    } else if (next > max) {
      toast.warn(`Only ${max} ${item?.product.unit ?? "units"} available`);
    } else {
      const newMap = { ...cartMap, [productId]: next };
      writeCart(newMap);
      setCartMap(newMap);
    }
  };

  const removeItem = (productId: string) => {
    const newMap = { ...cartMap };
    delete newMap[productId];
    writeCart(newMap);
    setCartMap(newMap);
    toast.success("Item removed from cart");
  };

  // ── Pricing ──
  const subtotal = cartItems.reduce(
    (s, item) => s + item.product.price * item.quantity,
    0
  );
  const delivery_charge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery_charge;

  // ── Delivery validation ──
  const deliveryValid =
    delivery.fullName.trim() &&
    delivery.phone.trim() &&
    delivery.street.trim() &&
    delivery.city.trim() &&
    delivery.province.trim();

  // ── Payment simulation ──
  const simulatePay = async () => {
    if (!payId.trim() || !payMpin.trim()) {
      toast.error("Please fill in your payment credentials");
      return;
    }
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1500)); // simulate network
    const token =
      paymentMethod === "esewa"
        ? `ESEWA-SIM-${Date.now()}`
        : `KHALTI-SIM-${Date.now()}`;
    setPaymentToken(token);
    setShowPayModal(false);
    setPayId("");
    setPayMpin("");
    setPaying(false);
    toast.success(`${paymentMethod === "esewa" ? "eSewa" : "Khalti"} payment simulated successfully!`);
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    if (!paymentMethod) return;
    setPlacingOrder(true);
    try {
      const res = await createOrder({
        items: cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          street: delivery.street,
          city: delivery.city,
          state: delivery.province,
          zipCode: "00000",
          phone: delivery.phone,
        },
        paymentMethod,
        ...(paymentToken ? { paymentToken } : {}),
      });

      if (res.success) {
        setConfirmedOrder(res.data);
        // Clear cart
        writeCart({});
        setCartMap({});
        setStep(4);
        toast.success("Order placed successfully!");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-[#1a4731] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── NAVBAR ── */}
      <nav className="bg-[#1a4731] shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => (step > 1 && step < 4 ? setStep((s) => (s - 1) as Step) : router.push("/marketplace"))}
            className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">
              {step === 1 ? "Continue Shopping" : step === 4 ? "Back to Marketplace" : "Back"}
            </span>
          </button>
          <span className="text-white font-bold text-lg">🌾 Krishi Bazar</span>
          <button
            onClick={() => router.push("/marketplace")}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Marketplace
          </button>
        </div>
      </nav>

      {/* ── STEPPER ── */}
      {step < 4 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-0">
              {STEP_LABELS.map((label, idx) => {
                const stepNum = idx + 1;
                const isDone = step > stepNum;
                const isActive = step === stepNum;
                return (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isDone
                            ? "bg-[#22c55e] text-white"
                            : isActive
                            ? "bg-[#1a4731] text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isDone ? <CheckCircle className="w-5 h-5" /> : stepNum}
                      </div>
                      <span
                        className={`text-xs mt-1 font-medium ${
                          isActive ? "text-[#1a4731]" : isDone ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < STEP_LABELS.length - 1 && (
                      <div
                        className={`w-12 sm:w-20 h-0.5 mb-4 transition-colors ${
                          step > stepNum ? "bg-[#22c55e]" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ══════════════════════════════════════
            STEP 1 — CART REVIEW
        ══════════════════════════════════════ */}
        {step === 1 && (
          <>
            {loadingProducts ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-[#1a4731] border-t-transparent rounded-full" />
                <p className="text-gray-500">Loading your cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <button
                  onClick={() => router.push("/marketplace")}
                  className="bg-[#1a4731] hover:bg-[#1a5c3f] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Cart ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                  </h2>
                  {cartItems.map((item) => {
                    const gradient = CATEGORY_GRADIENTS[item.product.category] ?? "from-gray-300 to-gray-400";
                    return (
                      <div
                        key={item.productId}
                        className="bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          {item.product.image ? (
                            <img
                              src={`${API_IMG_BASE}${item.product.image}`}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                              <span className="text-2xl">{CATEGORY_EMOJIS[item.product.category] ?? "🌿"}</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                          <p className="text-xs text-gray-400">{item.product.category}</p>
                          <p className="text-[#1a4731] font-bold mt-1">
                            Rs {item.product.price} / {item.product.unit}
                          </p>
                        </div>

                        {/* Quantity + total */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(item.productId, -1)}
                              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.productId, 1)}
                              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            Rs {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>Rs {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery</span>
                        {delivery_charge === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          <span>Rs {delivery_charge}</span>
                        )}
                      </div>
                      {delivery_charge > 0 && (
                        <p className="text-xs text-green-600">
                          Add Rs {(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()} more for free delivery
                        </p>
                      )}
                      <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
                        <span>Total</span>
                        <span>Rs {total.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-[#1a4731] hover:bg-[#22c55e] text-white py-3 rounded-xl font-semibold transition-colors"
                    >
                      Proceed to Delivery
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — DELIVERY DETAILS
        ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#1a4731]" />
              Delivery Details
            </h2>
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={delivery.fullName}
                    onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={delivery.phone}
                    onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731] bg-white"
                  >
                    <option value="">Select city</option>
                    {NEPAL_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={delivery.street}
                    onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                    placeholder="Street, house number, locality"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={delivery.district}
                    onChange={(e) => setDelivery({ ...delivery, district: e.target.value })}
                    placeholder="e.g. Kathmandu"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={delivery.province}
                    onChange={(e) => setDelivery({ ...delivery, province: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731] bg-white"
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={delivery.landmark}
                    onChange={(e) => setDelivery({ ...delivery, landmark: e.target.value })}
                    placeholder="Near school, temple, etc."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  onClick={() => {
                    if (!deliveryValid) {
                      toast.error("Please fill in all required fields");
                      return;
                    }
                    setStep(3);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
                    deliveryValid
                      ? "bg-[#1a4731] hover:bg-[#22c55e] text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 3 — PAYMENT SELECTION
        ══════════════════════════════════════ */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#1a4731]" />
              Payment Method
            </h2>

            <div className="space-y-4 mb-6">
              {/* eSewa */}
              <label
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "esewa"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={paymentMethod === "esewa"}
                  onChange={() => { setPaymentMethod("esewa"); setPaymentToken(null); }}
                />
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  e
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">eSewa</p>
                  <p className="text-sm text-gray-500">Pay with eSewa — Fast &amp; Secure</p>
                  <p className="text-xs text-gray-400 mt-0.5">Merchant ID: MERCHANT_ESEWA</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === "esewa" ? "border-green-500" : "border-gray-300"
                }`}>
                  {paymentMethod === "esewa" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </div>
              </label>

              {/* Khalti */}
              <label
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "khalti"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={paymentMethod === "khalti"}
                  onChange={() => { setPaymentMethod("khalti"); setPaymentToken(null); }}
                />
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  K
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Khalti</p>
                  <p className="text-sm text-gray-500">Pay with Khalti — Digital Wallet</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === "khalti" ? "border-purple-500" : "border-gray-300"
                }`}>
                  {paymentMethod === "khalti" && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={paymentMethod === "cod"}
                  onChange={() => { setPaymentMethod("cod"); setPaymentToken(null); }}
                />
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when delivered to your door</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === "cod" ? "border-amber-500" : "border-gray-300"
                }`}>
                  {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                </div>
              </label>
            </div>

            {/* COD note */}
            {paymentMethod === "cod" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
                <Truck className="w-4 h-4 inline mr-2" />
                You will pay <strong>Rs {total.toLocaleString()}</strong> when the order is delivered.
              </div>
            )}

            {/* eSewa / Khalti: pay now button (opens modal) */}
            {(paymentMethod === "esewa" || paymentMethod === "khalti") && !paymentToken && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800">
                Click <strong>"Pay Now"</strong> to simulate your{" "}
                {paymentMethod === "esewa" ? "eSewa" : "Khalti"} payment before placing the order.
              </div>
            )}

            {paymentToken && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Payment simulated! Token: <code className="font-mono text-xs">{paymentToken}</code>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>

              {(paymentMethod === "esewa" || paymentMethod === "khalti") && !paymentToken ? (
                <button
                  onClick={() => setShowPayModal(true)}
                  disabled={!paymentMethod}
                  className="flex-1 bg-[#1a4731] hover:bg-[#22c55e] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  Pay Now — Rs {total.toLocaleString()}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={!paymentMethod || placingOrder}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1a4731] hover:bg-[#22c55e] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Placing Order...
                    </>
                  ) : (
                    <>Place Order</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 4 — ORDER CONFIRMATION
        ══════════════════════════════════════ */}
        {step === 4 && confirmedOrder && (
          <div className="max-w-lg mx-auto text-center py-8">
            {/* Success animation */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-6">
              Thank you for your order. We'll deliver it fresh to your doorstep!
            </p>

            <div className="bg-white rounded-2xl shadow-sm p-6 text-left mb-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-mono text-sm font-semibold text-gray-800">
                  #{confirmedOrder._id?.slice(-10) ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Payment</span>
                <span className="text-sm font-medium text-gray-800 capitalize">
                  {confirmedOrder.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : confirmedOrder.paymentMethod === "esewa"
                    ? "eSewa"
                    : "Khalti"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-[#1a4731]">
                  Rs {confirmedOrder.totalAmount?.toLocaleString() ?? total.toLocaleString()}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>
                  {delivery.street}, {delivery.city}, {delivery.province}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/marketplace")}
                className="flex-1 flex items-center justify-center gap-2 border border-[#1a4731] text-[#1a4731] hover:bg-[#1a4731]/5 py-3 rounded-xl font-semibold transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </button>
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a4731] hover:bg-[#22c55e] text-white py-3 rounded-xl font-semibold transition-colors"
              >
                <Package className="w-4 h-4" />
                View My Orders
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          PAYMENT SIMULATION MODAL
      ══════════════════════════════════════ */}
      {showPayModal && paymentMethod && paymentMethod !== "cod" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Modal header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                  paymentMethod === "esewa" ? "bg-green-500" : "bg-purple-600"
                }`}
              >
                {paymentMethod === "esewa" ? "e" : "K"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {paymentMethod === "esewa" ? "eSewa" : "Khalti"} Test Payment
                </h3>
                <p className="text-sm text-gray-500">Simulation mode</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center">
              <p className="text-sm text-gray-500">Amount to Pay</p>
              <p className="text-2xl font-extrabold text-[#1a4731]">Rs {total.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {paymentMethod === "esewa" ? "eSewa ID" : "Khalti ID"}
                </label>
                <input
                  type="text"
                  value={payId}
                  onChange={(e) => setPayId(e.target.value)}
                  placeholder={paymentMethod === "esewa" ? "9800000000" : "9800000000"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MPIN</label>
                <input
                  type="password"
                  value={payMpin}
                  onChange={(e) => setPayMpin(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowPayModal(false); setPayId(""); setPayMpin(""); }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={simulatePay}
                disabled={paying}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${
                  paymentMethod === "esewa"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-purple-600 hover:bg-purple-700"
                } disabled:opacity-60`}
              >
                {paying ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
