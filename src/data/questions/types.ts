export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface Question {
  id: string;
  category: string;
  level: number;
  difficulty: Difficulty;
  question: string;
  answer: string;
  aliases: string[];
  options: string[];
  hint: string;
  image?: ReturnType<typeof require>;
}