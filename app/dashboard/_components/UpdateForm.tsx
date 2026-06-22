"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UpdateProfileFormData, updateProfileSchema } from "./schema";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { Slide, toast } from "react-toastify";
import Image from "next/image";
export default function UpdateForm(
    { user }: { user: any }
) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            username: user?.username || '',
        }
    });


    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    const onSubmit = (data: UpdateProfileFormData) => {
        setError('');
        startTransition(
            async () => {
                try {
                    const formdata = new FormData();
                    formdata.append("email", data.email || '');
                    formdata.append("firstName", data.firstName || '');
                    formdata.append("lastName", data.lastName || '');
                    formdata.append("username", data.username || '');
                    if (data.image) {
                        formdata.append("profileImage", data.image);
                    }
                    const result = await handleUpdateProfile(formdata);
                    if (result.success) {
                        toast.success('Profile updated successfully', {
                            position: "top-center", // set positiom from function iteselt
                            transition: Slide,
                        });
                        handleDismissImage();
                    } else {
                        throw new Error(result.message || 'Failed to update profile');
                    }
                } catch (error: any) {
                    toast.error(error?.message);
                    setError(error?.message || 'Failed to update profile');
                }
            }
        );
    }

    const fieldClass = "h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
    const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body";
    const errClass = "mt-1 block text-sm text-m-red";

    return (
        <div className="w-full max-w-md">
            <h1 className="mb-8 text-4xl font-bold uppercase leading-none text-on-dark">Update account</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}
                <div className="mb-4">
                    {previewImage ? (
                        <div className="relative w-24 h-24">
                            <img
                                src={previewImage}
                                alt="Profile Image Preview"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <Controller
                                name="image"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <button
                                        type="button"
                                        onClick={() => handleDismissImage(onChange)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            />
                        </div>
                    ) : user?.imageUrl ? (
                        <Image
                            src={process.env.NEXT_PUBLIC_API_BASE_URL + user.imageUrl}
                            alt="Profile Image"
                            width={100}
                            height={100}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600">No Image</span>
                        </div>
                    )}
                </div>

                {/* Profile Image Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Profile Image</label>
                    <Controller
                        name="image"
                        control={control}
                        render={({ field: { onChange } }) => (
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                accept=".jpg,.jpeg,.png,.webp"
                            />
                        )}
                    />
                    {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
                </div>
                <div className="mb-5">
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className={fieldClass}
                    />
                    {errors.email && <span className={errClass}>{errors.email.message}</span>}
                </div>
                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>First Name</label>
                        <input
                            type="text"
                            {...register("firstName")}
                            placeholder="Jane"
                            className={fieldClass}
                        />
                        {errors.firstName && <span className={errClass}>{errors.firstName.message}</span>}
                    </div>
                    <div>
                        <label className={labelClass}>Last Name</label>
                        <input
                            type="text"
                            {...register("lastName")}
                            placeholder="Doe"
                            className={fieldClass}
                        />
                        {errors.lastName && <span className={errClass}>{errors.lastName.message}</span>}
                    </div>
                </div>
                <div className="mb-5">
                    <label className={labelClass}>Username</label>
                    <input
                        type="text"
                        {...register("username")}
                        placeholder="janedoe"
                        className={fieldClass}
                    />
                    {errors.username && <span className={errClass}>{errors.username.message}</span>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isPending}
                    className="flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Updating profile..." : "Update Profile"}
                </button>
            </form>
        </div>
    );
}