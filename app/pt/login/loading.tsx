import { LogIn } from 'lucide-react'

/**
 * Login Page Loading Skeleton
 *
 * Matches the login page design for seamless loading.
 */
export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Glass Card Skeleton */}
      <div className="w-full max-w-md mx-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-pulse" />
        </div>

        {/* Auth Buttons Skeleton */}
        <div className="p-8 space-y-4">
          {/* GitHub Button */}
          <div className="h-12 w-full bg-gray-900 dark:bg-gray-700 rounded-xl animate-pulse" />

          {/* Google Button */}
          <div className="h-12 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse" />

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Email Input */}
          <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />

          {/* Password Input */}
          <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />

          {/* Submit Button */}
          <div className="h-12 w-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl animate-pulse" />
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <div className="h-3 w-56 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
