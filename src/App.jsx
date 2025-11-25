import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import InsightsPage from './components/Dashboard/insights/InsightsPage';
import { FilterProvider } from './providers/FilterProvider';
import RightSidebarNav from './components/layout/RightSidebarNav';
import BackToTop from './components/common/BackToTop';
import { APP_ROUTES } from './config/routes';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function InsightsRoute() {
  return (
    <FilterProvider>
      <div className="flex justify-center px-6 py-4">
        <div className="w-full max-w-7xl">
          <div className="flex gap-6">
            <main className="flex-1 lg:max-w-[calc(100%-320px)]">
              <InsightsPage />
            </main>
            <div className="hidden lg:flex flex-col w-80 gap-4">
              <RightSidebarNav />
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
    </FilterProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<InsightsRoute />} />
          {APP_ROUTES.map(route => (
            <Route
              key={route.id}
              path={route.path}
              element={<route.component />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
