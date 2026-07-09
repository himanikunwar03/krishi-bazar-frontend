"use client";

import { handleLogout } from "@/lib/actions/auth-action";

export default function DashboardHeader({ title }: { title?: string }) {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
                {title || "Dashboard"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Welcome back! Here's what's happening with your account.
            </p>
        </div>
    );
}