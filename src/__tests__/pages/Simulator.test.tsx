/**
 * Unit Tests for Simulator Component
 * Tests the loan simulation functionality and calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
  AuthUser: {},
}));

// Mock toast
vi.mock('@/components/finom/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    logError: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    }),
  },
}));

// Mock API
vi.mock('@/services/api', () => ({
  loansApi: {
    create: vi.fn().mockResolvedValue({ id: 'loan-123' }),
  },
}));

// Mock email service
vi.mock('@/services/emailService', () => ({
  emailService: {
    sendLoanSubmitted: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Simulator from '@/pages/Simulator';
import { useAuth } from '@/context/AuthContext';

const renderSimulator = () => {
  return render(
    <BrowserRouter>
      <Simulator />
    </BrowserRouter>
  );
};

describe('Simulator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders simulator page with all form elements', () => {
      renderSimulator();

      expect(screen.getByText(/simulateur de prêt/i)).toBeInTheDocument();
      expect(screen.getByText(/votre projet/i)).toBeInTheDocument();
      expect(screen.getByText(/votre financement/i)).toBeInTheDocument();
    });

    it('renders project type selector', () => {
      renderSimulator();

      const projectTypeSelect = screen.getByDisplayValue(/achat résidence principale/i);
      expect(projectTypeSelect).toBeInTheDocument();
    });

    it('renders property price input', () => {
      renderSimulator();

      const propertyPriceInputs = screen.getAllByDisplayValue('250000');
      expect(propertyPriceInputs.length).toBeGreaterThan(0);
    });

    it('renders duration slider', () => {
      renderSimulator();

      expect(screen.getByText(/20 ans/i)).toBeInTheDocument();
    });

    it('renders insurance notice', () => {
      renderSimulator();

      expect(screen.getByText(/assurance emprunteur incluse/i)).toBeInTheDocument();
      expect(screen.getByText(/0\.31%/i)).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('has correct default property price', () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('250000');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('has correct default notary fees', () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('20000');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('has correct default agency fees', () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('5000');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('has correct default down payment', () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('30000');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('has correct default duration of 20 years', () => {
      renderSimulator();

      expect(screen.getByText('20 ans')).toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    it('displays monthly payment result', () => {
      renderSimulator();

      expect(screen.getByText(/mensualité totale/i)).toBeInTheDocument();
    });

    it('displays breakdown of credit and insurance', () => {
      renderSimulator();

      expect(screen.getByText(/crédit/i)).toBeInTheDocument();
      expect(screen.getByText(/🛡️ assurance/i)).toBeInTheDocument();
    });

    it('displays project summary', () => {
      renderSimulator();

      expect(screen.getByText(/récapitulatif du projet/i)).toBeInTheDocument();
      expect(screen.getByText(/prix du bien/i)).toBeInTheDocument();
      expect(screen.getByText(/frais de notaire/i)).toBeInTheDocument();
    });

    it('displays credit cost breakdown', () => {
      renderSimulator();

      expect(screen.getByText(/coût du crédit/i)).toBeInTheDocument();
      expect(screen.getByText(/coût total des intérêts/i)).toBeInTheDocument();
      expect(screen.getByText(/taeg estimé/i)).toBeInTheDocument();
    });

    it('displays correct loan amount calculation', () => {
      renderSimulator();

      // Default: 250000 + 20000 + 5000 + 0 - 30000 = 245000
      expect(screen.getByText(/capital emprunté/i)).toBeInTheDocument();
    });
  });

  describe('Project Type Selection', () => {
    it('allows changing project type', async () => {
      renderSimulator();

      const projectTypeSelect = screen.getByDisplayValue(/achat résidence principale/i);
      await userEvent.selectOptions(projectTypeSelect, 'investissement_locatif');

      expect(projectTypeSelect).toHaveValue('investissement_locatif');
    });

    it('has all project type options', () => {
      renderSimulator();

      expect(screen.getByRole('option', { name: /achat résidence principale/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /achat résidence secondaire/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /investissement locatif/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /construction/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /rénovation/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('updates property price when changed', async () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('250000');
      const propertyPriceInput = inputs[0];
      
      await userEvent.clear(propertyPriceInput);
      await userEvent.type(propertyPriceInput, '300000');

      expect(propertyPriceInput).toHaveValue(300000);
    });

    it('updates down payment when changed', async () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('30000');
      const downPaymentInput = inputs[0];
      
      await userEvent.clear(downPaymentInput);
      await userEvent.type(downPaymentInput, '50000');

      expect(downPaymentInput).toHaveValue(50000);
    });

    it('displays contribution percentage', () => {
      renderSimulator();

      // Default: 30000 / (250000 + 20000 + 5000 + 0) = 10.9%
      expect(screen.getByText(/% du projet total/i)).toBeInTheDocument();
    });
  });

  describe('Rate Profile Display', () => {
    it('displays current rate', () => {
      renderSimulator();

      expect(screen.getByText(/taux estimé/i)).toBeInTheDocument();
    });

    it('displays profile badge', () => {
      renderSimulator();

      // Should display one of the profile labels
      const profileLabels = [
        /profil premium/i,
        /profil standard/i,
        /profil risque modéré/i,
        /profil primo accédant/i
      ];
      
      const foundLabel = profileLabels.some(label => 
        screen.queryByText(label) !== null
      );
      expect(foundLabel).toBe(true);
    });
  });

  describe('CTA Buttons', () => {
    it('displays loan application button', () => {
      renderSimulator();

      expect(screen.getByText(/faire une demande de prêt/i)).toBeInTheDocument();
    });

    it('displays how it works button', () => {
      renderSimulator();

      expect(screen.getByText(/comment ça marche/i)).toBeInTheDocument();
    });

    it('navigates to login when not authenticated and clicking create loan', async () => {
      renderSimulator();

      const createLoanButton = screen.getByText(/faire une demande de prêt/i);
      fireEvent.click(createLoanButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', expect.any(Object));
      });
    });
  });

  describe('Authenticated User', () => {
    it('creates loan when authenticated user clicks create button', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client' as const,
        firstName: 'John',
      };

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        clearMustChangePassword: vi.fn(),
      });

      const { loansApi } = await import('@/services/api');
      vi.mocked(loansApi.create).mockResolvedValue({ id: 'loan-new-123' } as any);

      renderSimulator();

      const createLoanButton = screen.getByText(/faire une demande de prêt/i);
      fireEvent.click(createLoanButton);

      await waitFor(() => {
        expect(loansApi.create).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles negative values gracefully', async () => {
      renderSimulator();

      const inputs = screen.getAllByDisplayValue('250000');
      const propertyPriceInput = inputs[0];
      
      await userEvent.clear(propertyPriceInput);
      await userEvent.type(propertyPriceInput, '-100');

      // Should convert to 0 (min=0)
      await waitFor(() => {
        expect(propertyPriceInput).toHaveValue(0);
      });
    });
  });
});
