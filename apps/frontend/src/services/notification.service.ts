import { api } from './api';
import type { Notification } from '@/types/notification.types';

const BASE = '/notifications';

export const notificationService = {
    getAll: (): Promise<Notification[]> =>
        api.get(BASE).then((r: any) => r.data),

    getUnreadCount: (): Promise<{ count: number }> =>
        api.get(`${BASE}/unread-count`).then((r: any) => r.data),

    markRead: (id: string) =>
        api.put(`${BASE}/${id}/read`).then((r: any) => r.data),

    markAllRead: () =>
        api.put(`${BASE}/read-all`).then((r: any) => r.data),

    deleteOne: (id: string) =>
        api.delete(`${BASE}/${id}`).then((r: any) => r.data),
};