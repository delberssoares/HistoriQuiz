import { Question } from './types';

export const FUTEBOL_QUESTIONS: Question[] = [
  {
    id: 1, category: 'futebol', level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Pelé',
    image: require('@/assets/images/people/nivel1/pele.webp'),
    aliases: ['pelé', 'pele'],
    options: ['Pelé', 'Zico', 'Ronaldo', 'Romário'],
    hint: 'Considerado o maior jogador de futebol de todos os tempos',
  },
  // ... 9 perguntas por nível × 10 níveis = 100 no total, seguindo o mesmo
  // esquema de dificuldade que "geral" já usa (níveis 1-3 easy, 4-5 medium, etc.)
];