"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateProfile, updatePassword } from "@/lib/api/auth";
import { Camera, Save, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

// ── Profile Form ───────────────────────────────────────────────────────────────
interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  imageFile: File | null;
  imagePreview: string | null;
}

// ── Password Form ──────────────────────────────────────────────────────────────
interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_PASSWORD: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { isAuthenticated, user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    imageFile: null,
    imagePreview: null,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState<PasswordForm>(EMPTY_PASSWORD);
  const [savingPassword, setSavingPassword] = useState(false);

  // Populate form from user context
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        imageFile: null,
        imagePreview: user.image ? `http://localhost:8088${user.image}` : null,
      });
    }
  }, [user]);

  if (!isAuthenticated || user?.role !== "farmer") return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfile((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = new FormData();
      data.append("firstName", profile.firstName);
      data.append("lastName", profile.lastName);
      data.append("email", profile.email);
      data.append("username", profile.username);
      if (profile.imageFile) {
        data.append("profileImage", profile.imageFile);
      }
      const res = await updateProfile(data);
      if (res?.success && res?.data) {
        setUser(res.data);
        toast.success("Profile updated successfully!");
      } else {
        toast.success("Profile updated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswords(EMPTY_PASSWORD);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const farmerName =
    profile.firstName && profile.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user?.username || "Farmer";

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-[#1a4731] to-emerald-600" />

          {/* Profile Image + Name */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-gray-100 overflow-hidden">
                  {profile.imagePreview ? (
                    <img
                      src={profile.imagePreview}
                      alt={farmerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
                      <User className="w-10 h-10 text-emerald-300" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1a4731] hover:bg-[#155628] rounded-full flex items-center justify-center shadow-md transition-colors"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-gray-900">{farmerName}</h2>
                <span className="inline-block text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full capitalize">
                  {user?.role || "farmer"}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="username"
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-[#1a4731] hover:bg-[#155628] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-5">
            <PasswordInput
              label="Current Password"
              value={passwords.currentPassword}
              onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
              placeholder="Enter your current password"
              required
            />
            <PasswordInput
              label="New Password"
              value={passwords.newPassword}
              onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
              placeholder="At least 6 characters"
              required
            />
            <PasswordInput
              label="Confirm New Password"
              value={passwords.confirmPassword}
              onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })}
              placeholder="Re-enter new password"
              required
            />

            {/* Password match indicator */}
            {passwords.newPassword && passwords.confirmPassword && (
              <p
                className={`text-xs font-medium ${
                  passwords.newPassword === passwords.confirmPassword
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {passwords.newPassword === passwords.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {savingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
