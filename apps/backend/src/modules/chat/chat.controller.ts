import {
    Controller, Get, Post, Delete, Body, Param,
    UseGuards, Request, Res, Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsEnum, IsUUID } from 'class-validator';
import { ChatMode } from '@prisma/client';

class CreateConversationDto {
    @IsEnum(ChatMode)
    mode: ChatMode;
}

class SendMessageDto {
    @IsUUID()
    conversationId: string;

    @IsString()
    message: string;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('conversations')
    getConversations(@Request() req: any) {
        return this.chatService.getConversations(req.user.id);
    }

    @Get('conversations/:id')
    getConversation(@Param('id') id: string, @Request() req: any) {
        return this.chatService.getConversation(id, req.user.id);
    }

    @Post('conversations')
    createConversation(@Body() dto: CreateConversationDto, @Request() req: any) {
        return this.chatService.createConversation(req.user.id, dto.mode);
    }

    @Delete('conversations/:id')
    deleteConversation(@Param('id') id: string, @Request() req: any) {
        return this.chatService.deleteConversation(id, req.user.id);
    }

    // SSE streaming endpoint
    @Post('stream')
    async stream(
        @Body() dto: SendMessageDto,
        @Request() req: any,
        @Res() res: any,
    ) {
        await this.chatService.streamChat(
            req.user.id,
            dto.conversationId,
            dto.message,
            res,
        );
    }
}