"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

/* -------------------------------------------------------------------------- */
/*  Brand colors                                                              */
/* -------------------------------------------------------------------------- */

export const BRAND = "#1a4731";

/* -------------------------------------------------------------------------- */
/*  Icons (inline SVG — no extra deps)                                        */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string };

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Icon input field                                                          */
/* -------------------------------------------------------------------------- */

type IconInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
};

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  function IconInput({ icon, className = "", ...props }, ref) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          ref={ref}
          {...props}
          className={
            "h-12 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 " +
            "text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors " +
            "focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] " +
            className
          }
        />
      </div>
    );
  }
);

/* -------------------------------------------------------------------------- */
/*  "OR" divider + social buttons                                            */
/* -------------------------------------------------------------------------- */

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-medium text-gray-400">OR</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
      >
        Google
      </button>
      <button
        type="button"
        className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
      >
        Facebook
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Primary submit button                                                     */
/* -------------------------------------------------------------------------- */

export function PrimaryButton({
  children,
  loading,
  ...props
}: InputHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      disabled={loading || props.disabled}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1a4731] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {children}
      {!loading && <ArrowRightIcon className="h-4 w-4" />}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Split-screen auth shell (photo left, form right)                         */
/* -------------------------------------------------------------------------- */

export function AuthShell({
  image,
  imageAlt,
  children,
}: {
  image: string;
  imageAlt: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eeeeee] p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
        {/* Left: produce photo (green fallback shows until the image loads) */}
        <div className="relative hidden min-h-[560px] bg-linear-to-br from-[#1a4731] to-[#2f6b48] md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              // Hide until the local asset is added; the green gradient shows through.
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center bg-[#fafafa] p-8 sm:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
