import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

vi.mock('../../api/index', () => ({
  authAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  },
}));

import { authAPI } from '../../api/index';

const TestConsumer = () => {
  const { user, loading, profile } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user</div>;
  return <div>User: {user.email}</div>;
};

const TestLoginConsumer = ({ onLogin }) => {
  const { login } = useAuth();
  return <button onClick={() => onLogin(login)}>Login</button>;
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe('AuthProvider', () => {
  it('shows loading initially when token exists and fetchMe is pending', async () => {
    localStorage.setItem('gigly_token', 'sometoken');
    authAPI.getMe.mockImplementation(() => new Promise(() => {}));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows no user when no token in localStorage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('fetches and sets user when token present and getMe succeeds', async () => {
    localStorage.setItem('gigly_token', 'validtoken');
    authAPI.getMe.mockResolvedValueOnce({
      data: {
        success: true,
        data: { user: { email: 'test@gigly.com', role: 'client' }, profile: null },
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@gigly.com')).toBeInTheDocument();
    });
  });

  it('clears session when getMe fails', async () => {
    localStorage.setItem('gigly_token', 'invalidtoken');
    authAPI.getMe.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
    expect(localStorage.getItem('gigly_token')).toBeNull();
  });

  it('login() sets user and stores token in localStorage', async () => {
    authAPI.login.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          token: 'mytoken123',
          user: { email: 'loggedin@test.com', role: 'client' },
          profile: null,
        },
      },
    });

    let loginFn;
    const LoginCapture = () => {
      const { login } = useAuth();
      loginFn = login;
      return null;
    };

    render(
      <AuthProvider>
        <LoginCapture />
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('No user')).toBeInTheDocument());

    await act(async () => {
      await loginFn('loggedin@test.com', 'password');
    });

    expect(localStorage.getItem('gigly_token')).toBe('mytoken123');
    expect(screen.getByText('User: loggedin@test.com')).toBeInTheDocument();
  });

  it('login() throws when API returns success: false', async () => {
    authAPI.login.mockResolvedValueOnce({
      data: { success: false, message: 'Invalid credentials' },
    });

    let loginFn;
    const LoginCapture = () => {
      const { login } = useAuth();
      loginFn = login;
      return null;
    };

    render(
      <AuthProvider>
        <LoginCapture />
      </AuthProvider>
    );

    await waitFor(() => expect(loginFn).toBeDefined());

    await expect(loginFn('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('logout() clears user and localStorage', async () => {
    localStorage.setItem('gigly_token', 'tok');
    authAPI.getMe.mockResolvedValueOnce({
      data: {
        success: true,
        data: { user: { email: 'u@test.com', role: 'client' }, profile: null },
      },
    });

    let logoutFn;
    const LogoutCapture = () => {
      const { logout } = useAuth();
      logoutFn = logout;
      return null;
    };

    render(
      <AuthProvider>
        <LogoutCapture />
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('User: u@test.com')).toBeInTheDocument());

    act(() => logoutFn());

    await waitFor(() => expect(screen.getByText('No user')).toBeInTheDocument());
    expect(localStorage.getItem('gigly_token')).toBeNull();
  });

  it('useAuth throws outside of AuthProvider', () => {
    const FailingComponent = () => {
      useAuth();
      return null;
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailingComponent />)).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
