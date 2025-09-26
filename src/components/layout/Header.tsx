'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className='dashboard-header'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Mobile menu button */}
          <div className='flex items-center lg:hidden'>
            <button
              type='button'
              className='text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            >
              <svg
                className='h-6 w-6'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>

          {/* Left section - Search */}
          <div className='flex-1 flex justify-start lg:justify-center'>
            <div className='max-w-lg w-full lg:max-w-xs'>
              <label htmlFor='search' className='sr-only'>
                Search
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <input
                  id='search'
                  name='search'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  placeholder='Search donors, campaigns...'
                  type='search'
                />
              </div>
            </div>
          </div>

          {/* Right section - User menu and notifications */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            <button
              className='text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out'
              aria-label='View notifications'
            >
              <svg className='h-6 w-6' stroke='currentColor' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                />
              </svg>
            </button>

            {/* Settings */}
            <button
              className='text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out'
              aria-label='Open settings'
            >
              <svg className='h-6 w-6' stroke='currentColor' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            </button>

            {/* User menu */}
            <div className='relative'>
              <button
                className='max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                aria-label='Open user menu'
              >
                <Image
                  className='h-8 w-8 rounded-full'
                  src='https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
                  alt='User avatar'
                  width={32}
                  height={32}
                />
                <span className='hidden md:block ml-3 text-gray-700 text-sm font-medium'>
                  Admin User
                </span>
                <svg className='hidden md:block ml-2 h-4 w-4 text-gray-400' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}