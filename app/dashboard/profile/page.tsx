import UpdateForm from "../_components/UpdateForm";
import { handleUserDetails } from "@/lib/actions/auth-action";
import { redirect } from "next/navigation";

export default async function Page() {
    const userDetails = await handleUserDetails();
    if(!userDetails.success){
        throw new Error(userDetails.message || 'Failed to fetch user details');
    }
    return (
        <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center px-4 py-12">
            <UpdateForm user={userDetails.data} />
        </div>
    );
}