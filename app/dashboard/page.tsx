import { handleUserDetails } from "@/lib/actions/auth-action";
import { getUserData } from "@/lib/cookies";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardStats from "./_components/DashboardStats";
import UserProfileCard from "./_components/UserProfileCard";

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

    return (
        <div className="space-y-6">
            <DashboardHeader title="Dashboard" />
            
            <div className="grid gap-6 lg:grid-cols-3">
                {/* User Profile Card */}
                <div className="lg:col-span-1">
                    <UserProfileCard user={user} />
                </div>

                {/* Dashboard Stats */}
                <div className="lg:col-span-2">
                    <DashboardStats />
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                            ✓
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Account created successfully</p>
                            <p className="text-xs text-gray-500">Just now</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            👤
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Profile updated</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <a
                        href="/dashboard/profile"
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#1a4731] hover:bg-[#1a4731]/5"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a4731]/10 text-[#1a4731]">
                            👤
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Edit Profile</p>
                            <p className="text-xs text-gray-500">Update your information</p>
                        </div>
                    </a>
                    <a
                        href="/dashboard/password"
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#1a4731] hover:bg-[#1a4731]/5"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a4731]/10 text-[#1a4731]">
                            🔒
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Change Password</p>
                            <p className="text-xs text-gray-500">Update your password</p>
                        </div>
                    </a>
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#1a4731] hover:bg-[#1a4731]/5 opacity-50 cursor-not-allowed">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            📦
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">View Orders</p>
                            <p className="text-xs text-gray-500">Coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
