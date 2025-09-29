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
      <div className='flex h-screen'>
        {/* Main Content */}
        <main className='flex-1 overflow-y-auto px-6 py-6'>
          <FilterProvider>
            {children}
          </FilterProvider>
        </main>

        {/* Right Sidebar Navigation */}
        <aside className='w-64 bg-white border-l border-gray-200 overflow-y-auto'>
          <div className='p-4'>
            <nav className='space-y-1'>
              {chartSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className='w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors text-left'
                >
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
