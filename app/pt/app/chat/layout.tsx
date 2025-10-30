import type { ReactNode } from 'react'

export default function ChatLayout({
  children,
}: {
  children: ReactNode
}) {
  // Chat page needs full control over its layout without AuthLayout's containers
  // Remove default padding and let chat manage its own spacing
  return (
    <div className="absolute inset-0 top-16">
      {children}
    </div>
  )
}
