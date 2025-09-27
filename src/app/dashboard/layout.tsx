'use client';

import { FilterProvider } from '@/providers/FilterProvider';

const chartSections = [
  { id: 'raised', label: 'Raised', icon: '📊' },
  { id: 'performance', label: 'Performance', icon: '📈' },
  { id: 'recurring-plans', label: 'Recurring plans', icon: '🔄' },
  { id: 'recurring-revenue', label: 'Recurring revenue', icon: '💰' },
  { id: 'retention', label: 'Retention', icon: '🎯' },
  { id: 'day-and-time', label: 'Day and time', icon: '📅' },
  { id: 'frequencies', label: 'Frequencies', icon: '📊' },
  { id: 'payment-methods', label: 'Payment methods', icon: '💳' },
  { id: 'designations', label: 'Designations', icon: '🏷️' },
  { id: 'countries', label: 'Countries', icon: '🌍' },
  { id: 'tributes', label: 'Tributes', icon: '❤️' },
  { id: 'fundraisers', label: 'Fundraisers', icon: '👥' },
  { id: 'url', label: 'URL', icon: '🔗' },
  { id: 'utm', label: 'UTM', icon: '📍' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Simple top header */}
      <header className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-gray-900'>Insights</h1>
          <div className='flex items-center gap-4'>
            <button className='text-gray-500 hover:text-gray-700'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-5 5v-5zM9 7H4l5-5v5z' />
              </svg>
            </button>
            <button className='text-gray-500 hover:text-gray-700'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            </button>
            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-sm font-medium'>AU</span>
            </div>
          </div>
        </div>
      </header>

      <div className='flex h-[calc(100vh-73px)]'>
        {/* Left Sidebar Navigation */}
        <aside className='w-64 bg-white border-r border-gray-200 overflow-y-auto'>
          <div className='p-4'>
            <nav className='space-y-1'>
              {chartSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className='w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors'
                >
                  <span className='text-base'>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto px-6 py-6'>
          <FilterProvider>
            {children}
          </FilterProvider>
        </main>
      </div>
    </div>
  );
}