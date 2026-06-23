"use client";

import Image from "next/image";

export default function UserProfileCard({ user }: { user: any }) {
  const name = user?.firstName || user?.username || user?.name || user?.email || "User";
  const initial = name.charAt(0).toUpperCase();

  const getProfileImageUrl = (profileImage: string | undefined) => {
    if (!profileImage) return '';
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
    return `${BASE_URL}${profileImage}`;
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        {user?.profileImage || user?.imageUrl ? (
          <Image
            src={getProfileImageUrl(user?.profileImage || user?.imageUrl)}
            alt="Profile"
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a4731] text-2xl font-bold text-white">
            {initial}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#1a4731]/10 px-2.5 py-0.5 text-xs font-medium text-[#1a4731]">
              {user?.role || "User"}
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{user?.username || "-"}</p>
          <p className="text-xs text-gray-500">Username</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{user?.firstName || "-"}</p>
          <p className="text-xs text-gray-500">First Name</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{user?.lastName || "-"}</p>
          <p className="text-xs text-gray-500">Last Name</p>
        </div>
      </div>
      <div className="mt-4">
        <a
          href="/dashboard/profile"
          className="flex w-full items-center justify-center rounded-lg bg-[#1a4731] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a4731]/90"
        >
          Edit Profile
        </a>
      </div>
    </div>
  );
}
