import {
    IsString, IsEnum, IsOptional, IsBoolean, IsInt, IsArray,
    ValidateNested, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel, LessonType } from '@prisma/client';

export class CreateLessonDto {
    @IsString()
    title: string;

    @IsEnum(LessonType)
    type: LessonType;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsInt()
    durationMins?: number;

    @IsOptional()
    @IsUUID()
    flashcardSetId?: string;

    @IsOptional()
    @IsUUID()
    quizId?: string;

    @IsInt()
    order: number;
}

export class CreateCourseDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsEnum(CourseLevel)
    level: CourseLevel;

    @IsOptional()
    @IsString()
    emoji?: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateLessonDto)
    lessons?: CreateLessonDto[];
}