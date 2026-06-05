import type { GameCard, MatchingPair, MemoryCard, DragQuestion } from '@/types/game.types';

export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Build matching pairs from flashcards
export function buildMatchingPairs(cards: GameCard[], count = 6): MatchingPair[] {
    return shuffle(cards)
        .slice(0, count)
        .map(c => ({ id: c.id, word: c.front, definition: c.back }));
}

// Build memory cards (word + def per pair)
export function buildMemoryCards(cards: GameCard[], count = 8): MemoryCard[] {
    const pairs = shuffle(cards).slice(0, count);
    const memCards: MemoryCard[] = [];

    pairs.forEach(card => {
        memCards.push({
            uid: `${card.id}-word`,
            pairId: card.id,
            text: card.front,
            type: 'word',
            isFlipped: false,
            isMatched: false,
        });
        memCards.push({
            uid: `${card.id}-def`,
            pairId: card.id,
            text: card.back,
            type: 'def',
            isFlipped: false,
            isMatched: false,
        });
    });

    return shuffle(memCards);
}

// Build drag & drop questions from flashcards
// Strategy: take the word, build a sentence template with a blank
export function buildDragQuestions(cards: GameCard[], count = 5): DragQuestion[] {
    const selected = shuffle(cards).slice(0, count);
    const allWords = cards.map(c => c.front);

    return selected.map((card, i) => {
        // Simple sentence templates
        const templates = [
            `The word that means "${card.back}" is ___.`,
            `___ describes: "${card.back}".`,
            `Choose the correct word: ${card.back} → ___.`,
        ];
        const sentence = templates[i % templates.length];

        // Distractors: 4 random other words
        const distractors = shuffle(allWords.filter(w => w !== card.front)).slice(0, 4);
        const options = shuffle([card.front, ...distractors]);

        return {
            id: card.id,
            sentence,
            answer: card.front,
            options,
            hint: undefined,
        };
    });
}