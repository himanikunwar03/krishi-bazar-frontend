"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-action";
import { Home, Settings, User as UserIcon, Lock, LogOut } from "lucide-react";
import Image from "next/image";

export default function DashboardSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const name = user?.firstName || user?.username || user?.name || user?.email || "User";

  const getProfileImageUrl = (profileImage: string | undefined) => {
    if (!profileImage) return '';
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
    return `${BASE_URL}${profileImage}`;
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    ...(user?.role === "admin" ? [{ href: "/dashboard/admin", label: "Admin", icon: Settings }] : []),
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
    { href: "/dashboard/password", label: "Password", icon: Lock },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-[#1a4731] text-white lg:block hidden">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-white/10 p-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            Krishi Bazar
          </h1>
        </div>

        {/* User Info */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            {user?.profileImage || user?.imageUrl ? (
              <Image
                src={getProfileImageUrl(user?.profileImage || user?.imageUrl)}
                alt={name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-white/70 overflow-hidden text-ellipsis whitespace-nowrap">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={async () => {
              await handleLogout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
