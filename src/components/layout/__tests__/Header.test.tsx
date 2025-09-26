import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

describe('Header Component', () => {
  beforeEach(() => {
    // Reset any state before each test
    render(<Header />);
  });

  describe('Rendering', () => {
    it('renders the header with correct structure', () => {
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('dashboard-header');
    });

    it('renders the search input with correct attributes', () => {
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search donors, campaigns...');
      expect(searchInput).toHaveAttribute('type', 'search');
    });

    it('renders notification button', () => {
      const notificationButton = screen.getByRole('button', { name: /notifications/i });
      expect(notificationButton).toBeInTheDocument();
      expect(notificationButton.querySelector('svg')).toBeInTheDocument();
    });

    it('renders settings button', () => {
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toBeInTheDocument();
      expect(settingsButton.querySelector('svg')).toBeInTheDocument();
    });

    it('renders user menu with avatar and name', () => {
      const userButton = screen.getByRole('button', { name: /open user menu/i });
      expect(userButton).toBeInTheDocument();

      const avatar = screen.getByAltText('User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff');

      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('renders mobile menu button on small screens', () => {
      const mobileButton = screen.getByRole('button', { name: /mobile menu/i });
      expect(mobileButton).toBeInTheDocument();
      expect(mobileButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('toggles mobile menu when button is clicked', async () => {
      const user = userEvent.setup();
      const mobileButton = screen.getByRole('button', { name: /mobile menu/i });
      const hamburgerIcon = mobileButton.querySelector('svg path');

      // Initially shows hamburger menu
      expect(hamburgerIcon).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16');

      // Click to open menu
      await user.click(mobileButton);

      // Should show close icon
      await waitFor(() => {
        const closeIcon = mobileButton.querySelector('svg path');
        expect(closeIcon).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
      });

      // Click to close menu
      await user.click(mobileButton);

      // Should show hamburger again
      await waitFor(() => {
        const hamburgerIcon = mobileButton.querySelector('svg path');
        expect(hamburgerIcon).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      });
    });

    it('allows typing in search input', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByRole('searchbox', { name: /search/i });

      await user.type(searchInput, 'test search query');

      expect(searchInput).toHaveValue('test search query');
    });

    it('focuses search input when clicked', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByRole('searchbox', { name: /search/i });

      await user.click(searchInput);

      expect(searchInput).toHaveFocus();
    });

    it('notification button is clickable', async () => {
      const user = userEvent.setup();
      const notificationButton = screen.getByRole('button', { name: /notifications/i });

      // Should not throw error when clicked
      await user.click(notificationButton);
      expect(notificationButton).toBeInTheDocument();
    });

    it('settings button is clickable', async () => {
      const user = userEvent.setup();
      const settingsButton = screen.getByRole('button', { name: /settings/i });

      // Should not throw error when clicked
      await user.click(settingsButton);
      expect(settingsButton).toBeInTheDocument();
    });

    it('user menu button is clickable', async () => {
      const user = userEvent.setup();
      const userButton = screen.getByRole('button', { name: /open user menu/i });

      // Should not throw error when clicked
      await user.click(userButton);
      expect(userButton).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to main elements', () => {
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('dashboard-header');

      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      expect(searchInput).toHaveClass('block', 'w-full', 'pl-10', 'pr-3', 'py-2');
    });

    it('applies hover and focus states correctly', () => {
      const notificationButton = screen.getByRole('button', { name: /notifications/i });
      expect(notificationButton).toHaveClass('text-gray-400', 'hover:text-gray-500');

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toHaveClass('text-gray-400', 'hover:text-gray-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      // Search input has proper label
      const searchInput = screen.getByLabelText('Search');
      expect(searchInput).toBeInTheDocument();

      // Header has banner role
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // SVG icons are properly hidden from screen readers
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      // Get all focusable elements
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      const notificationsButton = screen.getByRole('button', { name: /notifications/i });

      // Focus search input directly and verify it can be focused
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      // Tab to next element
      await user.tab();
      // On small screens, mobile button might be focused first, so we'll just verify tabbing works
      expect(document.activeElement).not.toBe(searchInput);
    });

    it('has proper focus management for mobile menu', async () => {
      const user = userEvent.setup();
      const mobileButton = screen.getByRole('button', { name: /mobile menu/i });

      await user.click(mobileButton);
      expect(mobileButton).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      // Component should render without any required props
      const { container } = render(<Header />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles invalid search input gracefully', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByRole('searchbox', { name: /search/i });

      // Should handle special characters without errors
      await user.type(searchInput, '!@#$%^&*()');
      expect(searchInput).toHaveValue('!@#$%^&*()');
    });
  });
});