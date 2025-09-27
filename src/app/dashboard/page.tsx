import FilterBar from '@/components/filters/FilterBar';
import PrimaryRevenueDashboard from '@/components/dashboard/PrimaryRevenueDashboard';

export default function DashboardPage() {
  return (
    <div className='max-w-none space-y-8'>
      {/* Page Title */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Fundraising Dashboard</h1>
        <p className='text-gray-600'>Fundraising Dashboard allows you to track your campaign metrics</p>
      </div>

      {/* Global Filters */}
      <div className='bg-white rounded-lg border border-gray-200 p-6 mb-8'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Filters</h2>
        <FilterBar layout='horizontal' />
      </div>

      {/* Chart Sections */}
      <div className='space-y-8'>

        {/* Raised Section */}
        <section id='raised' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Revenue Overview</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded'>Weekly</button>
            </div>
          </div>
          <PrimaryRevenueDashboard />
        </section>

        {/* Performance Section */}
        <section id='performance' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Performance</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>All donations</button>
            </div>
          </div>

          {/* Performance metrics grid */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>$0</div>
              <div className='text-sm text-gray-600'>Total raised</div>
              <div className='text-xs text-green-600 mt-1'>+0% from previous period</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>0</div>
              <div className='text-sm text-gray-600'>Donations</div>
              <div className='text-xs text-green-600 mt-1'>+0% from previous period</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>$0</div>
              <div className='text-sm text-gray-600'>Average</div>
              <div className='text-xs text-green-600 mt-1'>+0% from previous period</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>0</div>
              <div className='text-sm text-gray-600'>Conversion rate</div>
              <div className='text-xs text-green-600 mt-1'>+0% from previous period</div>
            </div>
          </div>

          {/* Performance chart placeholder */}
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>📊</div>
              <p className='text-gray-500'>Performance trends chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Recurring Plans Section */}
        <section id='recurring-plans' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Recurring plans</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>🔄</div>
              <p className='text-gray-500'>Recurring plans chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Recurring Revenue Section */}
        <section id='recurring-revenue' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Recurring revenue</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>All donations</button>
            </div>
          </div>

          {/* Recurring metrics grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div>
              <div className='text-lg font-semibold text-gray-900 mb-2'>Monthly recurring revenue</div>
              <div className='text-3xl font-bold text-gray-900'>$0</div>
              <div className='text-sm text-gray-600 mt-1'>0 active recurring donations</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-gray-900 mb-2'>Net new MRR</div>
              <div className='text-3xl font-bold text-gray-900'>$0</div>
              <div className='text-sm text-gray-600 mt-1'>Monthly change in recurring revenue</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-gray-900 mb-2'>Retention rate</div>
              <div className='text-3xl font-bold text-gray-900'>0%</div>
              <div className='text-sm text-gray-600 mt-1'>Percentage of recurring donors retained</div>
            </div>
          </div>

          {/* Charts grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-gray-400 mb-2'>📈</div>
                <p className='text-gray-500'>MRR growth chart</p>
              </div>
            </div>
            <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-gray-400 mb-2'>🔄</div>
                <p className='text-gray-500'>Retention cohort chart</p>
              </div>
            </div>
          </div>
        </section>

        {/* Retention Section */}
        <section id='retention' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Retention</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>All time</button>
            </div>
          </div>

          {/* Retention metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div>
              <div className='text-lg font-semibold text-gray-900 mb-4'>Audience breakdown</div>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>New recurring donors</span>
                  <span className='font-medium'>0</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Returning recurring donors</span>
                  <span className='font-medium'>0</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Cancelled subscriptions</span>
                  <span className='font-medium'>0</span>
                </div>
              </div>
            </div>
            <div>
              <div className='text-lg font-semibold text-gray-900 mb-4'>Geographic distribution</div>
              <div className='h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-gray-400 mb-2'>🗺️</div>
                  <p className='text-gray-500'>Geographic heatmap</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Day and Time Section */}
        <section id='day-and-time' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Day and time</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 365 days</button>
            </div>
          </div>

          {/* Heatmap placeholder */}
          <div className='h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>🔥</div>
              <p className='text-gray-500'>Daily donations heatmap (365 days)</p>
            </div>
          </div>

          {/* Heatmap legend */}
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <span>Less</span>
            <div className='flex gap-1'>
              <div className='w-3 h-3 bg-gray-100 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-100 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-300 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-500 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-700 rounded-sm'></div>
            </div>
            <span>More</span>
          </div>
        </section>

        {/* Frequencies Section */}
        <section id='frequencies' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Frequencies</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>📊</div>
              <p className='text-gray-500'>Donation frequency chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Payment Methods Section */}
        <section id='payment-methods' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Payment methods</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>💳</div>
              <p className='text-gray-500'>Payment method breakdown</p>
            </div>
          </div>
        </section>

        {/* Designations Section */}
        <section id='designations' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Designations</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>🏷️</div>
              <p className='text-gray-500'>Designations chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Countries Section */}
        <section id='countries' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Countries</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>🌍</div>
              <p className='text-gray-500'>Countries chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Tributes Section */}
        <section id='tributes' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Tributes</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>❤️</div>
              <p className='text-gray-500'>Tributes chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Fundraisers Section */}
        <section id='fundraisers' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Fundraisers</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>👥</div>
              <p className='text-gray-500'>Fundraisers chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* URL Section */}
        <section id='url' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>URL</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>🔗</div>
              <p className='text-gray-500'>URL analytics chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* UTM Section */}
        <section id='utm' className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>UTM</h2>
            <div className='flex gap-2'>
              <button className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded'>Last 30 days</button>
            </div>
          </div>
          <div className='h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-gray-400 mb-2'>📍</div>
              <p className='text-gray-500'>UTM parameters chart will be implemented</p>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <svg className='w-5 h-5 text-blue-600 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div className='ml-3'>
              <h4 className='text-sm font-semibold text-blue-800'>Dashboard Structure Complete</h4>
              <p className='text-sm text-blue-700 mt-1'>
                This dashboard now includes all chart sections with sidebar navigation and smooth scrolling. Each section will be implemented with exact chart layouts from the provided screenshots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}