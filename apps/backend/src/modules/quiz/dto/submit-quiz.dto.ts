import { IsUUID, IsObject, IsOptional, IsInt } from 'class-validator';

export class SubmitQuizDto {
    @IsUUID()
    quizId: string;

    @IsObject()
    answers: Record<string, string>; // questionId -> answer string

    @IsOptional()
    @IsInt()
    timeTaken?: number;
}