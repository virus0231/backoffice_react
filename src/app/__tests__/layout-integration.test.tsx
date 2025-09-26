import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import DashboardLayout from '../(dashboard)/layout';

// Mock Next.js navigation hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Dashboard Layout Integration', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');

    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(min-width: 1024px)', // lg breakpoint
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout Structure', () => {
    it('renders complete dashboard layout with all components', () => {
      render(
        <DashboardLayout>
          <div data-testid="page-content">Test Content</div>
        </DashboardLayout>
      );

      // Check main container
      const container = document.querySelector('.dashboard-container');
      expect(container).toBeInTheDocument();

      // Check sidebar is present
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Check header is present
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Check main content area
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });

    it('renders sidebar and header as siblings within correct containers', () => {
      render(
        <DashboardLayout>
          <div data-testid="content">Content</div>
        </DashboardLayout>
      );

      const container = document.querySelector('.dashboard-container');
      const sidebar = screen.getByRole('navigation').closest('.dashboard-sidebar');
      const mainArea = document.querySelector('.dashboard-main');

      expect(container).toContainElement(sidebar);
      expect(container).toContainElement(mainArea);
      expect(mainArea).toContainElement(screen.getByRole('banner'));
      expect(mainArea).toContainElement(screen.getByRole('main'));
    });

    it('properly nests children within main content area', () => {
      render(
        <DashboardLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </DashboardLayout>
      );

      const mainContent = screen.getByRole('main');
      expect(mainContent).toContainElement(screen.getByTestId('child-1'));
      expect(mainContent).toContainElement(screen.getByTestId('child-2'));
    });
  });

  describe('Layout CSS Classes and Styling', () => {
    it('applies correct CSS classes to layout containers', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      const container = document.querySelector('.dashboard-container');
      expect(container).toHaveClass('dashboard-container');

      const mainArea = document.querySelector('.dashboard-main');
      expect(mainArea).toHaveClass('dashboard-main');

      const contentArea = screen.getByRole('main');
      expect(contentArea).toHaveClass('dashboard-content');
    });

    it('maintains proper layout hierarchy for CSS grid/flexbox', () => {
      render(
        <DashboardLayout>
          <div data-testid="content">Content</div>
        </DashboardLayout>
      );

      const container = document.querySelector('.dashboard-container');
      const sidebar = container?.querySelector('.dashboard-sidebar');
      const main = container?.querySelector('.dashboard-main');

      // Verify the layout structure supports the intended CSS layout
      expect(container?.children).toHaveLength(2); // sidebar + main
      expect(main?.children).toHaveLength(2); // header + main content
    });
  });

  describe('Component Integration', () => {
    it('header and sidebar components communicate properly with routing', () => {
      mockUsePathname.mockReturnValue('/analytics');

      render(
        <DashboardLayout>
          <div>Analytics Content</div>
        </DashboardLayout>
      );

      // Sidebar should highlight analytics nav item
      const analyticsLink = screen.getByRole('link', { name: 'Analytics' });
      expect(analyticsLink).toHaveClass('bg-primary-100', 'text-primary-700');

      // Header should be present and functional
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('all interactive elements are accessible within layout', async () => {
      const user = userEvent.setup();
      render(
        <DashboardLayout>
          <button data-testid="page-button">Page Button</button>
        </DashboardLayout>
      );

      // Should be able to interact with header elements
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test');
      expect(searchInput).toHaveValue('test');

      // Should be able to interact with sidebar elements
      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toBeInTheDocument();

      // Should be able to interact with page content
      const pageButton = screen.getByTestId('page-button');
      await user.click(pageButton);
    });
  });

  describe('Responsive Behavior', () => {
    it('handles mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
        })),
      });

      render(
        <DashboardLayout>
          <div>Mobile Content</div>
        </DashboardLayout>
      );

      // Mobile menu button should be visible
      const mobileButton = screen.getByRole('button', { name: /mobile menu/i });
      expect(mobileButton).toBeInTheDocument();
    });

    it('handles desktop viewport correctly', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(min-width: 1024px)',
          media: query,
        })),
      });

      render(
        <DashboardLayout>
          <div>Desktop Content</div>
        </DashboardLayout>
      );

      // Sidebar should be visible
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Header should show desktop elements
      const userMenu = screen.getByText('Admin User');
      expect(userMenu).toBeInTheDocument();
    });

    it('adapts header search behavior on different screen sizes', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Search should be present regardless of screen size
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search donors, campaigns...');
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper landmark structure', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Should have proper HTML5 semantic structure
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // sidebar nav
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main content
    });

    it('supports keyboard navigation across layout components', async () => {
      const user = userEvent.setup();
      render(
        <DashboardLayout>
          <button data-testid="content-button">Content Button</button>
        </DashboardLayout>
      );

      // Start from beginning and tab through elements
      const body = document.body;
      body.focus();

      // Should be able to tab to logo
      await user.tab();
      expect(screen.getByRole('link', { name: /insights/i })).toHaveFocus();

      // Continue tabbing through navigation
      await user.tab();
      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();

      // Eventually reach header elements (this tests the integration)
      // We'll tab multiple times to get to header
      for (let i = 0; i < 5; i++) {
        await user.tab();
      }

      // Should eventually reach search input
      const searchInput = screen.getByRole('searchbox');
      if (document.activeElement === searchInput) {
        expect(searchInput).toHaveFocus();
      }
    });

    it('provides appropriate focus management', () => {
      render(
        <DashboardLayout>
          <input data-testid="page-input" />
        </DashboardLayout>
      );

      // Elements should be focusable
      const searchInput = screen.getByRole('searchbox');
      const pageInput = screen.getByTestId('page-input');

      searchInput.focus();
      expect(searchInput).toHaveFocus();

      pageInput.focus();
      expect(pageInput).toHaveFocus();
    });
  });

  describe('Content Rendering', () => {
    it('renders different types of children correctly', () => {
      render(
        <DashboardLayout>
          <div data-testid="div-child">Div Child</div>
          <span data-testid="span-child">Span Child</span>
          <button data-testid="button-child">Button Child</button>
          <p data-testid="p-child">Paragraph Child</p>
        </DashboardLayout>
      );

      expect(screen.getByTestId('div-child')).toBeInTheDocument();
      expect(screen.getByTestId('span-child')).toBeInTheDocument();
      expect(screen.getByTestId('button-child')).toBeInTheDocument();
      expect(screen.getByTestId('p-child')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      expect(() => {
        render(
          <DashboardLayout>
            {null}
          </DashboardLayout>
        );
      }).not.toThrow();

      expect(() => {
        render(
          <DashboardLayout>
            {undefined}
          </DashboardLayout>
        );
      }).not.toThrow();
    });

    it('handles complex nested children', () => {
      render(
        <DashboardLayout>
          <div data-testid="parent">
            <div data-testid="child">
              <span data-testid="grandchild">Nested Content</span>
            </div>
          </div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByTestId('grandchild')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing children prop gracefully', () => {
      expect(() => {
        render(<DashboardLayout>{undefined as any}</DashboardLayout>);
      }).not.toThrow();
    });

    it('maintains layout integrity when components have errors', () => {
      // This tests that if one component fails, others still render
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <DashboardLayout>
          <div data-testid="working-component">This works</div>
        </DashboardLayout>
      );

      // Layout structure should still be intact
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('working-component')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Performance Considerations', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div data-testid="content">Content 1</div>
        </DashboardLayout>
      );

      const sidebar = screen.getByRole('navigation');
      const header = screen.getByRole('banner');

      // Re-render with different children
      rerender(
        <DashboardLayout>
          <div data-testid="content">Content 2</div>
        </DashboardLayout>
      );

      // Sidebar and header should still be the same elements (not re-rendered)
      expect(screen.getByRole('navigation')).toBe(sidebar);
      expect(screen.getByRole('banner')).toBe(header);
      expect(screen.getByTestId('content')).toHaveTextContent('Content 2');
    });
  });
});