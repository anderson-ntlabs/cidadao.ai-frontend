/**
 * Parental Area Layout
 *
 * Minimal layout for parent dashboard pages.
 * Does NOT use AgoraProvider to avoid loading overhead.
 * Parents access via email verification, not full Agora auth.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

export default function ParentalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
