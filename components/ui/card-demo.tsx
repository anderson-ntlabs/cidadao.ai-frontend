'use client'

import { CardV2 as Card, CardV2Header as CardHeader, CardV2Title as CardTitle, CardV2Content as CardContent } from './card'

export function CardV2Demo() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              This is an elevated card with shadow effects.
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
            </CardHeader>
            <CardContent>
              This is an outlined card with border styling.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}