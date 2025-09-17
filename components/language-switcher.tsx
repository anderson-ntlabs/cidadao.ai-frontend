import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const currentLang = pathname.startsWith('/en') ? 'en' : 'pt'
  
  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Link
        href="/pt"
        className={`px-3 py-1 rounded-md transition-colors ${
          currentLang === 'pt' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        PT
      </Link>
      <Link
        href="/en"
        className={`px-3 py-1 rounded-md transition-colors ${
          currentLang === 'en' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </Link>
    </div>
  )
}