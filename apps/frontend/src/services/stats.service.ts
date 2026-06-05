import { api } from './api';
import type {
    OverviewStats, ActivityDay, WeeklyDay, SetProgress, StreakData,
} from '@/types/stats.types';

export const statsService = {
    getOverview: (): Promise<OverviewStats> =>
        api.get('/stats/overview').then(r => r.data),

    getActivity: (): Promise<ActivityDay[]> =>
        api.get('/stats/activity').then(r => r.data),

    getWeekly: (): Promise<WeeklyDay[]> =>
        api.get('/stats/weekly').then(r => r.data),

    getSetProgress: (): Promise<SetProgress[]> =>
        api.get('/stats/progress').then(r => r.data),

    getStreak: (): Promise<StreakData> =>
        api.get('/stats/streak').then(r => r.data),

    recordActivity: (type: 'card' | 'quiz', count: number): Promise<any> =>
        api.post('/stats/record', { type, count }).then(r => r.data),
};