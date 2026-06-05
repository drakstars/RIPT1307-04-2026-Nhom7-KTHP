import { api } from './api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
};

export const authService = {
  login(payload: LoginPayload) {
    return api.post('/auth/login', payload);
  },

  register(payload: RegisterPayload) {
    return api.post('/auth/register', payload);
  },

  logout() {
    return api.post('/auth/logout');
  },

  getGoogleConfig() {
    return Promise.resolve({
      data: {
        clientId: '',
      },
    });
  },

  googleLogin(payload: { token: string }) {
    if (payload.token.startsWith('mock_')) {
      const base64 = payload.token.replace('mock_', '');
      try {
        const data = JSON.parse(atob(base64));
        return Promise.resolve({
          data: {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            user: {
              id: 999,
              email: data.email,
              fullName: data.name,
              avatarUrl: data.picture,
              role: {
                id: data.email.includes('admin') ? 1 : 2,
                name: data.email.includes('admin') ? 'ADMIN' : 'USER',
              },
            },
          },
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return api.post('/auth/google', payload);
  },
};