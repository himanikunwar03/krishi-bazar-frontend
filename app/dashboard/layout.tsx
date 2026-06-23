import { handleUserDetails } from "@/lib/actions/auth-action";
import { getUserData } from "@/lib/cookies";
import DashboardSidebar from "./_components/DashboardSidebar";

export default async function DashboardLayout({
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

  return (
    <div className="min-h-screen bg-[#f0ede8]">
      <DashboardSidebar user={user} />
      <main className="lg:ml-64">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
