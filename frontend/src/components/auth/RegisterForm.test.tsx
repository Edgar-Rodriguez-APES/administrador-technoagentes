import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { TenantService } from '@/services/api';

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock TenantService
jest.mock('@/services/api', () => ({
  TenantService: {
    createTenant: jest.fn(),
  },
  // Keep other exports from api.ts if RegisterForm uses them, otherwise this is fine
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('RegisterForm', () => {
  const mockSignUp = jest.fn();
  const mockCreateTenant = TenantService.createTenant as jest.Mock;

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
    });
    mockSignUp.mockClear();
    mockCreateTenant.mockClear();
  });

  it('should call createTenant and signUp with correct parameters on successful submission', async () => {
    mockCreateTenant.mockResolvedValue({ id: 'test-tenant-id' }); // Mock successful tenant creation

    render(<RegisterForm />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Nombre de la Empresa/i), { target: { value: 'Test Tenant' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Plan/i), { target: { value: 'STANDARD' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockCreateTenant).toHaveBeenCalledWith({
        name: 'Test Tenant',
        contactEmail: 'test@example.com',
        contactName: 'test', // Based on current logic: email.split('@')[0]
        plan: 'STANDARD',
      });
    });

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'test-tenant-id');
    });
  });

  it('should display an error if passwords do not match', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/Nombre de la Empresa/i), { target: { value: 'Test Tenant' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'password456' } });

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
    expect(mockCreateTenant).not.toHaveBeenCalled();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  // Add more tests for other scenarios, like API errors during tenant creation or signup
});
