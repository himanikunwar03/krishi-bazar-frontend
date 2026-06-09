"use client";

import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      alert("Login Successful!");

      // Change this later when your dashboard page exists
      router.push("/dashboard");
    } catch (error: any) {
      setError(error?.message || "Login failed");
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731]";

  return (
    <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm px-10 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a4731] mb-1">
            Krishi Bazar
          </h1>

          <p className="text-xl text-gray-700 font-medium">
            Welcome Back!
          </p>

          <p className="text-sm text-gray-500">
            Access your Krishi Bazar marketplace
          </p>
        </div>

        {/* Secure Login Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
            🔒 Secure Login
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              className={inputClass}
            />

            {errors.email && (
              <span className="mt-1 block text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              {...register("password")}
              placeholder="••••••••••"
              className={inputClass}
            />

            {errors.password && (
              <span className="mt-1 block text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Forgot Password */}
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-[#1a4731]"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a4731] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#1a4731] hover:underline"
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}