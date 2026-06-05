export type ChatMode =
    | 'GRAMMAR_CHECK'
    | 'WORD_EXPLAINER'
    | 'FREE_CHAT'
    | 'SENTENCE_FIXER';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    mode: ChatMode;
    title: string | null;
    messages?: Message[];
    _count?: { messages: number };
    updatedAt: string;
}

export interface StreamChunk {
    delta?: string;
    done?: boolean;
    error?: string;
}

export const CHAT_MODES: Record<ChatMode, { label: string; icon: string; placeholder: string; suggestions: string[] }> = {
    GRAMMAR_CHECK: {
        label: 'Grammar check',
        icon: '✦',
        placeholder: 'Paste a sentence to check grammar…',
        suggestions: [
            'She don\'t like cats',
            'I have went there before',
            'He is more taller than me',
        ],
    },
    WORD_EXPLAINER: {
        label: 'Word explainer',
        icon: '◎',
        placeholder: 'Type any word or phrase…',
        suggestions: ['meticulous', 'paradigm', 'pull off'],
    },
    FREE_CHAT: {
        label: 'Free chat',
        icon: '○',
        placeholder: 'Chat in English freely…',
        suggestions: [
            'Help me practice small talk',
            'What\'s the difference between "make" and "do"?',
            'How do I sound more natural?',
        ],
    },
    SENTENCE_FIXER: {
        icon: '◈',
        label: 'Sentence fixer',
        placeholder: 'Paste an awkward sentence to improve…',
        suggestions: [
            'According to my opinion...',
            'I am very much agree with you',
            'The reason is because...',
        ],
    },
};