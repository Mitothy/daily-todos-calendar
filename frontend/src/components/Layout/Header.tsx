import { useAuth } from '../../context/AuthContext';
import { LogoutButton } from '../Auth/LogoutButton';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-slate-700/60 sticky top-0 z-40 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">Daily Tasks</h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 pl-3 border-l border-gray-200 dark:border-slate-700">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
