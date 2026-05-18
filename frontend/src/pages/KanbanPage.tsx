import { Header } from '../components/Layout/Header';
import { KanbanBoard } from '../components/Kanban/KanbanBoard';

export function KanbanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Project Board</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Longer-term goals and projects</p>
        </div>
        <KanbanBoard />
      </div>
    </div>
  );
}
