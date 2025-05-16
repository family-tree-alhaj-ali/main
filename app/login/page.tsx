"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LogIn, User, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple authentication - in a real app, this would be more secure
    if (username === "admin" && password === "admin123") {
      // Store authentication state in localStorage
      localStorage.setItem("isAuthenticated", "true")
      router.push("/admin")
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-slate-800 shadow-md w-full h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="شجرة العائلة" className="h-8 w-8" />
          <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">شجرة العائلة</h1>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} />
          العودة للصفحة الرئيسية
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 inline-block text-transparent bg-clip-text mb-4">
              تسجيل الدخول
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">أدخل بيانات الدخول للوصول إلى لوحة الإدارة</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
            {error && (
              <motion.div
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                تسجيل الدخول
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
