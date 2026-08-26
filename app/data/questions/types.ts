export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface Question {
  id: number;                 // único DENTRO da categoria (ou global, ver nota abaixo)
  category: string;           // 'geral' | 'futebol' | 'atletas' | ...
  level: number;
  difficulty: Difficulty;
  question: string;
  answer: string;
  aliases: string[];
  options: string[];
  hint: string;
  image?: ReturnType<typeof require>;
}