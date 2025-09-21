import dynamic from 'next/dynamic'

// Feature flag check
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

// Dynamic imports to ensure proper code splitting
const InvestigacoesPage = useNewDesign
  ? dynamic(() => import('./page-v2'), { ssr: true })
  : dynamic(() => import('./page-v1'), { ssr: true })

export default InvestigacoesPage