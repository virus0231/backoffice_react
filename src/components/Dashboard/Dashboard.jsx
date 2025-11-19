import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContent from './DashboardContent';
import Users from './pages/Users';
import Permissions from './pages/Permissions';
import Donors from './pages/Donors';
import Donation from './pages/Donation';
import Schedule from './pages/Schedule';
import Configuration from './pages/Configuration';
import DonationsReport from './pages/DonationsReport';
import FundReport from './pages/FundReport';
import CampaignReport from './pages/CampaignReport';
import MonthlyReport from './pages/MonthlyReport';
import DonorReport from './pages/DonorReport';
import CausesReport from './pages/CausesReport';
import Causes from './pages/Causes';
import Appeal from './pages/Appeal';
import Amount from './pages/Amount';
import FundList from './pages/FundList';
import FeaturedAmount from './pages/FeaturedAmount';
import FundAmount from './pages/FundAmount';
import Category from './pages/Category';
import Country from './pages/Country';
import './Dashboard.css';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    from: '01/01/2021',
    to: '11/21/2025'
  });

  const [timeFilter, setTimeFilter] = useState('yearly');

  const renderContent = () => {
    switch (currentPage) {
      case 'users':
        return <Users />;
      case 'permissions':
        return <Permissions />;
      case 'donors':
        return <Donors />;
      case 'donation':
        return <Donation />;
      case 'schedule':
        return <Schedule />;
      case 'configuration':
        return <Configuration />;
      case 'donations-report':
        return <DonationsReport />;
      case 'fund-report':
        return <FundReport />;
      case 'campaign-report':
        return <CampaignReport />;
      case 'monthly-report':
        return <MonthlyReport />;
      case 'donor-report':
        return <DonorReport />;
      case 'causes-report':
        return <CausesReport />;
      case 'causes':
        return <Causes />;
      case 'appeal':
        return <Appeal />;
      case 'amount':
        return <Amount />;
      case 'fund-list':
        return <FundList />;
      case 'featured-amount':
        return <FeaturedAmount />;
      case 'fund-amount':
        return <FundAmount />;
      case 'category':
        return <Category />;
      case 'country':
        return <Country />;
      case 'dashboard':
      default:
        return (
          <>
            <Header
              dateRange={dateRange}
              setDateRange={setDateRange}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
            />
            <DashboardContent timeFilter={timeFilter} />
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu={currentPage} onMenuChange={setCurrentPage} />
      <div className="dashboard-main">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
