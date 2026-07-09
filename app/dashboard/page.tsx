import { handleUserDetails } from "@/lib/actions/auth-action";
import { getUserData } from "@/lib/cookies";
import DashboardHeader from "./_components/DashboardHeader";
import UserProfileCard from "./_components/UserProfileCard";
import OrdersSummary from "./_components/OrdersSummary";
import { User, Lock, Package, ShoppingBag } from "lucide-react";

export default async function DashboardPage() {
    // Try to fetch user details from whoami API
    let user = null;
    try {
        const userDetails = await handleUserDetails();
        if (userDetails.success) {
            user = userDetails.data;
        }
    } catch (error) {
        console.error("Failed to fetch user details from whoami API:", error);
    }

    // Fall back to cookie data if API call fails
    if (!user) {
        user = await getUserData();
    }

    const name = user?.firstName || user?.username || user?.name || user?.email || "User";

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1a4731] to-[#1a5c3f] p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-green-300 text-sm font-medium mb-1">Welcome back,</p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold">{name} 👋</h1>
                        <p className="text-white/70 text-sm mt-1">
                            Here&apos;s a summary of your shopping activity.
                        </p>
                    </div>
                    <a
                        href="/marketplace"
                        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/20"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Browse Marketplace
                    </a>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* User Profile Card */}
                <div className="lg:col-span-1">
                    <UserProfileCard user={user} />
                </div>

                {/* Order stats + recent orders (client component) */}
                <div className="lg:col-span-2">
                    <OrdersSummary />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                        href="/marketplace"
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#1a4731] hover:bg-[#1a4731]/5 hover:shadow-sm"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a4731]/10 text-[#1a4731] flex-shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Browse Products</p>
                            <p className="text-xs text-gray-500">Shop fresh produce</p>
                        </div>
                    </a>

                    <a
                        href="/dashboard/orders"
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#1a4731] hover:bg-[#1a4731]/5 hover:shadow-sm"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a4731]/10 text-[#1a4731] flex-shrink-0">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">View All Orders</p>
                            <p className="text-xs text-gray-500">Track your purchases</p>
                        </div>
                    </a>

                    <a
                        href="/dashboard/profile"
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#1a4731] hover:bg-[#1a4731]/5 hover:shadow-sm"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a4731]/10 text-[#1a4731] flex-shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Edit Profile</p>
                            <p className="text-xs text-gray-500">Update your information</p>
                        </div>
                    </a>

                    <a
                        href="/dashboard/password"
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-[#1a4731] hover:bg-[#1a4731]/5 hover:shadow-sm"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a4731]/10 text-[#1a4731] flex-shrink-0">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Change Password</p>
                            <p className="text-xs text-gray-500">Keep your account secure</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
