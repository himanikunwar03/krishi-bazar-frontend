import { handleUserDetails } from "@/lib/actions/auth-action";
import { getUserData } from "@/lib/cookies";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Redirect if user is not admin
  if (user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#f0ede8]">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#1a4731]">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <a
                href="/dashboard"
                className="text-sm text-[#1a4731] hover:underline"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
