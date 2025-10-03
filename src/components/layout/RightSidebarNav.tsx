'use client';

import { useState, useEffect, useCallback } from 'react';

const chartSections = [
  { id: "raised", label: "Raised", icon: "📊" },
  { id: "recurring-plans", label: "Recurring plans", icon: "🔄" },
  { id: "recurring-revenue", label: "Recurring revenue", icon: "💰" },
  // { id: "retention", label: "Retention", icon: "🎯" }, // Hidden for now
  // { id: "day-and-time", label: "Day and time", icon: "📅" }, // Hidden for now
  { id: "frequencies", label: "Frequencies", icon: "📊" },
  { id: "payment-methods", label: "Payment methods", icon: "💳" },
  { id: "funds", label: "Funds", icon: "🎯" },
  { id: "countries", label: "Countries", icon: "🌍" },
];

export default function RightSidebarNav() {
  const [activeSection, setActiveSection] = useState<string>("raised");

  const updateActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + 200; // Offset from top
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // If near bottom of page, activate last section
    if (window.scrollY + windowHeight >= documentHeight - 100) {
      const last = chartSections.at(-1);
      if (last) setActiveSection(last.id);
      return;
    }

    // Find the section currently in view
    for (const section of [...chartSections].reverse()) {
      const element = document.getElementById(section.id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const elementTop = window.scrollY + rect.top;

      // Check if we've scrolled past this section's top
      if (scrollPosition >= elementTop) {
        setActiveSection(section.id);
        return;
      }
    }

    // Default to first section if nothing matches
    const first = chartSections.at(0);
    if (first) setActiveSection(first.id);
  }, []);

  useEffect(() => {
    // Initial check
    updateActiveSection();

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [updateActiveSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100; // Offset for better positioning
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      // Immediately update active section for responsive feedback
      setActiveSection(sectionId);
    }
  };

  return (
    <aside className="hidden lg:block w-80 bg-white border border-gray-200 rounded-lg sticky top-6 self-start h-fit max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Sections</h3>
        <nav className="space-y-1">
          {chartSections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 text-left ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 pl-3"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent pl-3"
              }`}
            >
              <span className="text-base">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
