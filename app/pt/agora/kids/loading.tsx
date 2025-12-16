import { Sparkles } from 'lucide-react'

/**
 * Kids Mode Loading Skeleton
 *
 * Playful design matching the Kids area aesthetic.
 */
export default function KidsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Glass Card Skeleton */}
      <div className="w-full max-w-lg mx-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-56 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-pulse" />
        </div>

        {/* Avatar Selection Skeleton */}
        <div className="px-8 pb-6">
          <div className="flex justify-center gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900/30 dark:to-purple-900/30 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Input Fields Skeleton */}
        <div className="px-8 pb-8 space-y-4">
          <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-14 w-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
