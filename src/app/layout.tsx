"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FilterProvider } from "@/providers/FilterProvider";
import { useState, useEffect } from "react";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const chartSections = [
  { id: "raised", label: "Raised", icon: "📊" },
  { id: "performance", label: "Performance", icon: "📈" },
  { id: "recurring-plans", label: "Recurring plans", icon: "🔄" },
  { id: "recurring-revenue", label: "Recurring revenue", icon: "💰" },
  { id: "retention", label: "Retention", icon: "🎯" },
  { id: "day-and-time", label: "Day and time", icon: "📅" },
  { id: "frequencies", label: "Frequencies", icon: "📊" },
  { id: "payment-methods", label: "Payment methods", icon: "💳" },
  { id: "designations", label: "Designations", icon: "🏷️" },
  { id: "countries", label: "Countries", icon: "🌍" },
  { id: "tributes", label: "Tributes", icon: "❤️" },
  { id: "fundraisers", label: "Fundraisers", icon: "👥" },
  { id: "url", label: "URL", icon: "🔗" },
  { id: "utm", label: "UTM", icon: "📍" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState<string>("raised");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
    );

    chartSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <html lang='en' className={inter.variable}>
      <body className={`${inter.className} font-inter antialiased`}>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <FilterProvider>
              <div className="px-8 py-6">
                <div className="flex gap-6">
                  {/* Main Content - 80% width on desktop, full width on mobile */}
                  <main className="flex-1 lg:max-w-[calc(100%-320px)]">
                    {children}
                  </main>

                  {/* Right Sidebar Navigation - Hidden on mobile, visible on desktop */}
                  <aside className="hidden lg:block w-80 bg-gray-100 border border-gray-200 rounded-lg sticky top-6 self-start">
                    <div className="p-6">
                      <nav className="space-y-2">
                        {chartSections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors text-left ${
                              activeSection === section.id
                                ? "bg-white text-gray-900 font-medium shadow-sm"
                                : "text-gray-700 hover:bg-white hover:text-gray-900"
                            }`}
                          >
                            <span>{section.icon}</span>
                            <span>{section.label}</span>
                          </button>
                        ))}
                      </nav>
                    </div>
                  </aside>
                </div>
              </div>
            </FilterProvider>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}