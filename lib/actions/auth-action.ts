"use server"; // server side api call
import { register, login, whoami, updateProfile, updatePassword } from "@/lib/api/auth";
import { LoginFormData, RegisterFormData } from "@/app/(auth)/_components/schema";
import { clearAuthCookies, setTokenCookie, storeUserData } from "@/lib/cookies";
import { revalidatePath } from "next/cache";
import { UpdatePasswordFormData } from "@/app/dashboard/_components/schema";
import { redirect, RedirectType } from "next/navigation";

export const handleRegisterUser = async (data: RegisterFormData) => {
    try {
        // how to handle data from component and how to send to component
        const result = await register(data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || 'Registration failed' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Registration failed' };
    }
}
export const handleLoginUser = async (data: LoginFormData) => {
    try {
        // how to handle data from component and how to send to component
        const result = await login(data);
        // set cookie
        const user = result.data.user;
        const token = result.data.token;
        await setTokenCookie(token);
        await storeUserData(user);

        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || 'Login failed' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Login failed' };
    }
}

export const handleUserDetails = async () => {
    try {
        const result = await whoami();
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        }
        else {
            return { success: false, message: result.message || 'Failed to fetch user details' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Failed to fetch user details' };
    }
}

export const handleUpdateProfile = async (formData: FormData) => {
    try {
        const result = await updateProfile(formData);
        if (result.success) {
            await revalidatePath("/dashboard/profile"); // Revalidate the profile page after successful update
            return { success: true, message: result.message, data: result.data };
        }
        else {
            return { success: false, message: result.message || 'Failed to update profile' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Failed to update profile' };
    }
}

export const handleUpdatePassword = async (data: UpdatePasswordFormData) => {
    try {
        const result = await updatePassword(data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || 'Failed to update password' };
        }
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Failed to update password' };
    }
}

export const handleLogout = async () => {
    // Clear cookies or tokens here
    // donot use try/catch, redirect is treated as an exception in nextjs server component
    await clearAuthCookies();
    redirect("/login", RedirectType.replace);
}