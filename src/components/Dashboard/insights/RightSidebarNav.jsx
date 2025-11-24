import { useCallback, useEffect, useState } from "react";

const chartSections = [
  { id: "raised", label: "Raised", icon: "R" },
  { id: "recurring-plans", label: "Recurring plans", icon: "P" },
  { id: "recurring-revenue", label: "Recurring revenue", icon: "RR" },
  { id: "retention", label: "Retention", icon: "RE" },
  { id: "day-and-time", label: "Day and time", icon: "DT" },
  { id: "frequencies", label: "Frequencies", icon: "FQ" },
  { id: "payment-methods", label: "Payment methods", icon: "PM" },
  { id: "campaigns", label: "Campaigns", icon: "C" },
  { id: "countries", label: "Countries", icon: "CN" },
];

const RightSidebarNav = () => {
  const [activeSection, setActiveSection] = useState("raised");

  const updateActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + 200;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (window.scrollY + windowHeight >= documentHeight - 100) {
      const last = chartSections[chartSections.length - 1];
      if (last) setActiveSection(last.id);
      return;
    }

    for (let i = chartSections.length - 1; i >= 0; i -= 1) {
      const section = chartSections[i];
      const element = document.getElementById(section.id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const elementTop = window.scrollY + rect.top;

      if (scrollPosition >= elementTop) {
        setActiveSection(section.id);
        return;
      }
    }

    const first = chartSections[0];
    if (first) setActiveSection(first.id);
  }, []);

  useEffect(() => {
    updateActiveSection();

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [updateActiveSection]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <aside className="hidden lg:block w-80 bg-white border border-gray-200 rounded-lg sticky top-6 self-start h-fit max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
          Sections
        </h3>
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
              <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                {section.icon}
              </span>
              <span>{section.label}</span>
              {activeSection === section.id && (
                <div className="ml-auto w-1 h-6 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default RightSidebarNav;
