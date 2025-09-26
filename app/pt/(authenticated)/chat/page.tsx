import dynamic from 'next/dynamic'

// Feature flag check
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

// Dynamic imports to ensure proper code splitting
// Using v3 for stable chat functionality (v4 has session sync issues)
const ChatPage = useNewDesign
  ? dynamic(() => import('./page-v3'), { ssr: true })
  : dynamic(() => import('./page-v1'), { ssr: true })

export default ChatPage