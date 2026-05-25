'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">
            Krishi Bazar
          </h1>
          <h2 className="text-2xl font-light text-gray-800 mb-1">
            Welcome Back!
          </h2>
          <p className="text-gray-600">
            Access your Krishi bazar marketplace
          </p>
        </div>

        {/* Secure Login Badge */}
        <div className="inline-flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full mb-8">
          <Lock className="w-4 h-4 text-emerald-800" />
          <span className="text-sm font-medium text-emerald-800">
            Secure Login
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 bg-white p-8 rounded-2xl shadow-md">
          {/* Email/Phone Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email or Phone Number
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your email or number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium text-sm transition"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition"
          >
            Login
            <span>→</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 font-medium text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition">
            Google
          </button>
          <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition">
            Facebook
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
