import { GraduationCap } from 'lucide-react'

/**
 * Mode Selection Loading Skeleton
 *
 * Matches the visual design of the selection page for seamless loading.
 */
export default function SelecaoLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Glass Card Skeleton */}
      <div className="w-full max-w-2xl mx-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-pulse" />
        </div>

        {/* Mode Cards */}
        <div className="p-6 space-y-4">
          {/* Aprendiz Card Skeleton */}
          <div className="p-6 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400/30 to-orange-500/30" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Kids Card Skeleton */}
          <div className="p-6 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400/30 to-purple-500/30" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
