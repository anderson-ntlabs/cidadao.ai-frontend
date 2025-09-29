'use client'

import { BreadcrumbsV2 as Breadcrumbs } from './breadcrumbs'

export function BreadcrumbsV2Demo() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Breadcrumbs Examples</h2>
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Details', current: true }
        ]} />
      </section>
    </div>
  )
}