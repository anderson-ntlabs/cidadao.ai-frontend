'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Only show loading screen in PWA standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true

    if (!isStandalone) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsVisible(false), 500)
          return 100
        }
        return prev + 10
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-topography-pattern opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo and Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 animate-pulse">
            <Image
              src="/forum-icon.png"
              alt="Cidadão.AI"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
            Cidadão.AI
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
          Carregando transparência...
        </p>

        {/* Made in Brazil */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>🇧🇷</span>
          <span className="font-medium">Feito no Brasil, para o Brasil</span>
          <span>🇧🇷</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-green-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-10"></div>
    </div>
  )
}