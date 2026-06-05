import { create } from 'zustand';
import { authService } from '@/services/auth.service';

type User = {
  id: number;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  role: {
    id: number;
    name: 'ADMIN' | 'USER';
  };
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    fullName: string,
    password: string,
  ) => Promise<User>;
  loginWithGoogle: (payload: { token: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),

  loginWithGoogle: async (payload: { token: string }) => {
    const res = await authService.googleLogin(payload);

    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    set({
      accessToken: res.data.accessToken,
      user: res.data.user,
    });

    return res.data.user;
  },

  login: async (email, password) => {
    const res = await authService.login({ email, password });

    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    set({
      accessToken: res.data.accessToken,
      user: res.data.user,
    });

    return res.data.user;
  },

  register: async (email, fullName, password) => {
    const res = await authService.register({
      email,
      fullName,
      password,
    });

    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    set({
      accessToken: res.data.accessToken,
      user: res.data.user,
    });

    return res.data.user;
  },

  logout: async () => {
    await authService.logout();

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    set({
      user: null,
      accessToken: null,
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));