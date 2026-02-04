import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginButton } from '../components/Auth/LoginButton';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Tasks Tracker</h1>
        <p className="text-gray-500">Track your daily tasks with Google Calendar color-coding</p>
      </div>
      <LoginButton />
    </div>
  );
}
