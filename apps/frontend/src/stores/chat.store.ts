import { create } from 'zustand';
import type { Message, Conversation, ChatMode } from '@/types/chat.types';

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    streamingContent: string;
    isStreaming: boolean;
    activeMode: ChatMode;

    setConversations: (convs: Conversation[]) => void;
    setActiveConversation: (id: string) => void;
    setMessages: (msgs: Message[]) => void;
    appendUserMessage: (content: string) => void;
    appendStreamDelta: (delta: string) => void;
    finalizeStream: () => void;
    finalizeStreamWithContent: (content: string) => void;
    setStreaming: (v: boolean) => void;
    setMode: (mode: ChatMode) => void;
    reset: () => void;
}

let tempId = 0;

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    streamingContent: '',
    isStreaming: false,
    activeMode: 'GRAMMAR_CHECK',

    setConversations: convs => set({ conversations: convs }),

    setActiveConversation: id => set({ activeConversationId: id }),

    setMessages: msgs => set({ messages: msgs, streamingContent: '' }),

    appendUserMessage: content =>
        set(s => ({
            messages: [
                ...s.messages,
                {
                    id: `temp-${++tempId}`,
                    role: 'user',
                    content,
                    createdAt: new Date().toISOString(),
                },
            ],
        })),

    appendStreamDelta: delta =>
        set(s => ({ streamingContent: s.streamingContent + delta })),

    finalizeStream: () =>
        set(s => ({
            messages: [
                ...s.messages,
                {
                    id: `temp-${++tempId}`,
                    role: 'assistant',
                    content: s.streamingContent,
                    createdAt: new Date().toISOString(),
                },
            ],
            streamingContent: '',
            isStreaming: false,
        })),

    finalizeStreamWithContent: (content: string) =>
        set(s => ({
            messages: [
                ...s.messages,
                {
                    id: `temp-${++tempId}`,
                    role: 'assistant',
                    content,
                    createdAt: new Date().toISOString(),
                },
            ],
            streamingContent: '',
            isStreaming: false,
        })),

    setStreaming: v => set({ isStreaming: v }),
    setMode: mode => set({ activeMode: mode }),
    reset: () => set({ messages: [], streamingContent: '', isStreaming: false }),
}));