"use client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  LogOut,
  Sprout,
} from "lucide-react";

const navLinks = [
  { href: "/farmer-dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/farmer-dashboard/products", label: "My Products", icon: Package, exact: false },
  { href: "/farmer-dashboard/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/farmer-dashboard/profile", label: "Profile", icon: User, exact: false },
];

export default function FarmerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "farmer") {
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading || !isAuthenticated || user?.role !== "farmer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1a4731] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const isActive = (link: typeof navLinks[0]) => {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  };

  const farmerName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || user?.name || "Farmer";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a4731] flex flex-col z-40 shadow-xl">
        {/* Logo Header */}
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Sprout className="w-7 h-7 text-emerald-300" />
            <span className="text-white text-xl font-bold tracking-tight">Krishi Bazar</span>
          </div>
          <p className="text-white/50 text-xs font-medium tracking-widest uppercase pl-9">
            Farmer Portal
          </p>
        </div>

        {/* Farmer Info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
              {user?.profileImage ? (
                <img
                  src={`http://localhost:8088${user.profileImage}`}
                  alt={farmerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{farmerName}</p>
              <span className="inline-block text-xs bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-full px-2 py-0.5 mt-0.5 font-medium capitalize">
                {user?.role || "farmer"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                  active
                    ? "bg-white/20 text-white font-semibold shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-white/60"}`} />
                {link.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-5 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
}
