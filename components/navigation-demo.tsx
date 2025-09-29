'use client'

import { NavigationV2 as Navigation } from './navigation'

export function NavigationV2Demo() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Navigation Example</h2>
        <Navigation items={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
          { name: 'Contact', href: '/contact' }
        ]} />
      </section>
    </div>
  )
}