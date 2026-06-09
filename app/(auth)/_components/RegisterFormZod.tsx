"use client";

import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconInput,
  MailIcon,
  LockIcon,
  UserIcon,
  PrimaryButton,
  OrDivider,
  SocialButtons,
} from "./ui";

type Role = "customer" | "farmer";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      console.log({ ...data, role });
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    }
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
  const errClass = "mt-1 block text-xs text-red-500";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-[#1a4731]">Krishi Bazar</h1>
        <p className="text-lg font-medium text-gray-800">Join Krishi Bazar Today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Role selector */}
        <div className="mb-5">
          <p className="mb-2 text-sm italic text-gray-400">I am a ....</p>
          <div className="flex overflow-hidden rounded-xl border border-gray-200">
            {(["customer", "farmer"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`h-11 flex-1 text-sm font-semibold capitalize transition-colors ${
                  role === r ? "bg-[#1a4731] text-white" : "bg-white text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Full name */}
        <div className="mb-4">
          <label className={labelClass}>Full Name</label>
          <IconInput
            icon={<UserIcon className="h-4 w-4" />}
            type="text"
            placeholder="Enter your full name"
            {...register("fullName")}
          />
          {errors.fullName && <span className={errClass}>{errors.fullName.message}</span>}
        </div>

        {/* Email / phone */}
        <div className="mb-4">
          <label className={labelClass}>Email or Phone Number</label>
          <IconInput
            icon={<MailIcon className="h-4 w-4" />}
            type="text"
            placeholder="you@example.com or phone"
            {...register("email")}
          />
          {errors.email && <span className={errClass}>{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className={labelClass}>Password</label>
          <IconInput
            icon={<LockIcon className="h-4 w-4" />}
            type="password"
            placeholder="••••••••••"
            {...register("password")}
          />
          {errors.password && <span className={errClass}>{errors.password.message}</span>}
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <label className={labelClass}>Confirm Password</label>
          <IconInput
            icon={<LockIcon className="h-4 w-4" />}
            type="password"
            placeholder="••••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className={errClass}>{errors.confirmPassword.message}</span>
          )}
        </div>

        <PrimaryButton type="submit" loading={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </PrimaryButton>
      </form>

      <OrDivider />
      <SocialButtons />

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#1a4731] hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
