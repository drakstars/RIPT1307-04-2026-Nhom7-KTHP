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
};