"use client";

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FilterProvider } from "@/providers/FilterProvider";
import RightSidebarNav from "@/components/layout/RightSidebarNav";
import ProfilePanel from "@/components/layout/ProfilePanel";
import { AuthProvider, AuthGate } from "@/providers/AuthProvider";
import { usePathname } from 'next/navigation';
import BackToTop from "@/components/common/BackToTop";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate>
          <div className="min-h-screen bg-gray-50">
            <FilterProvider>
              <div className="flex justify-center px-8 py-6">
                <div className="w-full max-w-7xl">
                  <div className="flex gap-6">
                    {/* Main Content - Centered */}
                    <main className="flex-1 lg:max-w-[calc(100%-320px)]">
                      {children}
                    </main>

                    {/* Right Column (hidden on auth pages) */}
                    <RightColumn />
                  </div>
                </div>
              </div>
              <BackToTopVisibility />
            </FilterProvider>
          </div>
        </AuthGate>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function RightColumn() {
  const pathname = usePathname();
  const hide = pathname === '/login' || pathname === '/add_user';
  if (hide) return null;
  return (
    <div className="hidden lg:flex flex-col w-80 gap-4">
      <ProfilePanel />
      <RightSidebarNav />
    </div>
  );
}

function BackToTopVisibility() {
  const pathname = usePathname();
  const hide = pathname === '/login' || pathname === '/add_user';
  if (hide) return null;
  return <BackToTop />;
}
