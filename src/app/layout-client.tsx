"use client";

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FilterProvider } from "@/providers/FilterProvider";
import RightSidebarNav from "@/components/layout/RightSidebarNav";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <FilterProvider>
          <div className="flex justify-center px-8 py-6">
            <div className="w-full max-w-7xl">
              <div className="flex gap-6">
                {/* Main Content - Centered */}
                <main className="flex-1 lg:max-w-[calc(100%-320px)]">
                  {children}
                </main>

                {/* Right Sidebar Navigation */}
                <RightSidebarNav />
              </div>
            </div>
          </div>
        </FilterProvider>
      </div>
    </ErrorBoundary>
  );
}
