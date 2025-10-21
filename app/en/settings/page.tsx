'use client'

import { useState } from 'react'
import { Settings, Type, Eye, Keyboard, HelpCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FontSizeControl } from '@/components/a11y/font-size-control'
import { HighContrastToggle } from '@/components/a11y/high-contrast-toggle'

// Note: VLibras (Brazilian Sign Language) is only available on Portuguese pages

/**
 * Accessibility Settings
 *
 * Dedicated page to manage all user accessibility preferences,
 * including font size and high contrast mode.
 *
 * Features:
 * - Font size control (4 levels)
 * - High contrast toggle
 * - Keyboard shortcuts information
 * - Accessibility guide
 * - Responsive design
 * - Persistent preferences
 */

export default function SettingsPage() {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/en"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Accessibility Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Customize your experience to better meet your needs
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Font Size Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Type className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Font Size
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Adjust text size for better readability. Use the buttons below or the
                  keyboard shortcuts <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Alt + +</kbd> and{' '}
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Alt + -</kbd>
                </p>
                <FontSizeControl locale="en" />
              </div>
            </div>
          </section>

          {/* High Contrast Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    High Contrast
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Increase contrast between text and background for better visibility. Use
                    the shortcut <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Alt + H</kbd> to
                    quickly toggle on/off.
                  </p>
                </div>
              </div>
              <HighContrastToggle />
            </div>
          </section>

          {/* Keyboard Shortcuts Section */}
          <section className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Keyboard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Keyboard Shortcuts
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  >
                    {showKeyboardHelp ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {showKeyboardHelp && (
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Use these shortcuts to quickly navigate accessibility features:
                    </p>

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          Toggle high contrast
                        </span>
                        <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 font-mono text-sm">
                          Alt + H
                        </kbd>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          Increase font size
                        </span>
                        <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 font-mono text-sm">
                          Alt + +
                        </kbd>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          Decrease font size
                        </span>
                        <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 font-mono text-sm">
                          Alt + -
                        </kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Help Section */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Need Help?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We are committed to providing an accessible experience for all users.
                  If you encounter any difficulties or have suggestions for improvements, please contact us.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                    asChild
                  >
                    <Link href="/en/about">
                      About the Project
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                    asChild
                  >
                    <Link href="/en/privacy">
                      Privacy Policy
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            All your preferences are saved locally in your browser and
            will remain active on your next visits.
          </p>
        </div>
      </div>
    </div>
  )
}
