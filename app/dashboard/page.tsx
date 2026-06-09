import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eeeeee] p-6 text-center">
      <h1 className="text-3xl font-bold text-[#1a4731]">Krishi Bazar</h1>
      <p className="mt-2 text-gray-600">Welcome to your dashboard.</p>
      <Link
        href="/login"
        className="mt-6 rounded-full bg-[#1a4731] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Log out
      </Link>
    </div>
  );
}
