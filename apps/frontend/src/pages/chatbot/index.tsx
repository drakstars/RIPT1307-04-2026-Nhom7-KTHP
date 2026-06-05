import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popconfirm } from 'antd';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/stores/chat.store';
import { useAuthStore } from '@/stores/auth.store';
import MessageBubble from '@/components/common/MessageBubble';
import { CHAT_MODES, type ChatMode } from '@/types/chat.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const ChatbotPage: React.FC = () => {
    const qc = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState('');
    const { accessToken } = useAuthStore();
    const { t, language } = useTranslation();

    const {
        conversations, messages, streamingContent, isStreaming,
        activeMode, activeConversationId,
        setConversations, setMessages, setActiveConversation,
        appendUserMessage, appendStreamDelta, finalizeStream, finalizeStreamWithContent,
        setStreaming, setMode, reset,
    } = useChatStore();

    const { data: convList } = useQuery({
        queryKey: ['conversations'],
        queryFn: chatService.getConversations,
    });

    useEffect(() => {
        if (convList) setConversations(convList);
    }, [convList]);

    const createConvMutation = useMutation({
        mutationFn: (mode: ChatMode) => chatService.createConversation(mode),
        onSuccess: conv => {
            qc.invalidateQueries({ queryKey: ['conversations'] });
            setActiveConversation(conv.id);
            reset();
        },
    });

    const loadConversation = async (id: string) => {
        setActiveConversation(id);
        const conv = await chatService.getConversation(id);
        setMessages(conv.messages ?? []);
        if (conv.mode) setMode(conv.mode as ChatMode);
    };

    const deleteConvMutation = useMutation({
        mutationFn: chatService.deleteConversation,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['conversations'] });
            setActiveConversation('');
            reset();
        },
    });

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    const handleNewChat = (mode: ChatMode) => {
        setMode(mode);
        createConvMutation.mutate(mode);
    };

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || isStreaming) return;

        // Create conversation if none active
        let convId = activeConversationId;
        if (!convId) {
            const conv = await chatService.createConversation(activeMode);
            convId = conv.id;
            setActiveConversation(conv.id);
            qc.invalidateQueries({ queryKey: ['conversations'] });
        }

        setInput('');
        appendUserMessage(text);
        setStreaming(true);

        // Accumulate locally to avoid React 18 batching reading stale state
        let accumulated = '';

        try {
            for await (const chunk of chatService.streamMessage(convId, text, accessToken ?? '')) {
                if (chunk.error) {
                    finalizeStreamWithContent(`⚠️ ${chunk.error}`);
                    break;
                }
                if (chunk.delta) {
                    accumulated += chunk.delta;
                    appendStreamDelta(chunk.delta);
                }
                if (chunk.done) {
                    finalizeStreamWithContent(accumulated);
                }
            }
        } catch (e: any) {
            finalizeStreamWithContent(`⚠️ ${e?.message ?? 'Failed to connect to AI service'}`);
        }
    }, [input, isStreaming, activeConversationId, activeMode, accessToken]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getModeLabel = (mode: ChatMode) => {
        if (mode === 'GRAMMAR_CHECK') return t('grammarCheckLabel');
        if (mode === 'WORD_EXPLAINER') return t('wordExplainerLabel');
        if (mode === 'FREE_CHAT') return t('freeChatLabel');
        return t('sentenceFixerLabel');
    };

    const getModeEmptySub = (mode: ChatMode) => {
        if (mode === 'GRAMMAR_CHECK') return t('grammarCheckEmpty');
        if (mode === 'WORD_EXPLAINER') return t('wordExplainerEmpty');
        if (mode === 'FREE_CHAT') return t('freeChatEmpty');
        return t('sentenceFixerEmpty');
    };

    const getModePlaceholder = (mode: ChatMode) => {
        if (mode === 'GRAMMAR_CHECK') return language === 'vi' ? 'Dán một câu để kiểm tra ngữ pháp…' : 'Paste a sentence to check grammar…';
        if (mode === 'WORD_EXPLAINER') return language === 'vi' ? 'Nhập bất kỳ từ hoặc cụm từ nào…' : 'Type any word or phrase…';
        if (mode === 'FREE_CHAT') return language === 'vi' ? 'Trò chuyện bằng tiếng Anh tự do…' : 'Chat in English freely…';
        return language === 'vi' ? 'Dán một câu chưa tự nhiên để cải thiện…' : 'Paste an awkward sentence to improve…';
    };

    const modeConfig = CHAT_MODES[activeMode];
    const showEmpty = messages.length === 0 && !streamingContent;

    return (
        <div className={styles.shell}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sbHead}>
                    <div className={styles.sbTitle}>{t('aiTutorTitle')}</div>
                    <div className={styles.sbSub}>{t('aiTutorSub')}</div>
                </div>

                {/* Modes */}
                <div className={styles.modeList}>
                    {(Object.keys(CHAT_MODES) as ChatMode[]).map(mode => {
                        const m = CHAT_MODES[mode];
                        return (
                            <button
                                key={mode}
                                className={`${styles.modeItem} ${activeMode === mode ? styles.modeItemOn : ''}`}
                                onClick={() => handleNewChat(mode)}
                            >
                                <span className={styles.modeIcon}>{m.icon}</span>
                                <span className={styles.modeLabel}>{getModeLabel(mode)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* History */}
                {(convList ?? []).length > 0 && (
                    <>
                        <div className={styles.histLabel}>{t('recentChatsLabel')}</div>
                        <div className={styles.histList}>
                            {(convList ?? []).map(conv => (
                                <div
                                    key={conv.id}
                                    className={`${styles.histItem} ${conv.id === activeConversationId ? styles.histItemOn : ''}`}
                                    onClick={() => loadConversation(conv.id)}
                                >
                                    <span className={styles.histIcon}>{CHAT_MODES[conv.mode as ChatMode]?.icon}</span>
                                    <span className={styles.histTitle}>
                                        {conv.title ?? getModeLabel(conv.mode as ChatMode)}
                                    </span>
                                    <Popconfirm
                                        title={t('deleteChatConfirm')}
                                        onConfirm={e => {
                                            e?.stopPropagation();
                                            deleteConvMutation.mutate(conv.id);
                                        }}
                                        okText={t('deleteBtn')} cancelText={t('cancelBtn')}
                                    >
                                        <button
                                            className={styles.histDelete}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            ×
                                        </button>
                                    </Popconfirm>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </aside>

            {/* Main */}
            <div className={styles.main}>
                <div className={styles.mainHead}>
                    <span className={styles.modeBadge}>{modeConfig.icon} {getModeLabel(activeMode)}</span>
                    <button
                        className={styles.clearBtn}
                        onClick={() => handleNewChat(activeMode)}
                    >
                        {t('newChatBtn')}
                    </button>
                </div>

                {/* Messages */}
                <div className={styles.messages}>
                    {showEmpty && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>{modeConfig.icon}</div>
                            <div className={styles.emptyTitle}>{getModeLabel(activeMode)}</div>
                            <div className={styles.emptySub}>
                                {getModeEmptySub(activeMode)}
                            </div>
                            {/* Suggestions */}
                            <div className={styles.emptySugs}>
                                {modeConfig.suggestions.map(s => (
                                    <button
                                        key={s}
                                        className={styles.sugBtn}
                                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            modeIcon={modeConfig.icon}
                        />
                    ))}

                    {/* Streaming assistant message */}
                    {isStreaming && streamingContent && (
                        <MessageBubble
                            message={{
                                id: 'streaming',
                                role: 'assistant',
                                content: streamingContent,
                                createdAt: new Date().toISOString(),
                            }}
                            modeIcon={modeConfig.icon}
                            streaming
                        />
                    )}

                    {/* Typing indicator — show while waiting for first delta */}
                    {isStreaming && !streamingContent && (
                        <div className={styles.typingWrap}>
                            <div className={styles.avatar}>{modeConfig.icon}</div>
                            <div className={styles.typing}>
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestion chips — only when not empty */}
                {!showEmpty && !isStreaming && (
                    <div className={styles.chips}>
                        {modeConfig.suggestions.slice(0, 2).map(s => (
                            <button
                                key={s}
                                className={styles.chip}
                                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className={styles.inputWrap}>
                    <textarea
                        ref={inputRef}
                        className={styles.inp}
                        placeholder={getModePlaceholder(activeMode)}
                        value={input}
                        rows={1}
                        onChange={e => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={isStreaming}
                    />
                    <button
                        className={styles.sendBtn}
                        onClick={handleSend}
                        disabled={isStreaming || !input.trim()}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;