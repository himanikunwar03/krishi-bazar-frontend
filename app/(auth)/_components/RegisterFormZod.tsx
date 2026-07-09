"use client";

import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleRegisterUser } from "@/lib/actions/auth-action";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [role, setRole] = useState<"user" | "farmer">("user");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      role: "user",
    },
  });

  // Update role in form when role state changes
  const handleRoleChange = (newRole: "user" | "farmer") => {
    setRole(newRole);
    setValue("role", newRole);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    console.log("Form submitted. Data:", data);
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088");

    try {
      const result = await handleRegisterUser(data);
      console.log("Registration result:", result);

      if (result.success) {
        router.push("/login");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setError(error?.message || "Registration failed");
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731]";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  const errClass = "mt-1 block text-xs text-red-500";

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
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

          {/* Role Selector */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-400 italic">I am a ....</p>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => handleRoleChange("user")}
                className={`flex-1 h-11 text-sm font-semibold transition-colors ${
                  role === "user"
                    ? "bg-[#1a4731] text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("farmer")}
                className={`flex-1 h-11 text-sm font-semibold transition-colors ${
                  role === "farmer"
                    ? "bg-[#1a4731] text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Farmer
              </button>
            </div>
            <input type="hidden" {...register("role")} />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className={labelClass}>Username</label>
            <input
              type="text"
              {...register("username")}
              placeholder="Username"
              className={inputClass}
            />
            {errors.username && (
              <span className={errClass}>{errors.username.message}</span>
            )}
          </div>

          {/* First Name & Last Name */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                {...register("firstName")}
                placeholder="First name"
                className={inputClass}
              />
              {errors.firstName && (
                <span className={errClass}>{errors.firstName.message}</span>
              )}
            </div>

            <div className="flex-1">
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                {...register("lastName")}
                placeholder="Last name"
                className={inputClass}
              />
              {errors.lastName && (
                <span className={errClass}>{errors.lastName.message}</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={labelClass}>Email or Phone Number</label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className={inputClass}
            />
            {errors.email && (
              <span className={errClass}>{errors.email.message}</span>
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
              <span className={errClass}>{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className={labelClass}>Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••••"
              className={inputClass}
            />
            {errors.confirmPassword && (
              <span className={errClass}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a4731] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            onClick={() => console.log("Button clicked. isValid:", isValid, "errors:", errors)}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
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

