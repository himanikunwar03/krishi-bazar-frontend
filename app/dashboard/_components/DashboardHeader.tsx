"use client";

import { handleLogout } from "@/lib/actions/auth-action";

export default function DashboardHeader() {
    return (
        <div className="flex items-center gap-4 justify-between">
            <a href="/dashboard" className="text-2xl font-bold uppercase leading-none tracking-tight text-on-dark">
                <h2 className="text-2xl font-bold leading-none tracking-tight text-on-dark">
                    Dashboard
                </h2>
            </a>

            <nav className="flex gap-4" aria-label="Sections">
                <a href="/dashboard/profile" className="text-sm font-medium text-muted hover:text-on-dark">
                    Profile
                </a>
                <a href="/dashboard/password" className="text-sm font-medium text-muted hover:text-on-dark">
                    Password
                </a>
                <button className="text-sm font-medium text-muted hover:text-on-dark" onClick={async () => {
                    await handleLogout();
                }}>
                    Logout
                </button>
            </nav>
        </div>
    );
}