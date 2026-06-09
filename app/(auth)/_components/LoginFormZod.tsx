"use client";

import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconInput,
  MailIcon,
  LockIcon,
  ShieldIcon,
  PrimaryButton,
  // OrDivider,
  // SocialButtons,
} from "./ui";

export default function LoginForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      console.log("Login Data:", data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-[#1a4731]">Krishi Bazar</h1>
        <p className="text-xl font-medium text-gray-800">Welcome Back!</p>
        <p className="text-sm text-gray-500">Access your Krishi Bazar marketplace</p>
      </div>

      {/* Secure login badge */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
          <ShieldIcon className="h-4 w-4" />
          Secure Login
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Email / phone */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email or Phone Number
          </label>
          <IconInput
            icon={<MailIcon className="h-4 w-4" />}
            type="text"
            placeholder="Enter your email or number"
            {...register("email")}
          />
          {errors.email && (
            <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
          <IconInput
            icon={<LockIcon className="h-4 w-4" />}
            type="password"
            placeholder="••••••••••"
            {...register("password")}
          />
          {errors.password && (
            <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>
          )}
        </div>

        {/* Forgot password */}
        <div className="mb-6 flex justify-end">
          <button type="button" className="text-sm text-gray-500 hover:text-[#1a4731]">
            Forgot Password?
          </button>
        </div>

        <PrimaryButton type="submit" loading={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </PrimaryButton>
      </form>

      {/* <OrDivider /> */}
      {/* <SocialButtons /> */}

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#1a4731] hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
