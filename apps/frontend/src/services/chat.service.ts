import { api } from './api';
import type { Conversation, ChatMode, StreamChunk } from '@/types/chat.types';

const BASE = '/chat';

export const chatService = {
    getConversations: (): Promise<Conversation[]> =>
        api.get(`${BASE}/conversations`).then((r: any) => r.data),

    getConversation: (id: string): Promise<Conversation> =>
        api.get(`${BASE}/conversations/${id}`).then((r: any) => r.data),

    createConversation: (mode: ChatMode): Promise<Conversation> =>
        api.post(`${BASE}/conversations`, { mode }).then((r: any) => r.data),

    deleteConversation: (id: string): Promise<void> =>
        api.delete(`${BASE}/conversations/${id}`).then((r: any) => r.data),

    // SSE streaming — returns an AsyncGenerator
    streamMessage: async function* (
        conversationId: string,
        message: string,
        token: string,
    ): AsyncGenerator<StreamChunk> {
        const response = await fetch(
            `${process.env.API_URL ?? 'http://localhost:3000'}/api/chat/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ conversationId, message }),
            },
        );

        if (!response.ok || !response.body) {
            yield { error: 'Connection failed' };
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const chunk: StreamChunk = JSON.parse(line.slice(6));
                        yield chunk;
                        if (chunk.done) return;
                    } catch {
                        // skip malformed
                    }
                }
            }
        }
    },
};