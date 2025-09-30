import FilterBar from "@/components/filters/FilterBar";
import PrimaryRevenueDashboard from "@/components/dashboard/PrimaryRevenueDashboard";
import AreaOverlayChart from "@/components/charts/AreaOverlayChart";
import GenericBarChart from "@/components/charts/GenericBarChart";
import DonutChart from "@/components/charts/DonutChart";
import HeatmapGrid from "@/components/charts/HeatmapGrid";

export default function DashboardPage() {
  // Mock data (replace with API wiring later)
  const performanceTrend = [
    { date: "2025-01-01", current: 22000, comparison: 20000 },
    { date: "2025-02-01", current: 26000, comparison: 21000 },
    { date: "2025-03-01", current: 24000, comparison: 23000 },
    { date: "2025-04-01", current: 30000, comparison: 24000 },
    { date: "2025-05-01", current: 28000, comparison: 25000 },
    { date: "2025-06-01", current: 32000, comparison: 26000 },
    { date: "2025-07-01", current: 34000, comparison: 27000 },
    { date: "2025-08-01", current: 36000, comparison: 28000 },
    { date: "2025-09-01", current: 38000, comparison: 30000 },
  ];

  const mrrTrend = [
    { date: "2025-04-01", current: 12000, comparison: 10000 },
    { date: "2025-05-01", current: 13000, comparison: 10500 },
    { date: "2025-06-01", current: 15000, comparison: 11000 },
    { date: "2025-07-01", current: 15500, comparison: 12000 },
    { date: "2025-08-01", current: 16500, comparison: 12500 },
    { date: "2025-09-01", current: 18000, comparison: 13000 },
  ];

  const recurringPlans = [
    { plan: "Monthly", count: 640 },
    { plan: "Quarterly", count: 120 },
    { plan: "Annual", count: 85 },
    { plan: "Weekly", count: 40 },
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

  const tributesData = [
    { type: "In Honor", count: 120 },
    { type: "In Memory", count: 85 },
    { type: "Other", count: 20 },
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

        {/* Performance Section */}
        <section
          id="performance"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                All donations
              </button>
            </div>
          </div>
          {/* Metric tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$38,000</div>
              <div className="text-sm text-gray-600">Total raised</div>
              <div className="text-xs text-green-600 mt-1">
                +12% from previous period
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1,245</div>
              <div className="text-sm text-gray-600">Donations</div>
              <div className="text-xs text-green-600 mt-1">
                +5% from previous period
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$31</div>
              <div className="text-sm text-gray-600">Average</div>
              <div className="text-xs text-green-600 mt-1">
                +2% from previous period
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3.2%</div>
              <div className="text-sm text-gray-600">Conversion rate</div>
              <div className="text-xs text-green-600 mt-1">
                +0.3% from previous period
              </div>
            </div>
          </div>
          <AreaOverlayChart data={performanceTrend} granularity="weekly" />
        </section>

        {/* Recurring Plans Section */}
        <section
          id="recurring-plans"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recurring plans
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={recurringPlans}
            xKey="plan"
            ySeries={[{ key: "count", name: "Plans", color: "#2563eb" }]}
          />
        </section>

        {/* Recurring Revenue Section */}
        <section
          id="recurring-revenue"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recurring revenue
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                All donations
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Monthly recurring revenue
              </div>
              <div className="text-3xl font-bold text-gray-900">$18,000</div>
              <div className="text-sm text-gray-600 mt-1">
                1,042 active recurring donations
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Net new MRR
              </div>
              <div className="text-3xl font-bold text-gray-900">$1,250</div>
              <div className="text-sm text-gray-600 mt-1">
                Monthly change in recurring revenue
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Retention rate
              </div>
              <div className="text-3xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600 mt-1">
                Percentage of recurring donors retained
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaOverlayChart data={mrrTrend} granularity="weekly" />
            <div className="chart-container p-3">
              <div className="chart-header">
                <h3 className="chart-title">Retention Cohorts</h3>
              </div>
              <HeatmapGrid
                data={retentionCohort}
                rowLabels={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]}
                colLabels={["M0", "M1", "M2", "M3", "M4", "M5"]}
                height={260}
              />
            </div>
          </div>
        </section>

        {/* Retention Section */}
        <section
          id="retention"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Retention</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                All time
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-4">
                Audience breakdown
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">New recurring donors</span>
                  <span className="font-medium">324</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Returning recurring donors
                  </span>
                  <span className="font-medium">718</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled subscriptions</span>
                  <span className="font-medium">57</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-4">
                Geographic distribution
              </div>
              <HeatmapGrid
                data={Array.from({ length: 5 }, () =>
                  Array.from({ length: 10 }, () =>
                    Math.floor(Math.random() * 6)
                  )
                )}
                rowLabels={["NA", "EU", "AS", "SA", "AF"]}
                colLabels={["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]}
                height={200}
              />
            </div>
          </div>
        </section>

        {/* Day and Time Section */}
        <section
          id="day-and-time"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Day and time
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 365 days
              </button>
            </div>
          </div>
          <HeatmapGrid
            data={dayTimeGrid}
            rowLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
            colLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
            height={240}
          />
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </section>

        {/* Frequencies Section */}
        <section
          id="frequencies"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Frequencies</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={frequenciesData}
            xKey="label"
            ySeries={[{ key: "value", name: "Amount", color: "#2563eb" }]}
          />
        </section>

        {/* Payment Methods Section */}
        <section
          id="payment-methods"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Payment methods
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <DonutChart data={paymentMethods} />
        </section>

        {/* Designations Section */}
        <section
          id="designations"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Designations
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={designationsData}
            xKey="designation"
            ySeries={[{ key: "amount", name: "Raised", color: "#2563eb" }]}
          />
        </section>

        {/* Countries Section */}
        <section
          id="countries"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Countries</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={countriesData}
            xKey="country"
            ySeries={[{ key: "amount", name: "Raised", color: "#2563eb" }]}
            horizontal
          />
        </section>

        {/* Tributes Section */}
        <section
          id="tributes"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Tributes</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={tributesData}
            xKey="type"
            ySeries={[{ key: "count", name: "Count", color: "#2563eb" }]}
          />
        </section>

        {/* Fundraisers Section */}
        <section
          id="fundraisers"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Fundraisers</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={fundraisersData}
            xKey="name"
            ySeries={[{ key: "amount", name: "Raised", color: "#2563eb" }]}
          />
        </section>

        {/* URL Section */}
        <section
          id="url"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">URL</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={urlData}
            xKey="path"
            ySeries={[{ key: "visits", name: "Visits", color: "#2563eb" }]}
            horizontal
          />
        </section>

        {/* UTM Section */}
        <section
          id="utm"
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">UTM</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                Last 30 days
              </button>
            </div>
          </div>
          <GenericBarChart
            data={utmData}
            xKey="source"
            ySeries={[
              { key: "email", name: "Email", color: "#2563eb", stackId: "utm" },
              {
                key: "social",
                name: "Social",
                color: "#16a34a",
                stackId: "utm",
              },
              { key: "paid", name: "Paid", color: "#f59e0b", stackId: "utm" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}