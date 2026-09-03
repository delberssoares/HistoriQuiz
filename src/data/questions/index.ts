import { ATLETAS_QUESTIONS } from './atleta';
import { CIENCIA_TECNOLOGIA_QUESTIONS } from './ciencia-tecnologia';
import { ENTRETENIMENTO_QUESTIONS } from './entretenimento';
import { GERAL_QUESTIONS } from './geral';
import { MUSICA_QUESTIONS } from './musica';
import { POLITICA_QUESTIONS } from './politica';
import { Question } from './types';

export const QUESTION_BANKS: Record<string, Question[]> = {
  geral: GERAL_QUESTIONS,
  atletas: ATLETAS_QUESTIONS,
  musica: MUSICA_QUESTIONS,
  'ciencia-tecnologia': CIENCIA_TECNOLOGIA_QUESTIONS,
  entretenimento: ENTRETENIMENTO_QUESTIONS,
  politica: POLITICA_QUESTIONS,
};

export function getQuestionBank(category: string): Question[] {
  return QUESTION_BANKS[category] ?? QUESTION_BANKS.geral;
}