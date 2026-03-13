import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppLayout } from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import { AuthPage } from './pages/Auth';
import AnalysisDetail from './pages/AnalysisDetail';
import Home from './pages/Home';
import About from './pages/About';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading your session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/register" element={<AuthPage type="register" />} />

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><AppLayout><AnalysisDetail /></AppLayout></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
