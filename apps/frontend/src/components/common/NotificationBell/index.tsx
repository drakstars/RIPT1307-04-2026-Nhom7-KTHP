import React, { useRef, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { NOTIFICATION_ICONS, type Notification } from '@/types/notification.types';
import styles from './index.less';

const NotificationBell: React.FC = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const qc = useQueryClient();

    const { data: countData } = useQuery({
        queryKey: ['unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000, // poll every 30s
    });

    const { data: notifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.getAll,
        enabled: open,
    });

    const markReadMutation = useMutation({
        mutationFn: notificationService.markRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['unread-count'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllMutation = useMutation({
        mutationFn: notificationService.markAllRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['unread-count'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: notificationService.deleteOne,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unread = countData?.count ?? 0;

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className={styles.wrap} ref={ref}>
            <button
                className={styles.bell}
                onClick={() => setOpen(o => !o)}
                aria-label="Notifications"
            >
                ◎
                {unread > 0 && (
                    <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
                )}
            </button>

            {open && (
                <div className={styles.dropdown}>
                    <div className={styles.dropHead}>
                        <span className={styles.dropTitle}>Notifications</span>
                        {unread > 0 && (
                            <button
                                className={styles.markAllBtn}
                                onClick={() => markAllMutation.mutate()}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {!(notifications ?? []).length && (
                            <div className={styles.empty}>No notifications yet</div>
                        )}
                        {(notifications ?? []).map((n: Notification) => (
                            <div
                                key={n.id}
                                className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                                onClick={() => !n.read && markReadMutation.mutate(n.id)}
                            >
                                <div className={styles.itemIcon}>
                                    {NOTIFICATION_ICONS[n.type]}
                                </div>
                                <div className={styles.itemContent}>
                                    <div className={styles.itemTitle}>{n.title}</div>
                                    <div className={styles.itemBody}>{n.body}</div>
                                    <div className={styles.itemTime}>{formatTime(n.createdAt)}</div>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={e => {
                                        e.stopPropagation();
                                        deleteMutation.mutate(n.id);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;