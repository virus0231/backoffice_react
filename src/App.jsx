import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Users from './components/Dashboard/pages/Users';
import Permissions from './components/Dashboard/pages/Permissions';
import Donors from './components/Dashboard/pages/Donors';
import Donation from './components/Dashboard/pages/Donation';
import Schedule from './components/Dashboard/pages/Schedule';
import Configuration from './components/Dashboard/pages/Configuration';
import DonationsReport from './components/Dashboard/pages/DonationsReport';
import FundReport from './components/Dashboard/pages/FundReport';
import CampaignReport from './components/Dashboard/pages/CampaignReport';
import MonthlyReport from './components/Dashboard/pages/MonthlyReport';
import DonorReport from './components/Dashboard/pages/DonorReport';
import CausesReport from './components/Dashboard/pages/CausesReport';
import Causes from './components/Dashboard/pages/Causes';
import Appeal from './components/Dashboard/pages/Appeal';
import Amount from './components/Dashboard/pages/Amount';
import FundList from './components/Dashboard/pages/FundList';
import FeaturedAmount from './components/Dashboard/pages/FeaturedAmount';
import FundAmount from './components/Dashboard/pages/FundAmount';
import Category from './components/Dashboard/pages/Category';
import Country from './components/Dashboard/pages/Country';
import InsightsPage from './components/Dashboard/insights/InsightsPage';
import { FilterProvider } from './providers/FilterProvider';
import RightSidebarNav from './components/layout/RightSidebarNav';
import BackToTop from './components/common/BackToTop';

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
          <Route path="users" element={<Users />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="donors" element={<Donors />} />
          <Route path="donation" element={<Donation />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="donations-report" element={<DonationsReport />} />
          <Route path="fund-report" element={<FundReport />} />
          <Route path="campaign-report" element={<CampaignReport />} />
          <Route path="monthly-report" element={<MonthlyReport />} />
          <Route path="donor-report" element={<DonorReport />} />
          <Route path="causes-report" element={<CausesReport />} />
          <Route path="causes" element={<Causes />} />
          <Route path="appeal" element={<Appeal />} />
          <Route path="amount" element={<Amount />} />
          <Route path="fund-list" element={<FundList />} />
          <Route path="featured-amount" element={<FeaturedAmount />} />
          <Route path="fund-amount" element={<FundAmount />} />
          <Route path="category" element={<Category />} />
          <Route path="country" element={<Country />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
