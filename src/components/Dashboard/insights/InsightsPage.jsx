import FilterBar from './FilterBar';
import PrimaryRevenueDashboard from './dashboards/PrimaryRevenueDashboard';
import RecurringPlansDashboard from './dashboards/RecurringPlansDashboard';
import RecurringRevenueDashboard from './dashboards/RecurringRevenueDashboard';
import FrequenciesDashboard from './dashboards/FrequenciesDashboard';
import PaymentMethodsDashboard from './dashboards/PaymentMethodsDashboard';
import RetentionDashboard from './dashboards/RetentionDashboard';
import DayAndTimeDashboard from './dashboards/DayAndTimeDashboard';
import CampaignsDashboard from './dashboards/CampaignsDashboard';
import CountriesDashboard from './dashboards/CountriesDashboard';
import RightSidebarNav from './RightSidebarNav';

const InsightsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-6 lg:p-8">
      <div className="flex gap-6 max-w-[1536px] mx-auto">
        <main className="flex-1 max-w-[calc(100%-320px)]">
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-4 ml-4">
                  Insights
                </h2>
              </div>
              <div className="bg-gray-50 p-4">
                <FilterBar layout="horizontal" />
              </div>
            </div>

            {/* Chart Sections */}
            <div className="flex flex-col gap-8">
              <section id="raised" className="scroll-mt-8">
                <PrimaryRevenueDashboard />
              </section>

              <section id="recurring-plans" className="scroll-mt-8">
                <RecurringPlansDashboard />
              </section>

              <section id="recurring-revenue" className="scroll-mt-8">
                <RecurringRevenueDashboard />
              </section>

              <section id="retention" className="scroll-mt-8">
                <RetentionDashboard />
              </section>

              <section id="day-and-time" className="scroll-mt-8">
                <DayAndTimeDashboard />
              </section>

              <section id="frequencies" className="scroll-mt-8">
                <FrequenciesDashboard />
              </section>

              <section id="payment-methods" className="scroll-mt-8">
                <PaymentMethodsDashboard />
              </section>

              <section id="campaigns" className="scroll-mt-8">
                <CampaignsDashboard />
              </section>

              <section id="countries" className="scroll-mt-8">
                <CountriesDashboard />
              </section>
            </div>
          </div>
        </main>

        {/* Right Sidebar Navigation */}
        <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-6 self-start h-fit">
          <RightSidebarNav />
        </aside>
      </div>
    </div>
  );
};

export default InsightsPage;
