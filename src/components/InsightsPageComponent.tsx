import FilterBar from "@/components/filters/FilterBar";
import PrimaryRevenueDashboard from "@/components/dashboard/PrimaryRevenueDashboard";
import RecurringPlansDashboard from "@/components/dashboard/RecurringPlansDashboard";
import RecurringRevenueDashboard from "@/components/dashboard/RecurringRevenueDashboard";
import FrequenciesDashboard from "@/components/dashboard/FrequenciesDashboard";
import PaymentMethodsDashboard from "@/components/dashboard/PaymentMethodsDashboard";
import RetentionDashboard from "@/components/dashboard/RetentionDashboard";
import DayAndTimeDashboard from "@/components/dashboard/DayAndTimeDashboard";
import CampaignsDashboard from "@/components/dashboard/CampaignsDashboard";
import CountriesDashboard from "@/components/dashboard/CountriesDashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Global Filters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-4 ml-4">
            Insights
          </h2>
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
        <section id="retention">
          <RetentionDashboard />
        </section>

        {/* Day and Time Section - Hidden for now */}
        <section id="day-and-time">
          <DayAndTimeDashboard />
        </section>

        {/* Frequencies Section */}
        <section id="frequencies">
          <FrequenciesDashboard />
        </section>

        {/* Payment Methods Section */}
        <section id="payment-methods">
          <PaymentMethodsDashboard />
        </section>

        {/* Funds Section */}
        <section id="campaigns">
          <CampaignsDashboard />
        </section>

        {/* Countries Section */}
        <section id="countries">
          <CountriesDashboard />
        </section>
      </div>
    </div>
  );
}
