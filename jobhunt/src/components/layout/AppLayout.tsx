import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLeitner } from '../../hooks/useLeitner';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { dueCards } = useLeitner();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Header
          onToggleSidebar={toggleSidebar}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          dueCount={dueCards.length}
          activeRoute={location.pathname}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <main className="pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}