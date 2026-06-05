export type NotificationType =
    | 'STREAK_REMINDER'
    | 'REVIEW_DUE'
    | 'ACHIEVEMENT'
    | 'SYSTEM'
    | 'PAYMENT';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    data?: Record<string, unknown>;
    createdAt: string;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
    STREAK_REMINDER: '🔥',
    REVIEW_DUE: '📚',
    ACHIEVEMENT: '🏆',
    SYSTEM: '◎',
    PAYMENT: '◆',
};