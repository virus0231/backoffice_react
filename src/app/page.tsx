import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Header */}
          <div className='mb-12'>
            <h1 className='text-5xl font-bold text-gray-900 mb-6'>
              Welcome to{' '}
              <span className='bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent'>
                Insights
              </span>
            </h1>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
              Transform your fundraising data into actionable insights with our
              comprehensive analytics dashboard. Built for nonprofits who want
              complete control over their data.
            </p>
          </div>

          {/* Feature Grid */}
          <div className='grid md:grid-cols-3 gap-8 mb-12'>
            <div className='bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-200'>
              <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                <svg
                  className='w-6 h-6 text-primary-600'
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
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Advanced Analytics
              </h3>
              <p className='text-gray-600'>
                Comprehensive charts and metrics for donations, donors, and
                campaign performance analysis.
              </p>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-200'>
              <div className='w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                <svg
                  className='w-6 h-6 text-success-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Data Ownership
              </h3>
              <p className='text-gray-600'>
                Full control over your fundraising data with direct MySQL
                database connections.
              </p>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-200'>
              <div className='w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                <svg
                  className='w-6 h-6 text-warning-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Customizable
              </h3>
              <p className='text-gray-600'>
                Flexible filtering, comparison tools, and export capabilities
                tailored to your needs.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/dashboard'
              className='btn-primary px-8 py-3 text-base font-semibold'
            >
              Open Dashboard
            </Link>
            <Link
              href='/dashboard'
              className='btn-secondary px-8 py-3 text-base font-semibold'
            >
              View Analytics
            </Link>
          </div>

          {/* Status Note */}
          <div className='mt-12 p-4 bg-primary-50 rounded-lg border border-primary-200'>
            <p className='text-sm text-primary-700'>
              <span className='font-semibold'>Status:</span> Foundation setup
              complete. Dashboard components are being implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}