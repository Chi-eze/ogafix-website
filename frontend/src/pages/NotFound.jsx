import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 px-4 py-24">
      <div className="text-center">
        <p className="text-7xl font-display font-bold text-secondary/20 mb-2">404</p>
        <h1 className="text-2xl font-display font-bold text-secondary mb-3">Page not found</h1>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-block">
          Go Home
        </Link>
      </div>
    </div>
  )
}
