import { useAuth } from '../../context/AuthContext';
import { LogoutButton } from '../Auth/LogoutButton';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Daily Tasks Tracker</h1>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
            </>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
