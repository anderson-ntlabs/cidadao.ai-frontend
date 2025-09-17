export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4">Debug: Check if locale routing is working</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>URL: {typeof window !== 'undefined' ? window.location.pathname : 'server'}</p>
          <p>Try accessing: /pt or /en directly</p>
        </div>
      </div>
    </div>
  )
}