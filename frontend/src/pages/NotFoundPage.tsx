import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-500 mb-6">Page not found</p>
      <Link to="/" className="text-blue-500 hover:text-blue-600">
        Go home
      </Link>
    </div>
  );
}
