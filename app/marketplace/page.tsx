"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getAllProducts,
  searchProducts,
  getProductsByCategory,
} from "@/lib/api/products";
import {
  Search,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Tractor,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  unit: string;
  status: string;
  rating: number;
  ratingCount: number;
  farmerId?: string;
}

type CartMap = { [productId: string]: number };

const CART_KEY = "krishi_cart";
const API_IMG_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

const CATEGORIES = [
  { label: "All", emoji: "" },
  { label: "Vegetables", emoji: "🥕" },
  { label: "Fruits", emoji: "🍎" },
  { label: "Grains", emoji: "🌾" },
  { label: "Dairy", emoji: "🥛" },
  { label: "Organic Certified", emoji: "✅" },
  { label: "Other", emoji: "🌿" },
];

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

function cartTotal(cart: CartMap) {
  return Object.values(cart).reduce((s, v) => s + v, 0);
}

function isOutOfStock(product: Product) {
  return product.stock === 0 || product.status === "out_of_stock";
}

export default function MarketplacePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartMap>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const PAGE_LIMIT = 20;

  // Load cart from localStorage on mount and listen for cross-tab changes
  useEffect(() => {
    setCart(readCart());
    const onStorage = () => setCart(readCart());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchProducts = useCallback(
    async (p = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);
        const response = await getAllProducts({ page: p, limit: PAGE_LIMIT });
        if (response.success) {
          const incoming: Product[] = response.data.data;
          setProducts((prev) => (append ? [...prev, ...incoming] : incoming));
          setHasMore(incoming.length === PAGE_LIMIT);
          setPage(p);
        }
      } catch {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!searchQuery.trim()) {
        if (selectedCategory === "All") {
          fetchProducts(1, false);
        } else {
          handleCategoryFilter(selectedCategory);
        }
        return;
      }
      try {
        setLoading(true);
        const response = await searchProducts(searchQuery);
        if (response.success) {
          setProducts(response.data);
          setHasMore(false);
        }
      } catch {
        toast.error("Search failed");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    if (category === "All") {
      fetchProducts(1, false);
      return;
    }
    try {
      setLoading(true);
      const response = await getProductsByCategory(category);
      if (response.success) {
        setProducts(response.data);
        setHasMore(false);
      }
    } catch {
      toast.error("Failed to filter by category");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchProducts(page + 1, true);
  };

  const addToCart = (product: Product) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/marketplace");
      return;
    }
    if (isOutOfStock(product)) return;
    const current = readCart();
    const qty = (current[product._id] || 0) + 1;
    if (qty > product.stock) {
      toast.warn(`Only ${product.stock} ${product.unit} available`);
      return;
    }
    current[product._id] = qty;
    writeCart(current);
    setCart({ ...current });
    toast.success(`${product.name} added to cart!`);
  };

  const changeCartQty = (product: Product, delta: number) => {
    const current = readCart();
    const newQty = (current[product._id] || 0) + delta;
    if (newQty <= 0) {
      delete current[product._id];
      toast.info(`${product.name} removed from cart`);
    } else if (newQty > product.stock) {
      toast.warn(`Only ${product.stock} ${product.unit} available`);
      return;
    } else {
      current[product._id] = newQty;
    }
    writeCart(current);
    setCart({ ...current });
  };

  const cartCount = cartTotal(cart);
  const isFarmer = user?.role === "farmer";
  const displayName = user?.firstName || user?.username || user?.name || user?.email || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── NAVBAR ── */}
      <nav className="bg-[#1a4731] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-white font-bold text-xl whitespace-nowrap flex-shrink-0"
            >
              <span>🌾</span>
              <span className="hidden sm:inline">Krishi Bazar</span>
            </button>

            {/* Search (desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vegetables, fruits, grains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {isFarmer ? (
                    <button
                      onClick={() => router.push("/farmer-dashboard")}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Tractor className="w-4 h-4" />
                      <span className="hidden sm:inline">Farmer Portal</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/cart")}
                      className="relative flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="hidden sm:inline">Cart</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Profile dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen((o) => !o)}
                      className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { router.push("/dashboard"); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => { router.push("/dashboard/orders"); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </button>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 bg-white text-[#1a4731] hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-[#1a4731] via-[#1a5c3f] to-[#22c55e] text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Fresh from the Farm<br />
              <span className="text-green-300">to Your Table</span>
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Discover the finest locally-grown produce from Nepal's dedicated farmers.
              Fresh, natural, and delivered right to your doorstep.
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { value: "500+", label: "Products" },
                { value: "100+", label: "Farmers" },
                { value: "24hr", label: "Delivery" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-green-300">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryFilter(cat.label)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.label
                    ? "bg-[#1a4731] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat.emoji && <span>{cat.emoji}</span>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCTS SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === "All" ? "All Products" : `${CATEGORY_EMOJIS[selectedCategory] ?? ""} ${selectedCategory}`}
          </h2>
          {!loading && (
            <span className="text-sm text-gray-500">{products.length} items</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try a different search or category</p>
            <button
              onClick={() => { setSearchQuery(""); handleCategoryFilter("All"); }}
              className="bg-[#1a4731] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1a5c3f] transition-colors"
            >
              View All Products
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => {
                const oos = isOutOfStock(product);
                const qtyInCart = cart[product._id] || 0;
                const gradient = CATEGORY_GRADIENTS[product.category] ?? "from-gray-300 to-gray-400";

                return (
                  <div
                    key={product._id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col ${oos ? "opacity-70" : ""}`}
                  >
                    {/* Image area */}
                    <div className="relative h-48 overflow-hidden">
                      {product.image ? (
                        <img
                          src={`${API_IMG_BASE}${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <span className="text-4xl">{CATEGORY_EMOJIS[product.category] ?? "🌿"}</span>
                        </div>
                      )}

                      {/* Category badge */}
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                        {CATEGORY_EMOJIS[product.category] ?? ""} {product.category}
                      </span>

                      {/* Out of stock overlay */}
                      {oos && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.farmerId && (
                        <p className="text-xs text-gray-400 mb-2 truncate">
                          By Farmer · {product.farmerId.slice(-6)}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-base font-bold text-[#1a4731]">
                          Rs {product.price}
                        </span>
                        <span className="text-xs text-gray-500">/ {product.unit}</span>
                      </div>

                      {/* Stock info */}
                      {!oos && (
                        <p className="text-xs text-gray-400 mb-3">
                          {product.stock} {product.unit} remaining
                        </p>
                      )}

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {product.rating.toFixed(1)} ({product.ratingCount})
                        </span>
                      </div>

                      {/* Cart controls */}
                      <div className="mt-auto">
                        {isFarmer ? null : oos ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                          >
                            Out of Stock
                          </button>
                        ) : qtyInCart > 0 ? (
                          <div className="flex items-center justify-between bg-[#1a4731] rounded-xl overflow-hidden">
                            <button
                              onClick={() => changeCartQty(product, -1)}
                              className="flex items-center justify-center w-10 h-9 text-white hover:bg-white/10 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white text-sm font-semibold">
                              In Cart ({qtyInCart})
                            </span>
                            <button
                              onClick={() => changeCartQty(product, 1)}
                              className="flex items-center justify-center w-10 h-9 text-white hover:bg-white/10 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full py-2 rounded-xl text-sm font-semibold bg-[#1a4731] text-white hover:bg-[#22c55e] transition-colors"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && !searchQuery && selectedCategory === "All" && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 bg-[#1a4731] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1a5c3f] transition-colors disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
