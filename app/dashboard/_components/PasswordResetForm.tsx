"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UpdatePasswordFormData, updatePasswordSchema, } from "./schema";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { handleUpdatePassword } from "@/lib/actions/auth-action";
export default function UpdatePasswordForm(
) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<UpdatePasswordFormData>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });


    const onSubmit = (data: UpdatePasswordFormData) => {
        setError('');
        startTransition(
            async () => {
                try {
                    const result = await handleUpdatePassword(data);
                    if (!result.success) {
                        throw new Error(result.message || 'Failed to update password');
                    }
                    toast.success('Password updated successfully');
                } catch (error: any) {
                    toast.error(error?.message);
                    setError(error?.message || 'Failed to update password');
                }
            }
        );
    }

    const fieldClass = "h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
    const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body";
    const errClass = "mt-1 block text-sm text-m-red";

    return (
        <div className="w-full max-w-md">
            <h1 className="mb-8 text-4xl font-bold uppercase leading-none text-on-dark">Update Password</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}

                <div className="mb-5">
                    <label className={labelClass}>Current Password</label>
                    <input
                        type="password"
                        {...register("currentPassword")}
                        placeholder="••••••••"
                        className={fieldClass}
                    />
                    {errors.currentPassword && <span className={errClass}>{errors.currentPassword.message}</span>}
                </div>
                <div className="mb-5 ">
                    <div>
                        <label className={labelClass}>New Password</label>
                        <input
                            type="password"
                            {...register("newPassword")}
                            placeholder="••••••••"
                            className={fieldClass}
                        />
                        {errors.newPassword && <span className={errClass}>{errors.newPassword.message}</span>}
                    </div>

                </div>

                <div className="mb-5">
                    <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <input
                            type="password"
                            {...register("confirmPassword")}
                            placeholder="••••••••"
                            className={fieldClass}
                        />
                        {errors.confirmPassword && <span className={errClass}>{errors.confirmPassword.message}</span>}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || isPending}
                    className="flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Updating password..." : "Update password"}
                </button>
            </form>
        </div>
    );
}