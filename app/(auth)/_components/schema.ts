import { z } from "zod";

export const registerSchema = z
  .object({
    role: z.enum(["user", "farmer"]),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters"),

    firstName: z
      .string()
      .min(1, "First name is required"),

    lastName: z
      .string()
      .min(1, "Last name is required"),

    email: z
      .string()
      .email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;