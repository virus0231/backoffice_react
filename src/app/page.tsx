import FilterBar from "@/components/filters/FilterBar";
import PrimaryRevenueDashboard from "@/components/dashboard/PrimaryRevenueDashboard";
import RecurringPlansDashboard from "@/components/dashboard/RecurringPlansDashboard";
import RecurringRevenueDashboard from "@/components/dashboard/RecurringRevenueDashboard";
import FrequenciesDashboard from "@/components/dashboard/FrequenciesDashboard";
import PaymentMethodsDashboard from "@/components/dashboard/PaymentMethodsDashboard";
import RetentionDashboard from "@/components/dashboard/RetentionDashboard";
import DayAndTimeDashboard from "@/components/dashboard/DayAndTimeDashboard";
import FundsDashboard from "@/components/dashboard/FundsDashboard";
import CountriesDashboard from "@/components/dashboard/CountriesDashboard";
import AreaOverlayChart from "@/components/charts/AreaOverlayChart";
import GenericBarChart from "@/components/charts/GenericBarChart";
import DonutChart from "@/components/charts/DonutChart";
import HeatmapGrid from "@/components/charts/HeatmapGrid";

export default function DashboardPage() {
  // Mock data (replace with API wiring later)
  const mrrTrend = [
    { date: "2025-04-01", current: 12000, comparison: 10000 },
    { date: "2025-05-01", current: 13000, comparison: 10500 },
    { date: "2025-06-01", current: 15000, comparison: 11000 },
    { date: "2025-07-01", current: 15500, comparison: 12000 },
    { date: "2025-08-01", current: 16500, comparison: 12500 },
    { date: "2025-09-01", current: 18000, comparison: 13000 },
  ];

  const retentionCohort = [
    [6, 5, 5, 4, 3, 2],
    [7, 6, 5, 4, 3, 2],
    [8, 7, 6, 5, 4, 3],
    [9, 8, 7, 6, 5, 3],
    [7, 6, 5, 4, 3, 2],
    [6, 5, 4, 3, 2, 1],
  ];

  const dayTimeGrid = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 7))
  );

  const frequenciesData = [
    { label: "One-time", value: 54000 },
    { label: "Monthly", value: 38000 },
    { label: "Quarterly", value: 9000 },
    { label: "Annual", value: 12000 },
  ];

  const paymentMethods = [
    { name: "Card", value: 62 },
    { name: "PayPal", value: 18 },
    { name: "Bank Transfer", value: 12 },
    { name: "Apple Pay", value: 8 },
  ];

  const designationsData = [
    { designation: "General Fund", amount: 23000 },
    { designation: "Education", amount: 14000 },
    { designation: "Health", amount: 12000 },
    { designation: "Relief", amount: 8000 },
  ];

  const countriesData = [
    { country: "USA", amount: 54000 },
    { country: "UK", amount: 22000 },
    { country: "Canada", amount: 9000 },
    { country: "Australia", amount: 7000 },
    { country: "Germany", amount: 6000 },
  ];

  const fundraisersData = [
    { name: "Peer-to-Peer", amount: 18000 },
    { name: "Events", amount: 12000 },
    { name: "Teams", amount: 9000 },
  ];

  const urlData = [
    { path: "/donate", visits: 12000 },
    { path: "/campaign/spring", visits: 9800 },
    { path: "/campaign/summer", visits: 8600 },
    { path: "/blog/story-1", visits: 5400 },
    { path: "/give/monthly", visits: 4200 },
  ];

  const utmData = [
    { source: "Google", email: 3200, social: 4800, paid: 6200 },
    { source: "Facebook", email: 1800, social: 5200, paid: 2100 },
    { source: "Newsletter", email: 7400, social: 600, paid: 200 },
    { source: "Twitter", email: 600, social: 2100, paid: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Global Filters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-4 ml-4">Insights</h2>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <FilterBar layout="horizontal" />
        </div>
      </div>

      {/* Chart Sections */}
      <div className="space-y-8">
        {/* Raised Section */}
        <section
          id="raised"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Revenue Overview
            </h2>
          </div>
          <PrimaryRevenueDashboard />
        </section>

        {/* Recurring Plans Section */}
        <section
          id="recurring-plans"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <RecurringPlansDashboard />
        </section>

        {/* Recurring Revenue Section */}
        <section
          id="recurring-revenue"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <RecurringRevenueDashboard />
        </section>

        {/* Retention Section - Hidden for now */}
        {/* <section id="retention">
          <RetentionDashboard />
        </section> */}

        {/* Day and Time Section - Hidden for now */}
        {/* <section id="day-and-time">
          <DayAndTimeDashboard />
        </section> */}

        {/* Frequencies Section */}
        <section id="frequencies">
          <FrequenciesDashboard />
        </section>

        {/* Payment Methods Section */}
        <section id="payment-methods">
          <PaymentMethodsDashboard />
        </section>

        {/* Funds Section */}
        <section id="funds">
          <FundsDashboard />
        </section>

        {/* Countries Section */}
        <section id="countries">
          <CountriesDashboard />
        </section>
      </div>
    </div>
  );
}