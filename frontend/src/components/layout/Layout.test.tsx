import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { FoodProvider } from '../../context/FoodContext';
import Navbar from './Navbar';
import Footer from './Footer';

const renderWithProviders = (ui: ReactNode, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <AuthProvider>
          <FoodProvider>
            {ui}
          </FoodProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Layout Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Navbar', () => {
    it('renders brand logo with FoodLoop title', () => {
      renderWithProviders(<Navbar />);
      expect(screen.getByText('FoodLoop')).toBeInTheDocument();
    });

    it('renders Sign In and Get Started buttons on landing page', () => {
      renderWithProviders(<Navbar />, { route: '/' });
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('renders landing page navigation links', () => {
      renderWithProviders(<Navbar />, { route: '/' });
      expect(screen.getByText('The Problem')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
      expect(screen.getByText('Impact')).toBeInTheDocument();
    });

    it('renders dashboard button and profile chip when authenticated', () => {
      localStorage.setItem('foodloop_token', 'test-token');
      localStorage.setItem(
        'foodloop_user',
        JSON.stringify({
          id: 'u1',
          name: 'Chef Tariq',
          email: 'tariq@kitchen.org',
          role: 'provider',
          createdAt: new Date().toISOString(),
        })
      );

      renderWithProviders(<Navbar />, { route: '/' });
      expect(screen.getByTestId('navbar-dashboard-btn')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Chef Tariq')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders UN Sustainable Development Goals (SDG) cards', () => {
      renderWithProviders(<Footer />);
      expect(screen.getByText(/UN Sustainable Development Goals/i)).toBeInTheDocument();
      expect(screen.getByTestId('sdg-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('sdg-card-11')).toBeInTheDocument();
      expect(screen.getByTestId('sdg-card-12')).toBeInTheDocument();
      expect(screen.getByTestId('sdg-card-13')).toBeInTheDocument();
    });

    it('renders hackathon metadata', () => {
      renderWithProviders(<Footer />);
      expect(screen.getAllByText(/LoopLearn Hackathon/i).length).toBeGreaterThan(0);
    });

    it('renders FoodLoop brand in footer', () => {
      renderWithProviders(<Footer />);
      expect(screen.getAllByText('FoodLoop').length).toBeGreaterThan(0);
    });
  });
});
