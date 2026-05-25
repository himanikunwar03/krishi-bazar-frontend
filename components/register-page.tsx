'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const [userType, setUserType] = useState('customer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = (e: React.FormEvent) => {
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
          <h2 className="text-2xl font-light text-gray-800">
            Join Krishi Bazar Today
          </h2>
        </div>

        {/* User Type Selection */}
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-3">
            I am a .....
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('customer')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                userType === 'customer'
                  ? 'bg-emerald-800 text-white'
                  : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              onClick={() => setUserType('farmer')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                userType === 'farmer'
                  ? 'bg-emerald-800 text-white'
                  : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Farmer
            </button>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-5 bg-white p-8 rounded-2xl shadow-md">
          {/* Full Name Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                required
              />
            </div>
          </div>

          {/* Email/Phone Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email or Phone Number
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="you@example.com or phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                required
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
                required
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-600 transition"
                required
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition"
          >
            Sign Up
            <span>→</span>
          </button>
        </form>

        Divider */}
        {/* <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 font-medium text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Register Buttons */}
        {/* <div className="grid grid-cols-2 gap-4">
          <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition">
            Google
          </button>
          <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition">
            Facebook
          </button>
        </div> */}

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
