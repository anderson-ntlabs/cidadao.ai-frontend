import { GraduationCap } from 'lucide-react'

/**
 * Academy Loading Skeleton
 *
 * Automatically shown by Next.js during page transitions.
 * Uses the same visual language as the dashboard.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  )
}

function SkeletonQuickAction() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

export default function AcademyLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mentor Card Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start gap-6">
                <div className="w-28 h-28 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 w-20 bg-yellow-200 dark:bg-yellow-900/30 rounded" />
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-20 bg-green-100 dark:bg-green-900/30 rounded-full"
                      />
                    ))}
                  </div>
                  <div className="h-12 w-40 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto animate-pulse" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonQuickAction key={i} />
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-12 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
