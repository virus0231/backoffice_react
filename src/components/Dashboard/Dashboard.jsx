import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import InsightsPage from "./insights/InsightsPage";
import Users from "./pages/Users";
import Permissions from "./pages/Permissions";
import Donors from "./pages/Donors";
import Donation from "./pages/Donation";
import Schedule from "./pages/Schedule";
import Configuration from "./pages/Configuration";
import DonationsReport from "./pages/DonationsReport";
import FundReport from "./pages/FundReport";
import CampaignReport from "./pages/CampaignReport";
import MonthlyReport from "./pages/MonthlyReport";
import DonorReport from "./pages/DonorReport";
import CausesReport from "./pages/CausesReport";
import Causes from "./pages/Causes";
import Appeal from "./pages/Appeal";
import Amount from "./pages/Amount";
import FundList from "./pages/FundList";
import FeaturedAmount from "./pages/FeaturedAmount";
import FundAmount from "./pages/FundAmount";
import Category from "./pages/Category";
import Country from "./pages/Country";
import { FilterProvider } from "@/providers/FilterProvider";
import RightSidebarNav from "@/components/layout/RightSidebarNav";
import BackToTop from "@/components/common/BackToTop";
import "./Dashboard.css";

function usePathname() {
  return "/";
}

function BackToTopVisibility() {
  const pathname = usePathname();
  const p = pathname || "";
  const hide =
    p.endsWith("/login") ||
    p.endsWith("/add_user") ||
    p.endsWith("/admin/add-user");
  if (hide) return null;
  return <BackToTop />;
}

function RightColumn() {
  const pathname = usePathname();
  const p = pathname || "";
  const hide =
    p.endsWith("/login") ||
    p.endsWith("/add_user") ||
    p.endsWith("/admin/add-user");
  if (hide) return null;
  return (
    <div className="hidden lg:flex flex-col w-80 gap-4">
      <RightSidebarNav />
    </div>
  );
}

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderContent = () => {
    switch (currentPage) {
      case "users":
        return <Users />;
      case "permissions":
        return <Permissions />;
      case "donors":
        return <Donors />;
      case "donation":
        return <Donation />;
      case "schedule":
        return <Schedule />;
      case "configuration":
        return <Configuration />;
      case "donations-report":
        return <DonationsReport />;
      case "fund-report":
        return <FundReport />;
      case "campaign-report":
        return <CampaignReport />;
      case "monthly-report":
        return <MonthlyReport />;
      case "donor-report":
        return <DonorReport />;
      case "causes-report":
        return <CausesReport />;
      case "causes":
        return <Causes />;
      case "appeal":
        return <Appeal />;
      case "amount":
        return <Amount />;
      case "fund-list":
        return <FundList />;
      case "featured-amount":
        return <FeaturedAmount />;
      case "fund-amount":
        return <FundAmount />;
      case "category":
        return <Category />;
      case "country":
        return <Country />;
      case "dashboard":
      default:
        return (
          <>
            <FilterProvider>
              <div className="flex justify-center px-8 py-6">
                <div className="w-full max-w-7xl">
                  <div className="flex gap-6">
                    {/* Main Content - Centered */}
                    <main className="flex-1 lg:max-w-[calc(100%-320px)]">
                      <InsightsPage />
                    </main>

                    {/* Right Column (hidden on auth pages) */}
                    <RightColumn />
                  </div>
                </div>
              </div>
              <BackToTopVisibility />
            </FilterProvider>
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu={currentPage} onMenuChange={setCurrentPage} />
      <div className="dashboard-main">
        <Header />
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
