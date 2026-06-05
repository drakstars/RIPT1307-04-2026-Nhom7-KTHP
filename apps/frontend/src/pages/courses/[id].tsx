import React from 'react';
import { useParams, useNavigate } from 'umi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, App } from 'antd';
import { courseService } from '@/services/course.service';
import type { Lesson } from '@/types/course.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './detail.less';

const LESSON_TYPE_ICON: Record<string, string> = {
    READING: '📄',
    VOCABULARY: '⬡',
    QUIZ: '◈',
};

const CourseDetailPage: React.FC = () => {
    const { message } = App.useApp();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { t } = useTranslation();

    const LESSON_TYPE_LABEL: Record<string, string> = {
        READING: t('allLevel') === 'Tất cả' ? 'Bài đọc' : 'Reading',
        VOCABULARY: t('vocabLessonTitle'),
        QUIZ: t('quizLessonTitle'),
    };

    const { data: course, isLoading } = useQuery({
        queryKey: ['course', id],
        queryFn: () => courseService.getOne(id!),
        enabled: !!id,
    });

    const enrollMutation = useMutation({
        mutationFn: () => courseService.enroll(id!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['course', id] });
            message.success(t('enrolledSuccess'));
        },
    });

    const unenrollMutation = useMutation({
        mutationFn: () => courseService.unenroll(id!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
    });

    if (isLoading) return <div className={styles.centered}><Spin /></div>;
    if (!course) return null;

    const currentLesson = course.lessons?.find(l => l.isCurrent);
    const firstLesson = course.lessons?.[0];

    const handleContinue = () => {
        const target = currentLesson ?? firstLesson;
        if (target) navigate(`/courses/${id}/lessons/${target.id}`);
    };

    return (
        <div className={styles.pg}>
            <button className={styles.backBtn} onClick={() => navigate('/courses')}>
                ← {t('coursesBackBtn')}
            </button>

            <div className={styles.layout}>
                {/* Left */}
                <div className={styles.left}>
                    <div className={styles.hero}>
                        <div className={styles.heroEmoji}>{course.emoji}</div>
                        <h1 className={styles.heroTitle}>{course.title}</h1>
                        <p className={styles.heroDesc}>{course.description}</p>
                        <div className={styles.heroTags}>
                            <span className={styles.badgeNeutral}>
                                {course.level === 'BEGINNER' ? t('beginnerLevel') :
                                 course.level === 'INTERMEDIATE' ? t('intermediateLevel') :
                                 t('advancedLevel')}
                            </span>
                            <span className={styles.badgeNeutral}>
                                {t('lessonsCountUnit').replace('{count}', (course._count?.lessons ?? 0).toString())}
                            </span>
                            <span className={styles.badgeNeutral}>
                                ~{(course.lessons ?? []).reduce((s, l) => s + (l.durationMins ?? 10), 0)} {t('durationMinsUnit').replace('{mins}', '')}
                            </span>
                        </div>
                    </div>

                    <div className={styles.sectionLabel}>{t('courseLessonsLabel')}</div>
                    <div className={styles.lessonList}>
                        {(course.lessons ?? []).map((lesson: Lesson) => (
                            <div
                                key={lesson.id}
                                className={`${styles.lessonRow}
                  ${lesson.isLocked ? styles.lessonLocked : ''}
                  ${lesson.isCurrent ? styles.lessonCurrent : ''}
                `}
                                onClick={() => {
                                    if (!lesson.isLocked && course.enrolled) {
                                        navigate(`/courses/${id}/lessons/${lesson.id}`);
                                    }
                                }}
                            >
                                <div className={`${styles.lessonNum}
                  ${lesson.isCompleted ? styles.numDone : ''}
                  ${lesson.isCurrent ? styles.numActive : ''}
                `}>
                                    {lesson.isCompleted ? '✓' : lesson.order + 1}
                                </div>

                                <div className={styles.lessonInfo}>
                                    <div className={styles.lessonTitle}>{lesson.title}</div>
                                    <div className={styles.lessonMeta}>
                                        <span>{LESSON_TYPE_ICON[lesson.type]}</span>
                                        <span>{LESSON_TYPE_LABEL[lesson.type]}</span>
                                        {lesson.durationMins && (
                                            <span>
                                                · {t('durationMinsUnit').replace('{mins}', lesson.durationMins.toString())}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <span className={`${styles.badge}
                  ${lesson.isCompleted ? styles.badgeGreen : ''}
                  ${lesson.isCurrent ? styles.badgeAccent : ''}
                  ${lesson.isLocked ? styles.badgeNeutral : ''}
                `}>
                                    {lesson.isCompleted ? t('lessonDoneBadge') : lesson.isCurrent ? t('lessonCurrentBadge') : lesson.isLocked ? t('lessonLockedBadge') : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — sticky card */}
                <div className={styles.right}>
                    <div className={styles.enrollCard}>
                        <div className={styles.enrollProgLabel}>
                            <span>{t('courseProgressLabel')}</span>
                            <span className={styles.enrollProgVal}>{course.progressPct}%</span>
                        </div>
                        <div className={styles.progBar}>
                            <div className={styles.progFill} style={{ width: `${course.progressPct}%` }} />
                        </div>

                        <div className={styles.enrollStats}>
                            <div className={styles.enrollStat}>
                                <div className={styles.enrollStatVal}>
                                    {course.completedLessons}/{course._count?.lessons ?? 0}
                                </div>
                                <div className={styles.enrollStatLabel}>{t('courseLessonsLabel')}</div>
                            </div>
                            <div className={styles.enrollStat}>
                                <div className={`${styles.enrollStatVal} ${styles.green}`}>
                                    {course.completedLessons}
                                </div>
                                <div className={styles.enrollStatLabel}>{t('courseStatsDone')}</div>
                            </div>
                        </div>

                        {course.enrolled ? (
                            <>
                                <button className={styles.bigBtn} onClick={handleContinue}>
                                    {course.progressPct === 100 ? t('reviewCourseBtn') : t('continueCourseBtn')}
                                </button>
                                <button
                                    className={styles.unenrollBtn}
                                    onClick={() => unenrollMutation.mutate()}
                                    disabled={unenrollMutation.isPending}
                                >
                                    {t('unenrollBtn')}
                                </button>
                            </>
                        ) : (
                            <button
                                className={styles.bigBtn}
                                onClick={() => enrollMutation.mutate()}
                                disabled={enrollMutation.isPending}
                            >
                                {t('enrollFreeBtn')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;