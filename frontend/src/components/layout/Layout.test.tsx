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

    it('shows dashboard subpage links on provider route', () => {
      renderWithProviders(<Navbar />, { route: '/provider' });
      expect(screen.getByText('Donors Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Surplus Inventory')).toBeInTheDocument();
      expect(screen.getByText('Incoming Claims')).toBeInTheDocument();
      expect(screen.getByText('Rescue Impact')).toBeInTheDocument();
      expect(screen.getByText('AI Redistribution')).toBeInTheDocument();
    });

    it('shows dashboard subpage links on organization route', () => {
      renderWithProviders(<Navbar />, { route: '/organization' });
      expect(screen.getByText('Community Hub')).toBeInTheDocument();
      expect(screen.getByText('Browse Food Surplus')).toBeInTheDocument();
      expect(screen.getByText('My Claim Orders')).toBeInTheDocument();
      expect(screen.getByText('Meal Analytics')).toBeInTheDocument();
      expect(screen.getByText('AI Safety & Assist')).toBeInTheDocument();
    });

    it('shows dashboard subpage links on admin route', () => {
      renderWithProviders(<Navbar />, { route: '/admin' });
      expect(screen.getByText('Platform Overview')).toBeInTheDocument();
      expect(screen.getByText('Surplus Oversight')).toBeInTheDocument();
      expect(screen.getByText('Org Verification')).toBeInTheDocument();
      expect(screen.getByText('User Directory')).toBeInTheDocument();
      expect(screen.getByText('Municipal Analytics')).toBeInTheDocument();
      expect(screen.getByText('AI Governance')).toBeInTheDocument();
    });

    it('does not show dashboard nav on landing page', () => {
      renderWithProviders(<Navbar />, { route: '/' });
      expect(screen.queryByText('Donors Dashboard')).not.toBeInTheDocument();
    });

    it('does not show dashboard nav on auth routes', () => {
      renderWithProviders(<Navbar />, { route: '/login' });
      expect(screen.queryByText('Donors Dashboard')).not.toBeInTheDocument();
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
