/**
 * Chart Skeleton Loader
 * Displayed while chart components are being lazy loaded
 */

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
      style={{ height }}
    >
      <div className="p-4 h-full flex flex-col justify-between">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />

        {/* Chart area skeleton */}
        <div className="flex-1 flex items-end justify-between space-x-2 px-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded flex-1"
              style={{
                height: `${Math.random() * 60 + 30}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* X-axis skeleton */}
        <div className="flex justify-between mt-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PieChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
      style={{ height }}
    >
      <div className="p-4 h-full flex items-center justify-center">
        {/* Pie chart circle skeleton */}
        <div className="relative">
          <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="absolute inset-4 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>

        {/* Legend skeleton */}
        <div className="ml-8 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12" />
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  )
}
