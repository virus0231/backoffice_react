import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Dashboard.css";

const titleMap = {
  "/": "Dashboard",
  "/users": "Users",
  "/permissions": "Permissions",
  "/donors": "Donors",
  "/donation": "Donation",
  "/schedule": "Schedule",
  "/configuration": "Configuration",
  "/donations-report": "Donation Report",
  "/fund-report": "Fund Report",
  "/campaign-report": "Campaign Report",
  "/monthly-report": "Monthly Report",
  "/donor-report": "Donor Report",
  "/causes-report": "Causes Report",
  "/causes": "Causes",
  "/appeal": "Appeal",
  "/amount": "Amount",
  "/fund-list": "Fund List",
  "/featured-amount": "Featured Amount",
  "/fund-amount": "Fund-Amount",
  "/category": "Category",
  "/country": "Country",
};

const Dashboard = () => {
  const { pathname } = useLocation();
  const pageTitle = titleMap[pathname] || "Dashboard";

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header pageTitle={pageTitle} />
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
