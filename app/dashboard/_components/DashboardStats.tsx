"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <p
              className={`mt-2 text-sm ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a4731]/10 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const stats = [
    {
      title: "Total Orders",
      value: "24",
      icon: "📦",
      description: "Orders this month",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Revenue",
      value: "$4,231",
      icon: "💰",
      description: "Total earnings",
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Products",
      value: "156",
      icon: "🌾",
      description: "Active listings",
      trend: { value: 5, isPositive: false },
    },
    {
      title: "Customers",
      value: "89",
      icon: "👥",
      description: "Registered users",
      trend: { value: 15, isPositive: true },
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
