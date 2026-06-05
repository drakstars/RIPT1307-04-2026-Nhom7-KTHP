import { Injectable } from '@nestjs/common';

import { QuestionType } from '@prisma/client';

interface GeneratedQuestion {
    type: QuestionType;
    prompt: string;
    options: string[] | null;
    answer: string;
    explanation: string;
    order: number;
}

@Injectable()
export class QuizGeneratorService {
    generate(
        cards: { front: string; back: string; hint?: string | null }[],
        config: {
            count: number;
            shuffle: boolean;
            includeMultipleChoice: boolean;
            includeTrueFalse: boolean;
            includeFillInBlank: boolean;
        },
    ): GeneratedQuestion[] {
        if (!cards.length) return [];

        const pool = config.shuffle ? this.shuffleArr([...cards]) : [...cards];
        const slice = pool.slice(0, config.count);

        // Build enabled types list
        const types: QuestionType[] = [];
        if (config.includeMultipleChoice) types.push(QuestionType.MULTIPLE_CHOICE);
        if (config.includeTrueFalse) types.push(QuestionType.TRUE_FALSE);
        if (config.includeFillInBlank) types.push(QuestionType.FILL_IN_BLANK);
        if (!types.length) types.push(QuestionType.MULTIPLE_CHOICE);

        return slice.map((card, i) => {
            const type = types[i % types.length];
            const otherBacks = pool.filter(c => c !== card).map(c => c.back);

            switch (type) {
                case QuestionType.MULTIPLE_CHOICE:
                    return this.makeMC(card, otherBacks, i);
                case QuestionType.TRUE_FALSE:
                    return this.makeTF(card, pool, i);
                case QuestionType.FILL_IN_BLANK:
                    return this.makeFill(card, i);
            }
        });
    }

    private makeMC(
        card: { front: string; back: string; hint?: string | null },
        otherBacks: string[],
        order: number,
    ): GeneratedQuestion {
        const distractors = this.shuffleArr(otherBacks).slice(0, 3);
        while (distractors.length < 3) {
            distractors.push('(No option available)');
        }

        const options = this.shuffleArr([card.back, ...distractors]);
        const answer = card.back;

        return {
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: `What is the meaning of "${card.front}"?`,
            options,
            answer,
            explanation: card.hint
                ? `Correct! ${card.hint}`
                : `The correct meaning of "${card.front}" is: ${card.back}.`,
            order,
        };
    }

    private makeTF(
        card: { front: string; back: string },
        pool: { front: string; back: string }[],
        order: number,
    ): GeneratedQuestion {
        // 50% chance of showing a wrong definition
        const showWrong = Math.random() > 0.5;
        let displayDef = card.back;
        let isTrue = true;

        if (showWrong) {
            const other = pool.find(c => c !== card);
            if (other) {
                displayDef = other.back;
                isTrue = false;
            }
        }

        return {
            type: QuestionType.TRUE_FALSE,
            prompt: `True or False: The word "${card.front}" means "${displayDef}."`,
            options: null,
            answer: isTrue ? 'true' : 'false',
            explanation: isTrue
                ? `Correct! "${card.front}" does mean "${card.back}".`
                : `False. "${card.front}" actually means "${card.back}", not "${displayDef}".`,
            order,
        };
    }

    private makeFill(
        card: { front: string; back: string },
        order: number,
    ): GeneratedQuestion {
        return {
            type: QuestionType.FILL_IN_BLANK,
            prompt: `Fill in the blank: "${card.front}" means "___________".`,
            options: null,
            answer: card.back.toLowerCase().trim(),
            explanation: `The word "${card.front}" means "${card.back}".`,
            order,
        };
    }

    private shuffleArr<T>(arr: T[]): T[] {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}