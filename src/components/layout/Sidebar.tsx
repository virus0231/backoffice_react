'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
        />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z' />
      </svg>
    ),
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        />
      </svg>
    ),
  },
  {
    name: 'Donors',
    href: '/donors',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        />
      </svg>
    ),
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' />
      </svg>
    ),
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='dashboard-sidebar'>
      <div className='flex flex-col h-full'>
        {/* Logo */}
        <div className='flex items-center h-16 px-6 bg-white border-b border-gray-200'>
          <Link href='/' className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center'>
              <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
              </svg>
            </div>
            <span className='text-xl font-bold text-gray-900'>Insights</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto'>
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
                           (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <div
                  className={clsx(
                    'mr-3 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                >
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className='flex-shrink-0 p-4 border-t border-gray-200'>
          <div className='text-xs text-gray-500 text-center'>
            <p>Insights Dashboard</p>
            <p className='mt-1'>v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}