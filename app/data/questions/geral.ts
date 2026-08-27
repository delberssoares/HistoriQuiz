import { ATLETAS_QUESTIONS } from './atleta';
import { CIENCIA_TECNOLOGIA_QUESTIONS } from './ciencia-tecnologia';
import { ENTRETENIMENTO_QUESTIONS } from './entretenimento';
import { MUSICA_QUESTIONS } from './musica';
import { POLITICA_QUESTIONS } from './politica';
import { Question } from './types';

const RAW_GERAL: Omit<Question, 'id'>[] = [
];

const GERAL_PROPRIAS: Question[] = RAW_GERAL.map((q, i) => ({
  ...q,
  id: `geral-${i + 1}`,
}));

export const GERAL_QUESTIONS: Question[] = [
  ...GERAL_PROPRIAS,
  ...ATLETAS_QUESTIONS,
  ...CIENCIA_TECNOLOGIA_QUESTIONS,
  ...ENTRETENIMENTO_QUESTIONS,
  ...MUSICA_QUESTIONS,
  ...POLITICA_QUESTIONS,
];