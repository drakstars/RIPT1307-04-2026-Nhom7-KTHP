import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPTS } from './chat.prompt';
import { ChatMode } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class ChatService {
    private readonly openai: OpenAI;

    constructor(
        private readonly prisma: PrismaService,
        private readonly paymentService: PaymentService,
    ) {
        this.openai = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }

    // ─── Conversations list ───────────────────────────────────

    async getConversations(userId: string) {
        const numUserId = Number(userId);
        return this.prisma.conversation.findMany({
            where: { userId: numUserId },
            include: {
                _count: { select: { messages: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true, createdAt: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
    }

    async getConversation(id: string, userId: string) {
        const numUserId = Number(userId);
        const conv = await this.prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });

        if (!conv) throw new NotFoundException();
        if (conv.userId !== numUserId) throw new ForbiddenException();
        return conv;
    }

    async createConversation(userId: string, mode: ChatMode) {
        const numUserId = Number(userId);
        return this.prisma.conversation.create({
            data: { userId: numUserId, mode },
        });
    }

    async deleteConversation(id: string, userId: string) {
        const numUserId = Number(userId);
        const conv = await this.prisma.conversation.findUnique({ where: { id } });
        if (!conv) throw new NotFoundException();
        if (conv.userId !== numUserId) throw new ForbiddenException();
        await this.prisma.conversation.delete({ where: { id } });
        return { message: 'Deleted' };
    }

    // ─── Stream chat ──────────────────────────────────────────

    async streamChat(
        userId: string,
        conversationId: string,
        userMessage: string,
        res: Response,
    ) {
        const numUserId = Number(userId);

        // Check daily limit for FREE users
        const { limits } = await this.paymentService.getLimits(numUserId);
        if (limits.maxAiMessagesPerDay !== null) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const count = await this.prisma.chatMessage.count({
                where: {
                    role: 'user',
                    conversation: { userId: numUserId },
                    createdAt: { gte: today },
                },
            });
            if (count >= limits.maxAiMessagesPerDay) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.write(`data: ${JSON.stringify({ error: 'Daily limit reached. Upgrade to Pro for unlimited messages.' })}\n\n`);
                res.end();
                return;
            }
        }
        // Verify ownership
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 10, // last 10 messages for context
                },
            },
        });

        if (!conv) throw new NotFoundException('Conversation not found');
        if (conv.userId !== numUserId) throw new ForbiddenException();

        // Save user message
        await this.prisma.chatMessage.create({
            data: {
                conversationId,
                role: 'user',
                content: userMessage,
            },
        });

        // Auto-title conversation from first message
        if (!conv.title && conv.messages.length === 0) {
            const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '…' : '');
            await this.prisma.conversation.update({
                where: { id: conversationId },
                data: { title, updatedAt: new Date() },
            });
        } else {
            await this.prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });
        }

        // Build message history for OpenAI
        const history = conv.messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        // Add current user message
        history.push({ role: 'user', content: userMessage });

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        let fullResponse = '';

        const apiKey = process.env.GROQ_API_KEY;
        const isPlaceholder = !apiKey || apiKey === 'your_groq_api_key_here';

        if (isPlaceholder) {
            const simulatedText = `🤖 **[MOCK CHATBOT ASSISTANT]**\n\nChào bạn! Hiện tại chatbot chưa thể trả lời thực tế vì **GROQ_API_KEY** trong file \`apps/backend/.env\` đang để trống hoặc là giá trị mặc định (\`your_groq_api_key_here\`).\n\nĐể kích hoạt chatbot thật kết nối với AI:\n1. Đăng ký tài khoản và lấy API Key miễn phí tại [Groq Console](https://console.groq.com/keys).\n2. Mở file \`apps/backend/.env\` của bạn ra (đang có mở trên IDE của bạn).\n3. Điền API Key của bạn vào dòng: \`GROQ_API_KEY="gsk_..."\` rồi lưu lại.\n4. Hệ thống NestJS sẽ tự động reload và sẵn sàng hoạt động ngay lập tức!\n\n---\n\n📝 **Demo phản hồi giả lập dựa trên tin nhắn của bạn ("${userMessage.replace(/"/g, '\\"').slice(0, 50)}"):**\n\n> Tôi đã nhận được yêu cầu của bạn ở chế độ **${conv.mode}**. Hệ thống kết nối và giao diện đang hoạt động rất tốt, chỉ cần cấu hình khóa API thực tế để bắt đầu học tập và sửa lỗi tiếng Anh cùng AI!`;

            const words = simulatedText.split(' ');
            for (let i = 0; i < words.length; i++) {
                const delta = (i === 0 ? '' : ' ') + words[i];
                fullResponse += delta;
                res.write(`data: ${JSON.stringify({ delta })}\n\n`);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

            if (fullResponse) {
                await this.prisma.chatMessage.create({
                    data: {
                        conversationId,
                        role: 'assistant',
                        content: fullResponse,
                    },
                });
            }
            res.end();
            return;
        }

        try {
            const stream = await this.openai.chat.completions.create({
                model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPTS[conv.mode] },
                    ...history,
                ],
                max_tokens: 1000,
                stream: true,
                temperature: 0.7,
            });

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content ?? '';
                if (delta) {
                    fullResponse += delta;
                    // Send SSE event
                    res.write(`data: ${JSON.stringify({ delta })}\n\n`);
                }

                // Check if stream is done
                if (chunk.choices[0]?.finish_reason === 'stop') {
                    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                    break;
                }
            }
        } catch (error: any) {
            const msg = error?.message ?? 'AI service unavailable';
            res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
        }

        // Save assistant response to DB
        if (fullResponse) {
            await this.prisma.chatMessage.create({
                data: {
                    conversationId,
                    role: 'assistant',
                    content: fullResponse,
                },
            });
        }

        res.end();

    }
}