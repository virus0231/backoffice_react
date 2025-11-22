import { useState, useEffect, useCallback } from 'react';
import './RightSidebarNav.css';

const chartSections = [
  { id: 'raised', label: 'Raised', icon: '📊' },
  { id: 'recurring-plans', label: 'Recurring plans', icon: '🔄' },
  { id: 'recurring-revenue', label: 'Recurring revenue', icon: '💰' },
  { id: 'retention', label: 'Retention', icon: '🎯' },
  { id: 'day-and-time', label: 'Day and time', icon: '📅' },
  { id: 'frequencies', label: 'Frequencies', icon: '📊' },
  { id: 'payment-methods', label: 'Payment methods', icon: '💳' },
  { id: 'campaigns', label: 'Campaigns', icon: '🎯' },
  { id: 'countries', label: 'Countries', icon: '🌍' }
];

const RightSidebarNav = () => {
  const [activeSection, setActiveSection] = useState('raised');

  const updateActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + 200;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // If near bottom of page, activate last section
    if (window.scrollY + windowHeight >= documentHeight - 100) {
      const last = chartSections[chartSections.length - 1];
      if (last) setActiveSection(last.id);
      return;
    }

    // Find the section currently in view
    for (let i = chartSections.length - 1; i >= 0; i--) {
      const section = chartSections[i];
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
    const first = chartSections[0];
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      // Immediately update active section for responsive feedback
      setActiveSection(sectionId);
    }
  };

  return (
    <aside className="right-sidebar-nav">
      <div className="sidebar-nav-content">
        <h3 className="sidebar-nav-title">Sections</h3>
        <nav className="sidebar-nav-list">
          {chartSections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">{section.icon}</span>
              <span className="sidebar-nav-label">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default RightSidebarNav;
