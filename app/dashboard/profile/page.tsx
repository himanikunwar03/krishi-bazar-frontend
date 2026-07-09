import UpdateForm from "../_components/UpdateForm";
import { handleUserDetails } from "@/lib/actions/auth-action";
import { getUserData } from "@/lib/cookies";
import DashboardHeader from "../_components/DashboardHeader";

export default async function Page() {
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
        console.log("Falling back to cookie data");
        user = await getUserData();
    }
    
    return (
        <div className="space-y-6">
            <DashboardHeader title="Profile" />
            <div className="flex justify-center">
                <UpdateForm user={user} />
            </div>
        </div>
    );
}