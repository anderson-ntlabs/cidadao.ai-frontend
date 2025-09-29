// Force all test pages to be dynamically rendered
export const dynamic = 'force-dynamic'

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}