import FilterBar from './FilterBar';
import PrimaryRevenueDashboard from './dashboards/PrimaryRevenueDashboard';
import RecurringPlansDashboard from './dashboards/RecurringPlansDashboard';
import RightSidebarNav from './RightSidebarNav';
import './InsightsPage.css';

const InsightsPage = () => {
  return (
    <div className="insights-page">
      <div className="insights-layout">
        <main className="insights-main">
          <div className="insights-content">
            {/* Global Filters Section */}
            <div className="filter-section">
              <FilterBar />
            </div>

            {/* Chart Sections */}
            <div className="dashboards-container">
              <div id="raised" className="dashboard-section">
                <PrimaryRevenueDashboard />
              </div>

              <div id="recurring-plans" className="dashboard-section">
                <RecurringPlansDashboard />
              </div>

              <div id="recurring-revenue" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Recurring Revenue Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>

              <div id="retention" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Retention Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>

              <div id="day-and-time" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Day and Time Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>

              <div id="frequencies" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Frequencies Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>

              <div id="payment-methods" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Payment Methods Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>

              <div id="campaigns" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Campaigns Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>

              <div id="countries" className="dashboard-section">
                <div className="dashboard-placeholder">
                  <h2>Countries Dashboard</h2>
                  <p>Coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar Navigation */}
        <aside className="insights-sidebar">
          <RightSidebarNav />
        </aside>
      </div>
    </div>
  );
};

export default InsightsPage;
