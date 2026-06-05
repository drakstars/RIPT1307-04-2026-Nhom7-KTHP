import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { Spin, App } from 'antd';
import { courseService } from '@/services/course.service';
import type { Course, CourseLevel } from '@/types/course.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const LEVELS: ('ALL' | CourseLevel)[] = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const CourseListPage: React.FC = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [activeLevel, setActiveLevel] = useState<'ALL' | CourseLevel>('ALL');
    const { t } = useTranslation();

    const { data: courses, isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: courseService.getAll,
    });

    const enrollMutation = useMutation({
        mutationFn: (courseId: string) => courseService.enroll(courseId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses'] });
            message.success(t('enrolledSuccess'));
        },
    });

    if (isLoading) {
        return (
            <div className={styles.centered}>
                <Spin size="large" />
            </div>
        );
    }

    const filteredCourses = courses?.filter(
        (course) => activeLevel === 'ALL' || course.level === activeLevel
    );

    return (
        <div className={styles.pg}>
            <div className={styles.top}>
                <div>
                    <h1 className={styles.title}>{t('coursesTitle')}</h1>
                    <p className={styles.sub}>
                        {t('coursesSub').replace('{count}', (courses?.length ?? 0).toString())}
                    </p>
                </div>
                <div className={styles.filters}>
                    {LEVELS.map((lvl) => (
                        <button
                            key={lvl}
                            className={`${styles.filter} ${activeLevel === lvl ? styles.filterOn : ''}`}
                            onClick={() => setActiveLevel(lvl)}
                        >
                            {lvl === 'ALL' ? t('allLevel') :
                             lvl === 'BEGINNER' ? t('beginnerLevel') :
                             lvl === 'INTERMEDIATE' ? t('intermediateLevel') :
                             t('advancedLevel')}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.grid}>
                {filteredCourses?.map((course: Course) => (
                    <div
                        key={course.id}
                        className={styles.card}
                        onClick={() => navigate(`/courses/${course.id}`)}
                    >
                        <div className={styles.thumb}>
                            <span className={styles.thumbEmoji}>{course.emoji}</span>
                        </div>
                        <div className={styles.body}>
                            <div className={styles.meta}>
                                <span
                                    className={`${styles.badge} ${
                                        course.level === 'BEGINNER'
                                            ? styles.badgeBlue
                                            : course.level === 'INTERMEDIATE'
                                            ? styles.badgeAccent
                                            : styles.badgeRed
                                    }`}
                                >
                                    {course.level === 'BEGINNER' ? t('beginnerLevel') :
                                     course.level === 'INTERMEDIATE' ? t('intermediateLevel') :
                                     t('advancedLevel')}
                                </span>
                                {course.enrolled && (
                                    <span
                                        className={`${styles.badge} ${
                                            course.progressPct === 100
                                                ? styles.badgeGreen
                                                : styles.badgeAccent
                                        }`}
                                    >
                                        {course.progressPct === 100 ? t('completedBadge') : t('enrolledBadge')}
                                    </span>
                                )}
                            </div>
                            <div className={styles.cardTitle}>{course.title}</div>
                            <div className={styles.cardDesc}>{course.description}</div>

                            {course.enrolled && (
                                <div className={styles.progBar}>
                                    <div
                                        className={styles.progFill}
                                        style={{ width: `${course.progressPct}%` }}
                                    />
                                </div>
                            )}

                            <div className={styles.foot}>
                                <span className={styles.footStat}>
                                    {t('lessonsCountUnit').replace('{count}', (course._count?.lessons ?? 0).toString())}
                                </span>
                                {course.enrolled ? (
                                    <span className={styles.footStat} style={{ fontWeight: 500 }}>
                                        {t('percentComplete').replace('{pct}', course.progressPct.toString())}
                                    </span>
                                ) : (
                                    <button
                                        className={styles.enrollBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            enrollMutation.mutate(course.id);
                                        }}
                                        disabled={enrollMutation.isPending}
                                    >
                                        {t('enrollBtn')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseListPage;
