/**
 * Unit Tests for Login Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock the auth context
const mockLogin = vi.fn();
const mockClearMustChangePassword = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    clearMustChangePassword: mockClearMustChangePassword,
  })),
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  };
});

import Login from '@/pages/Login';
import { useAuth } from '@/context/AuthContext';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
      clearMustChangePassword: mockClearMustChangePassword,
      loading: false,
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders login form with all elements', () => {
      renderLogin();

      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.getByText('Accédez à votre espace FINOM')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
      expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
      expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
    });

    it('has empty form fields initially', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/mot de passe/i) as HTMLInputElement;

      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty email', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
      });
    });

    it('shows error for empty password', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
      });
    });

    it('shows error for password too short', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, '12345');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls login function with valid credentials', async () => {
      mockLogin.mockResolvedValue({ 
        id: 'user-123', 
        role: 'client', 
        mustChangePassword: false 
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('shows loading state during submission', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connexion\.\.\./i)).toBeInTheDocument();
      });
    });

    it('displays error message on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Redirection', () => {
    it('redirects client to dashboard after login', async () => {
      mockLogin.mockResolvedValue({ 
        id: 'user-123', 
        role: 'client', 
        mustChangePassword: false 
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'client@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('redirects admin to admin dashboard after login', async () => {
      mockLogin.mockResolvedValue({ 
        id: 'admin-123', 
        role: 'admin', 
        mustChangePassword: false 
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
      });
    });

    it('redirects agent to agent dashboard after login', async () => {
      mockLogin.mockResolvedValue({ 
        id: 'agent-123', 
        role: 'agent', 
        mustChangePassword: false 
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'agent@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/agent/dashboard', { replace: true });
      });
    });
  });

  describe('Force Password Change', () => {
    it('shows password change form when mustChangePassword is true', async () => {
      mockLogin.mockResolvedValue({ 
        id: 'user-123', 
        role: 'client', 
        mustChangePassword: true 
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show password change form instead of login form
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Links', () => {
    it('has link to forgot password page', () => {
      renderLogin();

      const forgotPasswordLink = screen.getByText(/mot de passe oublié/i);
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    it('has link to register page', () => {
      renderLogin();

      const registerLink = screen.getByText(/créer un compte/i);
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });
  });
});
