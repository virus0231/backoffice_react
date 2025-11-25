import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} />
      <div className="dashboard-main">
        <Header pageTitle={pageTitle} onMenuClick={handleMenuToggle} />
        <Outlet />
      </div>
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={handleCloseMobileMenu}></div>
      )}
    </div>
  );
};

export default Dashboard;
