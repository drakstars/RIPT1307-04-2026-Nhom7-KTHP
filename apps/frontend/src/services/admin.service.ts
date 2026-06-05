import { api } from './api';

export const adminService = {
    getAnalyticsOverview: () =>
        api.get('/admin/analytics/overview').then(r => r.data),

    getTopUsers: (limit = 10) =>
        api.get(`/admin/analytics/top-users?limit=${limit}`).then(r => r.data),

    getRevenueChart: (days = 30) =>
        api.get(`/admin/analytics/revenue?days=${days}`).then(r => r.data),

    exportVocabulary: () =>
        window.open(
            `${process.env.API_URL ?? 'http://localhost:3000'}/export/vocabulary`,
            '_blank',
        ),

    exportAdminReport: () =>
        window.open(
            `${process.env.API_URL ?? 'http://localhost:3000'}/export/admin-report`,
            '_blank',
        ),
};

export const exportUserProgress = () =>
    window.open(
        `${process.env.API_URL ?? 'http://localhost:3000'}/export/progress`,
        '_blank',
    );