import Link from "next/link";
import UpdatePasswordForm from "../_components/PasswordResetForm";

export default function Page() {
    return (
        <div>
            <UpdatePasswordForm/>
             <Link href="/dashboard/profile" className="mt-4 inline-block text-sm font-medium text-muted hover:text-on-dark">
                Back to Profile
            </Link>
        </div>
    );
}