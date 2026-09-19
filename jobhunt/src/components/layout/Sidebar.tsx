import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Briefcase, Layers, Play, Moon, X, LogOut } from 'lucide-react';
import { useAuthStore, selectUser } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  dueCount: number;
  activeRoute: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutGrid },
  { label: 'Job Board', to: '/jobs', icon: Briefcase },
  { label: 'Flashcards', to: '/flashcards', icon: Layers },
];

export default function Sidebar({
  isOpen,
  onClose,
  dueCount,
  activeRoute,
  darkMode,
  onToggleDarkMode,
}: SidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[320px] bg-surface dark:bg-surface-dark border-r border-neutral/20 shadow-xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral">
            Navigation
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1 rounded-lg text-neutral hover:bg-neutral/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Signed-in user row */}
        {user && (
          <div className="flex items-center gap-3 px-5 pb-3 mb-1 border-b border-neutral/15">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#151C24] dark:text-white truncate">
                {user.name}
              </p>
              {!user.isGuest && (
                <p className="text-xs text-neutral truncate">{user.email}</p>
              )}
              {user.isGuest && <p className="text-xs text-neutral">Guest session</p>}
            </div>
          </div>
        )}

        <nav className="px-3 mt-2 flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon }) => {
            const isActive = activeRoute === to;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-primary dark:text-white hover:bg-neutral/10'
                }`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            );
          })}

          <NavLink
            to="/study"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeRoute === '/study'
                ? 'bg-primary text-white'
                : 'bg-transparent text-primary dark:text-white hover:bg-neutral/10'
            }`}
          >
            <Play size={18} />
            <span className="flex-1">Study Now</span>
            {dueCount > 0 && (
              <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {dueCount}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="mx-4 mt-6 p-4 rounded-xl bg-neutral/10">
          <p className="font-bold text-primary dark:text-white text-sm">You got this.</p>
          <p className="text-xs text-neutral mt-1">
            Consistency beats intensity. Small steps every day.
          </p>
        </div>

        <div className="mt-auto">
          <div className="px-4 py-4 border-t border-neutral/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-primary dark:text-white">
              <Moon size={18} />
              <span>Dark mode</span>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle dark mode"
              className={`relative w-10 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-primary' : 'bg-neutral/40'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  darkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Logout */}
          <div className="px-4 pb-5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}