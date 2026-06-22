import UpdateForm from "../_components/UpdateForm";
import { handleUserDetails } from "@/lib/actions/auth-action";
export default async function Page() {
    const userDetails = await handleUserDetails();
    if(!userDetails.success){
        throw new Error(userDetails.message || 'Failed to fetch user details');
    }
    return (
        <div>
            Update Profile Page
            <UpdateForm user={userDetails.data} />
        </div>
    );
}