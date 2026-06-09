"use client";

import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [role, setRole] = useState<"customer" | "farmer">("customer");

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
      console.log({
        ...data,
        role,
      });

      alert("Registration Successful!");

      router.push("/login");
    } catch (error: any) {
      setError(error?.message || "Registration failed");
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731]";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

  const errClass =
    "mt-1 block text-xs text-red-500";

  return (
    <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm px-10 py-12">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-[#1a4731] mb-1">
            Krishi Bazar
          </h1>

          <p className="text-lg text-gray-700 font-medium">
            Join Krishi Bazar Today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-400 italic">
              I am a ....
            </p>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex-1 h-11 text-sm font-semibold transition-colors ${
                  role === "customer"
                    ? "bg-[#1a4731] text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole("farmer")}
                className={`flex-1 h-11 text-sm font-semibold transition-colors ${
                  role === "farmer"
                    ? "bg-[#1a4731] text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Farmer
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className={labelClass}>Full Name</label>

            <input
              type="text"
              {...register("fullName")}
              placeholder="Enter your full name"
              className={inputClass}
            />

            {errors.fullName && (
              <span className={errClass}>
                {errors.fullName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={labelClass}>
              Email or Phone Number
            </label>

            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className={inputClass}
            />

            {errors.email && (
              <span className={errClass}>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className={labelClass}>Password</label>

            <input
              type="password"
              {...register("password")}
              placeholder="••••••••••"
              className={inputClass}
            />

            {errors.password && (
              <span className={errClass}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className={labelClass}>
              Confirm Password
            </label>

            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••••"
              className={inputClass}
            />

            {errors.confirmPassword && (
              <span className={errClass}>
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a4731] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating account..."
              : "Sign Up"}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1a4731] hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}