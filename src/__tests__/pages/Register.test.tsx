/**
 * Unit Tests for Register Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock the auth context
const mockRegister = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    register: mockRegister,
    isAuthenticated: false,
    user: null,
    loading: false,
  })),
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/register' }),
  };
});

import Register from '@/pages/Register';
import { useAuth } from '@/context/AuthContext';

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders registration form with all elements', () => {
      renderRegister();

      expect(screen.getByText('Créer un compte')).toBeInTheDocument();
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
    });

    it('has empty form fields initially', () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/nom/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      expect(firstNameInput.value).toBe('');
      expect(lastNameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });

    it('has link to login page', () => {
      renderRegister();

      expect(screen.getByText(/déjà un compte/i)).toBeInTheDocument();
      expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty first name', async () => {
      renderRegister();

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le prénom est requis/i)).toBeInTheDocument();
      });
    });

    it('shows error for empty last name', async () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      await userEvent.type(firstNameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
      });
    });

    it('shows error for password too short', async () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, '12345');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'differentpassword');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
      });
    });

    it('shows error for first name with invalid characters', async () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      await userEvent.type(firstNameInput, 'John123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le prénom contient des caractères invalides/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls register function with valid data', async () => {
      mockRegister.mockResolvedValue(undefined);

      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'john@example.com',
          'password123',
          'John',
          'Doe'
        );
      });
    });

    it('shows loading state during submission', async () => {
      mockRegister.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/création en cours/i)).toBeInTheDocument();
      });
    });

    it('displays error message on registration failure', async () => {
      mockRegister.mockRejectedValue(new Error('Cet email est déjà utilisé'));

      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/cet email est déjà utilisé/i)).toBeInTheDocument();
      });
    });

    it('navigates to dashboard after successful registration', async () => {
      mockRegister.mockResolvedValue(undefined);

      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });

  describe('Name Validation with Special Characters', () => {
    it('accepts French accented names', async () => {
      mockRegister.mockResolvedValue(undefined);

      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'François');
      await userEvent.type(lastNameInput, 'Müller');
      await userEvent.type(emailInput, 'francois@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'francois@example.com',
          'password123',
          'François',
          'Müller'
        );
      });
    });

    it('accepts hyphenated names', async () => {
      mockRegister.mockResolvedValue(undefined);

      renderRegister();

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^mot de passe$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);

      await userEvent.type(firstNameInput, 'Jean-Pierre');
      await userEvent.type(lastNameInput, 'De La Fontaine');
      await userEvent.type(emailInput, 'jp@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });
  });

  describe('Auto-redirect when authenticated', () => {
    it('redirects to dashboard if already authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        register: mockRegister,
        isAuthenticated: true,
        user: { id: 'user-123', email: 'test@example.com', role: 'client' },
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
        clearMustChangePassword: vi.fn(),
      });

      renderRegister();

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
