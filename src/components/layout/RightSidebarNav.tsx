"use client";

import React from 'react';
import { clsx } from 'clsx';

export interface NavItem {
  id: string;
  label: string;
}

interface RightSidebarNavProps {
  items: NavItem[];
}

export default function RightSidebarNav({ items }: RightSidebarNavProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 tracking-wider uppercase">Charts</div>
          <nav className="mt-1">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={clsx(
                      'block px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}

