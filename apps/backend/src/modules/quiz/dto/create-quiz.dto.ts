import {
    IsString, IsOptional, IsInt, IsBoolean, IsUUID, Min, Max,
} from 'class-validator';

export class CreateQuizDto {
    @IsString()
    title: string;

    @IsUUID()
    flashcardSetId: string;

    @IsInt() @Min(5) @Max(100)
    questionCount: number = 10;

    @IsBoolean()
    shuffle: boolean = true;

    @IsOptional()
    @IsInt() @Min(10)
    timeLimitSecs?: number;

    // Which types to generate — at least one required
    includeMultipleChoice: boolean = true;
    includeTrueFalse: boolean = true;
    includeFillInBlank: boolean = false;
}