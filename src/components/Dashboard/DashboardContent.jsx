import PopularProductChart from "./charts/PopularProductChart";
import PopularProductList from "./charts/PopularProductList";
import AppealRevenueChart from "./charts/AppealRevenueChart";
import WeeklyTransactionChart from "./charts/WeeklyTransactionChart";
import MonthlyRevenueChart from "./charts/MonthlyRevenueChart";
import "./dashboardContent.css";

const DashboardContent = ({ timeFilter }) => {
  return (
    <div className="dashboard-content">
      <div className="charts-row">
        <div className="chart-card half">
          <h3 className="chart-title">Popular Product</h3>
          <PopularProductChart />
        </div>
        <div className="chart-card half">
          <h3 className="chart-title">Popular Product</h3>
          <PopularProductList />
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card full">
          <h3 className="chart-title">Appeal Revenue</h3>
          <AppealRevenueChart />
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card full">
          <h3 className="chart-title">Weekly Transaction Revenue</h3>
          <WeeklyTransactionChart />
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card full">
          <h3 className="chart-title">Monthly Revenue</h3>
          <MonthlyRevenueChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
