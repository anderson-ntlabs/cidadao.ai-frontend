import dynamic from 'next/dynamic'

// Use Supabase authentication
const LoginPage = dynamic(() => import('./page-supabase'), { ssr: false })

export default LoginPage