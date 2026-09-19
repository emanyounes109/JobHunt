import { Menu, Layers, Moon } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
}

export default function Header({ onToggleSidebar, onToggleDarkMode, darkMode }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-background-light dark:bg-background-dark border-b border-neutral/20 flex items-center justify-between px-4 transition-colors">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="p-2 rounded-lg text-primary hover:bg-neutral/10 dark:text-white transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2 mr-auto ml-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Layers size={18} className="text-white" />
        </div>
        <span className="font-bold text-primary dark:text-white text-base">
          Job Hunt Companion
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleDarkMode}
        aria-label="Toggle dark mode"
        className="p-2 rounded-lg text-primary dark:text-white hover:bg-neutral/10 transition-colors"
      >
        <Moon size={20} />
      </button>
    </header>
  );
}