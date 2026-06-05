import React, { useState } from 'react';
import type { Message } from '@/types/chat.types';
import styles from './index.less';

interface Props {
    message: Message;
    modeIcon?: string;
    streaming?: boolean;
}

// Minimal markdown renderer — handles bold, italic, line breaks
function renderMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

const MessageBubble: React.FC<Props> = ({ message, modeIcon = '✦', streaming = false }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className={`${styles.wrap} ${isUser ? styles.wrapUser : ''}`}>
            <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAI}`}>
                {isUser ? 'U' : modeIcon}
            </div>
            <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAI}`}>
                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{
                        __html: renderMarkdown(message.content) + (streaming ? '<span class="cursor">▋</span>' : ''),
                    }}
                />
                {!isUser && !streaming && (
                    <button className={styles.copyBtn} onClick={handleCopy}>
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;