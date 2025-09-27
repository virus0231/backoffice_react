import FilterBar from '@/components/filters/FilterBar';
import PrimaryRevenueDashboard from '@/components/dashboard/PrimaryRevenueDashboard';

export default function DashboardPage() {
  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Fundraising Dashboard
          </h1>
          <p className='text-gray-600 mt-1'>
            Overview of your fundraising performance and key metrics
          </p>
        </div>
        <div className='mt-4 sm:mt-0 flex gap-3'>
          <button className='btn-secondary'>
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            Export Data
          </button>
          <button className='btn-primary'>
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div>
        {/* Filter bar for universal filters */}
        {/** Uses FilterProvider from layout */}
        {/** Keep simple horizontal layout */}
        <div className='filter-container'>
          <div className='mb-3'>
            <p className='text-sm text-gray-600'>Adjust filters below to update all charts.</p>
          </div>
          <FilterBar layout='horizontal' />
        </div>
      </div>

      {/* Primary Revenue Dashboard */}
      <PrimaryRevenueDashboard />

      {/* Key Metrics Cards (placeholder) */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='metric-card'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-metric-label'>Total Revenue</p>
              <p className='text-metric-value'>$0</p>
              <p className='text-metric-change text-metric-positive'>
                +0% from last month
              </p>
            </div>
            <div className='w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-primary-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-metric-label'>Total Donations</p>
              <p className='text-metric-value'>0</p>
              <p className='text-metric-change text-metric-positive'>
                +0% from last month
              </p>
            </div>
            <div className='w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-success-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-metric-label'>Active Donors</p>
              <p className='text-metric-value'>0</p>
              <p className='text-metric-change text-metric-positive'>
                +0% from last month
              </p>
            </div>
            <div className='w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-warning-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-metric-label'>Avg. Donation</p>
              <p className='text-metric-value'>$0</p>
              <p className='text-metric-change text-metric-positive'>
                +0% from last month
              </p>
            </div>
            <div className='w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-danger-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='chart-container'>
          <div className='chart-header'>
            <h3 className='chart-title'>Revenue Trends</h3>
            <button className='btn-ghost text-sm'>View Details</button>
          </div>
          <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-center'>
              <svg
                className='w-12 h-12 text-gray-400 mx-auto mb-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
              <p className='text-gray-500 text-sm'>
                Chart will be implemented in next story
              </p>
            </div>
          </div>
        </div>

        <div className='chart-container'>
          <div className='chart-header'>
            <h3 className='chart-title'>Donation Count</h3>
            <button className='btn-ghost text-sm'>View Details</button>
          </div>
          <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-center'>
              <svg
                className='w-12 h-12 text-gray-400 mx-auto mb-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              <p className='text-gray-500 text-sm'>
                Chart will be implemented in next story
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <svg
              className='w-5 h-5 text-primary-600 mt-0.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h4 className='text-sm font-semibold text-primary-800'>
              Foundation Complete
            </h4>
            <p className='text-sm text-primary-700 mt-1'>
              The basic project structure and responsive layout have been
              established. Database connections, filtering systems, and chart
              components will be implemented in subsequent stories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
