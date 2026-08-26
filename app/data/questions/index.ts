import { FUTEBOL_QUESTIONS } from './futebol';
import { GERAL_QUESTIONS } from './geral';
import { Question } from './types';

export const QUESTION_BANKS: Record<string, Question[]> = {
  geral: GERAL_QUESTIONS,
  futebol: FUTEBOL_QUESTIONS,
};

export function getQuestionBank(category: string): Question[] {
  return QUESTION_BANKS[category] ?? QUESTION_BANKS.geral;
}