import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import StudySessionPage from './pages/StudySessionPage';
import JobBoardPage from './pages/JobBoardPage';
import FlashcardsLibraryPage from './pages/FlashcardsLibraryPage';
import ToastContainer from './components/ToastContainer';
// TODO: create this page, then swap out the placeholder below
// import FlashcardsPage from './pages/FlashcardsPage';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Navigate to="/login?mode=signup" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobBoardPage />} />
<Route path="/flashcards" element={<FlashcardsLibraryPage />} />
            <Route path="/study" element={<StudySessionPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Mounted outside <Routes> so toasts survive redirects (e.g. login -> /) */}
      <ToastContainer />
    </>
  );
}