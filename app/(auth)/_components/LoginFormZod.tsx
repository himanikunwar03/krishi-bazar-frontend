"use client";

import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

const inputClass = "h-12 w-full border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] rounded-lg";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    console.log("Login form submitted with data:", data);

    try {
      const result = await handleLoginUser(data);
      console.log("Login result:", result);

      if (result.success) {
        // Sync the new cookie into AuthContext state before navigating
        await checkAuth();
        const userRole = result.data?.user?.role;
        if (userRole === 'farmer') {
          router.push("/farmer-dashboard");
        } else {
          router.push("/marketplace");
        }
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || "Login failed");
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

        {/* Secure Login Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
            <Lock className="w-4 h-4" /> Secure Login
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
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your email or number"
              {...register("email")}
              className={inputClass + " pl-10"}
            />
          </div>
          {errors.email && (
            <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

          {/* Password */}
          <div className="mb-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errors.password && (
              <span className="mt-1 block text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

        {/* Forgot password */}
        <div className="mb-6 flex justify-end">
          <button type="button" className="text-sm text-gray-500 hover:text-[#1a4731]">
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#1a4731] text-white font-semibold rounded-lg hover:bg-[#1a4731]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

      {/* Signup Link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#1a4731] hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  );
}

