import React, { useState } from 'react';
import { useParams, useNavigate } from 'umi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, App } from 'antd';
import { courseService } from '@/services/course.service';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './lesson.less';

// Minimal markdown renderer supporting headers, lists, paragraphs and inline elements
function renderMarkdown(text: string): string {
    if (!text) return '';
    
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inOrderedList = false;

    for (let line of lines) {
        const trimmed = line.trim();

        // 1.5 Handle YouTube embeds
        const youtubeMatch = trimmed.match(/^@\[youtube\]\((.*?)\)/);
        if (youtubeMatch) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
            const videoId = youtubeMatch[1];
            html += `<div class="${styles.videoWrap}"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            continue;
        }

        // 1. Handle Headers
        if (trimmed.startsWith('# ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
            html += `<h1>${trimmed.slice(2)}</h1>`;
            continue;
        }
        if (trimmed.startsWith('## ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
            html += `<h2>${trimmed.slice(3)}</h2>`;
            continue;
        }
        if (trimmed.startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
            html += `<h3>${trimmed.slice(4)}</h3>`;
            continue;
        }

        // 2. Handle Bullet Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const content = trimmed.slice(2);
            html += `<li>${content}</li>`;
            continue;
        }

        // 3. Handle Ordered Lists
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (orderedMatch) {
            if (inList) { html += '</ul>'; inList = false; }
            if (!inOrderedList) {
                html += '<ol>';
                inOrderedList = true;
            }
            const content = orderedMatch[2];
            html += `<li>${content}</li>`;
            continue;
        }

        // Close lists if we hit an empty line or normal text
        if (trimmed === '') {
            if (inList) { html += '</ul>'; inList = false; }
            if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
            html += '<br>';
            continue;
        }

        // Normal text paragraph
        if (inList) { html += '</ul>'; inList = false; }
        if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
        html += `<p>${trimmed}</p>`;
    }

    if (inList) html += '</ul>';
    if (inOrderedList) html += '</ol>';

    // 4. Handle inline formatting
    return html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

const LessonViewerPage: React.FC = () => {
    const { message } = App.useApp();
    const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [completing, setCompleting] = useState(false);
    const { t } = useTranslation();

    const { data: lesson, isLoading } = useQuery({
        queryKey: ['lesson', lessonId],
        queryFn: () => courseService.getLesson(lessonId!),
        enabled: !!lessonId,
    });

    const { data: course } = useQuery({
        queryKey: ['course', id],
        queryFn: () => courseService.getOne(id!),
        enabled: !!id,
    });

    const completeMutation = useMutation({
        mutationFn: () => courseService.completeLesson(lessonId!),
        onSuccess: data => {
            qc.invalidateQueries({ queryKey: ['course', id] });
            qc.invalidateQueries({ queryKey: ['lesson', lessonId] });

            if (data.courseComplete) {
                message.success(t('courseSuccessComplete'));
                navigate(`/courses/${id}`);
                return;
            }

            if (lesson?.nextLessonId) {
                navigate(`/courses/${id}/lessons/${lesson.nextLessonId}`);
            } else {
                navigate(`/courses/${id}`);
            }
        },
        onError: () => message.error(t('failedMarkComplete')),
    });

    if (isLoading) return <div className={styles.centered}><Spin /></div>;
    if (!lesson) return null;

    const lessons = course?.lessons ?? [];
    const currentIdx = lessons.findIndex(l => l.id === lessonId);

    return (
        <div className={styles.shell}>
            {/* Sidebar nav */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHead}>
                    <div
                        className={styles.sidebarTitle}
                        onClick={() => navigate(`/courses/${id}`)}
                    >
                        {course?.title ?? t('coursesBackBtn')}
                    </div>
                    <div className={styles.sidebarSub}>
                        {t('lessonOfLabel')
                            .replace('{current}', (currentIdx + 1).toString())
                            .replace('{total}', lessons.length.toString())}
                    </div>
                    <div className={styles.sidebarProgBar}>
                        <div
                            className={styles.sidebarProgFill}
                            style={{ width: `${course?.progressPct ?? 0}%` }}
                        />
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {lessons.map((l, i) => (
                        <div
                            key={l.id}
                            className={`${styles.navItem}
                ${l.id === lessonId ? styles.navItemActive : ''}
                ${l.isLocked ? styles.navItemLocked : ''}
              `}
                            onClick={() => {
                                if (!l.isLocked) navigate(`/courses/${id}/lessons/${l.id}`);
                            }}
                        >
                            <div className={`${styles.navNum}
                ${l.isCompleted ? styles.navNumDone : ''}
                ${l.id === lessonId ? styles.navNumActive : ''}
              `}>
                                {l.isCompleted ? '✓' : i + 1}
                            </div>
                            <div className={`${styles.navTitle} ${l.id === lessonId ? styles.navTitleActive : ''}`}>
                                {l.title}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className={styles.main}>
                <div className={styles.breadcrumb}>
                    <span onClick={() => navigate('/courses')} className={styles.breadLink}>{t('coursesBackBtn')}</span>
                    <span className={styles.breadSep}>›</span>
                    <span onClick={() => navigate(`/courses/${id}`)} className={styles.breadLink}>
                        {course?.title}
                    </span>
                    <span className={styles.breadSep}>›</span>
                    <span>{lesson.title}</span>
                </div>

                <div className={styles.lessonHeader}>
                    <h1 className={styles.lessonTitle}>{lesson.title}</h1>
                    <div className={styles.lessonMeta}>
                        <span className={styles.badgeNeutral}>
                            {lesson.type === 'READING' ? `📄 ${t('allLevel') === 'Tất cả' ? 'Bài đọc' : 'Reading'}` : lesson.type === 'VOCABULARY' ? `⬡ ${t('vocabLessonTitle')}` : `◈ ${t('quizLessonTitle')}`}
                        </span>
                        {lesson.durationMins && (
                            <span className={styles.metaMuted}>
                                {t('durationMinsUnit').replace('{mins}', lesson.durationMins.toString())}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content area by type */}
                {lesson.type === 'READING' && (
                    <div
                        className={styles.readingContent}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content ?? '') }}
                    />
                )}

                {lesson.type === 'VOCABULARY' && (
                    <div className={styles.vocabNote}>
                        <div className={styles.vocabIcon}>⬡</div>
                        <div className={styles.vocabTitle}>{t('vocabLessonTitle')}</div>
                        <p className={styles.vocabDesc}>
                            {t('vocabLessonDesc')}
                        </p>
                        <button
                            className={styles.bigBtn}
                            onClick={() => navigate(`/flashcards/${lesson.flashcardSetId}/study`)}
                        >
                            {t('openFlashcardsBtn')}
                        </button>
                    </div>
                )}

                {lesson.type === 'QUIZ' && (
                    <div className={styles.vocabNote}>
                        <div className={styles.vocabIcon}>◈</div>
                        <div className={styles.vocabTitle}>{t('quizLessonTitle')}</div>
                        <p className={styles.vocabDesc}>
                            {t('quizLessonDesc')}
                        </p>
                        <button
                            className={styles.bigBtn}
                            onClick={() => navigate(`/quiz/${lesson.quizId}/play`)}
                        >
                            {t('startQuizBtn')}
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        className={styles.backBtn}
                        onClick={() => navigate(`/courses/${id}`)}
                    >
                        {t('backToCourseBtn')}
                    </button>

                    <div className={styles.actRight}>
                        {lesson.isCompleted ? (
                            <button
                                className={styles.completedBtn}
                                onClick={() => lesson.nextLessonId
                                    ? navigate(`/courses/${id}/lessons/${lesson.nextLessonId}`)
                                    : navigate(`/courses/${id}`)
                                }
                            >
                                {lesson.nextLessonId ? t('nextLessonBtn') : t('backToCourseBtn')}
                            </button>
                        ) : (
                            <button
                                className={styles.markBtn}
                                onClick={() => completeMutation.mutate()}
                                disabled={completeMutation.isPending}
                            >
                                {completeMutation.isPending ? t('savingText') : t('markAsCompleteBtn')}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LessonViewerPage;