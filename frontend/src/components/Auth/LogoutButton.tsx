import { useAuth } from '../../context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
    >
      Sign out
    </button>
  );
}
