import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';

// Mock Next.js navigation hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar Component', () => {
  const defaultNavigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Donors', href: '/donors' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Reports', href: '/reports' },
  ];

  beforeEach(() => {
    // Default to dashboard route
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the sidebar with correct structure', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('navigation');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.closest('.dashboard-sidebar')).toBeInTheDocument();
    });

    it('renders the logo and app name', () => {
      render(<Sidebar />);

      const logoLink = screen.getByRole('link', { name: /insights/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');

      const appName = screen.getByText('Insights');
      expect(appName).toBeInTheDocument();
      expect(appName).toHaveClass('text-xl', 'font-bold', 'text-gray-900');
    });

    it('renders all navigation items', () => {
      render(<Sidebar />);

      defaultNavigation.forEach(item => {
        const navLink = screen.getByRole('link', { name: item.name });
        expect(navLink).toBeInTheDocument();
        expect(navLink).toHaveAttribute('href', item.href);
      });
    });

    it('renders navigation items with icons', () => {
      render(<Sidebar />);

      // Check that each navigation item has an SVG icon
      defaultNavigation.forEach(item => {
        const navLink = screen.getByRole('link', { name: item.name });
        const icon = navLink.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('w-5', 'h-5');
      });
    });

    it('renders footer with version information', () => {
      render(<Sidebar />);

      expect(screen.getByText('Insights Dashboard')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });
  });

  describe('Active State Management', () => {
    it('highlights the dashboard nav item when on root path', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveClass('bg-primary-100', 'text-primary-700');
      expect(dashboardLink).not.toHaveClass('text-gray-600');
    });

    it('highlights analytics nav item when on analytics path', () => {
      mockUsePathname.mockReturnValue('/analytics');
      render(<Sidebar />);

      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
      expect(analyticsLink).toHaveClass('bg-primary-100', 'text-primary-700');

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveClass('text-gray-600');
      expect(dashboardLink).not.toHaveClass('bg-primary-100');
    });

    it('highlights nav item when on subpath', () => {
      mockUsePathname.mockReturnValue('/analytics/revenue');
      render(<Sidebar />);

      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
      expect(analyticsLink).toHaveClass('bg-primary-100', 'text-primary-700');
    });

    it('does not highlight dashboard for subpaths of other routes', () => {
      mockUsePathname.mockReturnValue('/analytics/revenue');
      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveClass('text-gray-600');
      expect(dashboardLink).not.toHaveClass('bg-primary-100');
    });

    it('applies correct icon colors for active state', () => {
      mockUsePathname.mockReturnValue('/donors');
      render(<Sidebar />);

      const donorsLink = screen.getByRole('link', { name: 'Donors' });
      const iconWrapper = donorsLink.querySelector('.mr-3');
      expect(iconWrapper).toHaveClass('text-primary-600');
      expect(iconWrapper).not.toHaveClass('text-gray-400');
    });

    it('applies correct icon colors for inactive state', () => {
      mockUsePathname.mockReturnValue('/donors');
      render(<Sidebar />);

      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
      const iconWrapper = analyticsLink.querySelector('.mr-3');
      expect(iconWrapper).toHaveClass('text-gray-400');
      expect(iconWrapper).not.toHaveClass('text-primary-600');
    });
  });

  describe('Navigation Functionality', () => {
    it('all navigation links are clickable', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      for (const item of defaultNavigation) {
        const navLink = screen.getByRole('link', { name: item.name });
        expect(navLink).toBeInTheDocument();
        // Links should be clickable (not disabled)
        expect(navLink).not.toHaveAttribute('disabled');
      }
    });

    it('logo link navigates to home', () => {
      render(<Sidebar />);

      const logoLink = screen.getByRole('link', { name: /insights/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const logoLink = screen.getByRole('link', { name: /insights/i });
      logoLink.focus();

      // Tab should move to first nav item
      await user.tab();
      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();

      // Continue tabbing through nav items
      await user.tab();
      expect(screen.getByRole('link', { name: 'Analytics' })).toHaveFocus();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes to main container', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('.dashboard-sidebar');
      expect(sidebar).toHaveClass('dashboard-sidebar');
    });

    it('applies hover states correctly', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Sidebar />);

      // Inactive nav items should have hover classes
      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
      expect(analyticsLink).toHaveClass('hover:bg-gray-100', 'hover:text-gray-900');

      // Active nav item should not have hover classes
      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).not.toHaveClass('hover:bg-gray-100');
    });

    it('applies correct layout classes', () => {
      render(<Sidebar />);

      const flexContainer = document.querySelector('.flex.flex-col.h-full');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('Logo and Branding', () => {
    it('renders logo with correct styling', () => {
      render(<Sidebar />);

      const logoContainer = screen.getByRole('link', { name: /insights/i }).querySelector('div');
      expect(logoContainer).toHaveClass(
        'w-8',
        'h-8',
        'bg-gradient-to-br',
        'from-primary-500',
        'to-primary-700',
        'rounded-lg'
      );
    });

    it('renders logo icon correctly', () => {
      render(<Sidebar />);

      const logoIcon = screen.getByRole('link', { name: /insights/i }).querySelector('svg');
      expect(logoIcon).toBeInTheDocument();
      expect(logoIcon).toHaveClass('w-5', 'h-5', 'text-white');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      render(<Sidebar />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(6); // 5 nav items + logo
    });

    it('provides accessible navigation structure', () => {
      render(<Sidebar />);

      const navSection = screen.getByRole('navigation');
      expect(navSection).toBeInTheDocument();

      // All navigation items should be within the nav element
      defaultNavigation.forEach(item => {
        const link = screen.getByRole('link', { name: item.name });
        expect(navSection).toContainElement(link);
      });
    });

    it('supports screen readers with proper text content', () => {
      render(<Sidebar />);

      // Each nav item should have accessible text
      defaultNavigation.forEach(item => {
        const link = screen.getByRole('link', { name: item.name });
        expect(link).toHaveTextContent(item.name);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined pathname gracefully', () => {
      mockUsePathname.mockReturnValue(undefined as any);

      expect(() => render(<Sidebar />)).not.toThrow();

      // Should not highlight any nav items
      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveClass('text-gray-600');
    });

    it('handles empty pathname gracefully', () => {
      mockUsePathname.mockReturnValue('');

      expect(() => render(<Sidebar />)).not.toThrow();
    });

    it('handles very long pathnames', () => {
      const longPath = '/analytics/' + 'a'.repeat(1000);
      mockUsePathname.mockReturnValue(longPath);

      expect(() => render(<Sidebar />)).not.toThrow();

      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
      expect(analyticsLink).toHaveClass('bg-primary-100', 'text-primary-700');
    });
  });

  describe('Component Structure', () => {
    it('maintains proper component hierarchy', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('.dashboard-sidebar');
      const flexContainer = sidebar?.querySelector('.flex.flex-col.h-full');

      expect(flexContainer).toBeInTheDocument();

      // Should have logo section, nav section, and footer
      const logoSection = flexContainer?.querySelector('.flex.items-center.h-16');
      const navSection = flexContainer?.querySelector('nav');
      const footerSection = flexContainer?.querySelector('.flex-shrink-0.p-4');

      expect(logoSection).toBeInTheDocument();
      expect(navSection).toBeInTheDocument();
      expect(footerSection).toBeInTheDocument();
    });
  });
});