import Link from "next/link";
import UpdatePasswordForm from "../_components/PasswordResetForm";

export default function Page() {
    return (
        <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center px-4 py-12">
            <div className="w-full">
                <UpdatePasswordForm/>
                <div className="flex justify-center mt-6">
                    <Link href="/dashboard/profile" className="text-sm font-medium text-gray-600 hover:text-[#1a4731]">
                        Back to Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}