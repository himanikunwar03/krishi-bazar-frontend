import Link from "next/link";
import UpdatePasswordForm from "../_components/PasswordResetForm";
import DashboardHeader from "../_components/DashboardHeader";

export default function Page() {
    return (
        <div className="space-y-6">
            <DashboardHeader title="Password" />
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <UpdatePasswordForm/>
                    <div className="flex justify-center mt-6">
                        <Link href="/dashboard/profile" className="text-sm font-medium text-gray-600 hover:text-[#1a4731]">
                            Back to Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}