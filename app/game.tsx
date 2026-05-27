import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// ─── Banco de perguntas ───────────────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

interface Question {
  id: number;
  question: string;
  answer: string;
  aliases: string[];
  options: string[];
  difficulty: Difficulty;
  hint: string;
  level: number;
  image?: ReturnType<typeof require>; // ← adicione isso
}

const ALL_QUESTIONS: Question[] = [
  // ── NÍVEL 1 ──────────────────────────────────────────────────────────────
  {
    id: 1, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Pelé',
    image: require('@/assets/images/people/pele.webp'),
    aliases: ['pelé', 'pele', 'edson', 'arantes'],
    options: ['Pelé', 'Zico', 'Ronaldo', 'Romário'],
    hint: 'Considerado o maior jogador de futebol de todos os tempos',
  },
  {
    id: 2, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Ayrton Senna',
    image: require('@/assets/images/people/ayrton.webp'),
    aliases: ['ayrton', 'senna'],
    options: ['Ayrton Senna', 'Alain Prost', 'Michael Schumacher', 'Nelson Piquet'],
    hint: 'Tricampeão mundial de Fórmula 1, ídolo brasileiro',
  },
  {
    id: 3, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Jackson',
    image: require('@/assets/images/people/michael.webp'),
    aliases: ['michael', 'jackson'],
    options: ['Michael Jackson', 'Prince', 'David Bowie', 'Elvis Presley'],
    hint: 'Rei do Pop',
  },
  {
    id: 4, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Cristiano Ronaldo',
    image: require('@/assets/images/people/cr7.webp'),
    aliases: ['cristiano', 'ronaldo', 'cr7'],
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Neymar', 'Mbappé'],
    hint: 'Conhecido como CR7, um dos maiores goleadores da história',
  },
  {
    id: 5, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Lionel Messi',
    image: require('@/assets/images/people/messi.webp'),
    aliases: ['lionel', 'messi', 'leo messi'],
    options: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar', 'Ronaldinho'],
    hint: 'Campeão mundial com a Argentina em 2022, La Pulga',
  },
  {
    id: 6, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Elvis Presley',
    image: require('@/assets/images/people/elvis.webp'),
    aliases: ['elvis', 'presley'],
    options: ['Elvis Presley', 'Chuck Berry', 'Jerry Lee Lewis', 'Buddy Holly'],
    hint: 'Rei do Rock and Roll',
  },
  {
    id: 7, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Albert Einstein',
    image: require('@/assets/images/people/albert.webp'),
    aliases: ['albert', 'einstein'],
    options: ['Albert Einstein', 'Isaac Newton', 'Nikola Tesla', 'Charles Darwin'],
    hint: 'Físico criador da teoria da relatividade',
  },
  {
    id: 8, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Neymar',
    image: require('@/assets/images/people/neymar.webp'),
    aliases: ['neymar', 'ney'],
    options: ['Neymar', 'Pelé', 'Ronaldinho', 'Kaká'],
    hint: 'Atacante brasileiro, ex-Barcelona e PSG',
  },
  {
    id: 9, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Muhammad Ali',
    image: require('@/assets/images/people/muhammadali.webp'),
    aliases: ['muhammad', 'ali', 'cassius clay'],
    options: ['Muhammad Ali', 'Mike Tyson', 'Joe Frazier', 'George Foreman'],
    hint: 'O maior boxeador de todos os tempos, "The Greatest"',
  },
  {
    id: 10, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Usain Bolt',
    image: require('@/assets/images/people/usainbolt.webp'),
    aliases: ['usain', 'bolt'],
    options: ['Usain Bolt', 'Carl Lewis', 'Maurice Greene', 'Asafa Powell'],
    hint: 'Jamaicano, homem mais rápido da história',
  },

  // ── NÍVEL 2 ──────────────────────────────────────────────────────────────
  {
    id: 11, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Elon Musk',
    aliases: ['elon', 'musk'],
    options: ['Elon Musk', 'Bill Gates', 'Jeff Bezos', 'Mark Zuckerberg'],
    hint: 'Fundador da Tesla e SpaceX, um dos homens mais ricos do mundo',
  },
  {
    id: 12, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Bill Gates',
    aliases: ['bill', 'gates'],
    options: ['Bill Gates', 'Steve Jobs', 'Elon Musk', 'Jeff Bezos'],
    hint: 'Cofundador da Microsoft',
  },
  {
    id: 13, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Jordan',
    aliases: ['michael', 'jordan', 'mj'],
    options: ['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Magic Johnson'],
    hint: 'Considerado o maior jogador de basquete de todos os tempos, Air Jordan',
  },
  {
    id: 14, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'LeBron James',
    aliases: ['lebron', 'james', 'king james'],
    options: ['LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Shaquille O\'Neal'],
    hint: 'King James, um dos maiores da NBA',
  },
  {
    id: 15, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Napoleão Bonaparte',
    aliases: ['napoleão', 'napoleao', 'bonaparte'],
    options: ['Napoleão Bonaparte', 'Júlio César', 'Alexandre o Grande', 'Genghis Khan'],
    hint: 'Imperador francês que conquistou boa parte da Europa',
  },
  {
    id: 16, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Adolf Hitler',
    aliases: ['adolf', 'hitler'],
    options: ['Adolf Hitler', 'Joseph Stalin', 'Benito Mussolini', 'Francisco Franco'],
    hint: 'Ditador alemão responsável pela Segunda Guerra Mundial e pelo Holocausto',
  },
  {
    id: 17, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Bob Marley',
    aliases: ['bob', 'marley'],
    options: ['Bob Marley', 'Jimmy Cliff', 'Peter Tosh', 'Burning Spear'],
    hint: 'Ícone do reggae jamaicano',
  },
  {
    id: 18, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Marilyn Monroe',
    aliases: ['marilyn', 'monroe'],
    options: ['Marilyn Monroe', 'Audrey Hepburn', 'Grace Kelly', 'Elizabeth Taylor'],
    hint: 'Ícone pop e sex symbol dos anos 50 e 60',
  },
  {
    id: 19, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Freddie Mercury',
    aliases: ['freddie', 'mercury'],
    options: ['Freddie Mercury', 'David Bowie', 'Mick Jagger', 'Robert Plant'],
    hint: 'Vocalista do Queen, um dos maiores frontmen da história do rock',
  },
  {
    id: 20, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'John Lennon',
    aliases: ['john', 'lennon'],
    options: ['John Lennon', 'Paul McCartney', 'George Harrison', 'Ringo Starr'],
    hint: 'Cofundador dos Beatles, autor de Imagine',
  },

  // ── NÍVEL 3 ──────────────────────────────────────────────────────────────
  {
    id: 21, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Donald Trump',
    aliases: ['donald', 'trump'],
    options: ['Donald Trump', 'Barack Obama', 'Joe Biden', 'George Bush'],
    hint: '45º e 47º presidente dos Estados Unidos',
  },
  {
    id: 22, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Barack Obama',
    aliases: ['barack', 'obama'],
    options: ['Barack Obama', 'Donald Trump', 'Bill Clinton', 'Joe Biden'],
    hint: 'Primeiro presidente negro dos Estados Unidos',
  },
  {
    id: 23, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Leonardo da Vinci',
    aliases: ['leonardo', 'da vinci', 'davinci'],
    options: ['Leonardo da Vinci', 'Michelangelo', 'Rafael', 'Donatello'],
    hint: 'Pintou a Mona Lisa e era também inventor',
  },
  {
    id: 24, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Marie Curie',
    aliases: ['marie', 'curie'],
    options: ['Marie Curie', 'Florence Nightingale', 'Ada Lovelace', 'Rosalind Franklin'],
    hint: 'Única pessoa a ganhar Nobel em duas ciências diferentes',
  },
  {
    id: 25, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Mahatma Gandhi',
    aliases: ['mahatma', 'gandhi'],
    options: ['Mahatma Gandhi', 'Nelson Mandela', 'Martin Luther King', 'Dalai Lama'],
    hint: 'Liderou a independência da Índia pela não-violência',
  },
  {
    id: 26, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Nelson Mandela',
    aliases: ['nelson', 'mandela'],
    options: ['Nelson Mandela', 'Mahatma Gandhi', 'Desmond Tutu', 'Steve Biko'],
    hint: 'Primeiro presidente negro da África do Sul',
  },
  {
    id: 27, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Walt Disney',
    aliases: ['walt', 'disney'],
    options: ['Walt Disney', 'Steven Spielberg', 'Charlie Chaplin', 'George Lucas'],
    hint: 'Criador do Mickey Mouse e fundador da Disney',
  },
  {
    id: 28, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Charles Chaplin',
    aliases: ['charles', 'chaplin', 'charlie chaplin'],
    options: ['Charles Chaplin', 'Buster Keaton', 'Harold Lloyd', 'Stan Laurel'],
    hint: 'Ator e diretor, ícone do cinema mudo com o personagem Carlitos',
  },
  {
    id: 29, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Stephen Hawking',
    aliases: ['stephen', 'hawking'],
    options: ['Stephen Hawking', 'Carl Sagan', 'Richard Feynman', 'Neil deGrasse Tyson'],
    hint: 'Físico teórico britânico, estudou buracos negros e o universo',
  },
  {
    id: 30, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Mark Zuckerberg',
    aliases: ['mark', 'zuckerberg', 'zuck'],
    options: ['Mark Zuckerberg', 'Elon Musk', 'Bill Gates', 'Jeff Bezos'],
    hint: 'Fundador do Facebook e Meta',
  },

  // ── NÍVEL 4 ──────────────────────────────────────────────────────────────
  {
    id: 31, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Winston Churchill',
    aliases: ['winston', 'churchill'],
    options: ['Winston Churchill', 'Franklin Roosevelt', 'Charles de Gaulle', 'Harry Truman'],
    hint: 'Primeiro-ministro britânico que liderou o Reino Unido na Segunda Guerra',
  },
  {
    id: 32, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Karl Marx',
    aliases: ['karl', 'marx'],
    options: ['Karl Marx', 'Friedrich Engels', 'Vladimir Lenin', 'Leon Trotsky'],
    hint: 'Filósofo alemão, autor do Manifesto Comunista',
  },
  {
    id: 33, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Sigmund Freud',
    aliases: ['sigmund', 'freud'],
    options: ['Sigmund Freud', 'Carl Jung', 'Alfred Adler', 'William James'],
    hint: 'Fundador da psicanálise',
  },
  {
    id: 34, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Nikola Tesla',
    aliases: ['nikola', 'tesla'],
    options: ['Nikola Tesla', 'Thomas Edison', 'Guglielmo Marconi', 'Heinrich Hertz'],
    hint: 'Inventor sérvio-americano pioneiro da corrente alternada',
  },
  {
    id: 35, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Isaac Newton',
    aliases: ['isaac', 'newton'],
    options: ['Isaac Newton', 'Galileu Galilei', 'Albert Einstein', 'Johannes Kepler'],
    hint: 'Formulou as leis do movimento e da gravidade universal',
  },
  {
    id: 36, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Martin Luther King',
    aliases: ['martin', 'luther', 'king', 'mlk'],
    options: ['Martin Luther King', 'Malcolm X', 'Nelson Mandela', 'Mahatma Gandhi'],
    hint: 'Líder do movimento dos direitos civis nos EUA, "I Have a Dream"',
  },
  {
    id: 37, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Che Guevara',
    aliases: ['che', 'guevara'],
    options: ['Che Guevara', 'Fidel Castro', 'Simón Bolívar', 'Hugo Chávez'],
    hint: 'Revolucionário argentino, ícone da esquerda mundial',
  },
  {
    id: 38, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Mother Teresa',
    aliases: ['mother teresa', 'madre teresa', 'teresa'],
    options: ['Mother Teresa', 'Florence Nightingale', 'Malala Yousafzai', 'Simone de Beauvoir'],
    hint: 'Freira albanesa, Nobel da Paz por seu trabalho com os pobres na Índia',
  },
  {
    id: 39, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Mozart',
    aliases: ['mozart', 'wolfgang', 'amadeus'],
    options: ['Mozart', 'Beethoven', 'Bach', 'Chopin'],
    hint: 'Compositor austríaco prodígio do século XVIII',
  },
  {
    id: 40, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Beethoven',
    aliases: ['beethoven', 'ludwig'],
    options: ['Beethoven', 'Mozart', 'Bach', 'Schubert'],
    hint: 'Compôs a 9ª Sinfonia mesmo após ficar surdo',
  },

  // ── NÍVEL 5 ──────────────────────────────────────────────────────────────
  {
    id: 41, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Michelangelo',
    aliases: ['michelangelo', 'buonarroti'],
    options: ['Michelangelo', 'Leonardo da Vinci', 'Rafael', 'Botticelli'],
    hint: 'Pintou o teto da Capela Sistina',
  },
  {
    id: 42, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Marco Polo',
    aliases: ['marco', 'polo'],
    options: ['Marco Polo', 'Cristóvão Colombo', 'Vasco da Gama', 'Fernão de Magalhães'],
    hint: 'Explorador veneziano que viajou até a China no século XIII',
  },
  {
    id: 43, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Cristóvão Colombo',
    aliases: ['cristóvão', 'cristovao', 'colombo', 'columbus'],
    options: ['Cristóvão Colombo', 'Vasco da Gama', 'Marco Polo', 'Américo Vespúcio'],
    hint: 'Navegador que chegou à América em 1492',
  },
  {
    id: 44, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Abraham Lincoln',
    aliases: ['abraham', 'lincoln'],
    options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'Theodore Roosevelt'],
    hint: 'Presidente americano que aboliu a escravidão nos EUA',
  },
  {
    id: 45, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Cleópatra',
    aliases: ['cleópatra', 'cleopatra'],
    options: ['Cleópatra', 'Nefertiti', 'Hatshepsut', 'Zenobia'],
    hint: 'Última rainha do Egito faraônico',
  },
  {
    id: 46, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Galileu Galilei',
    aliases: ['galileu', 'galilei', 'galileo'],
    options: ['Galileu Galilei', 'Nicolau Copérnico', 'Isaac Newton', 'Johannes Kepler'],
    hint: 'Astrônomo que confirmou que a Terra gira ao redor do Sol',
  },
  {
    id: 47, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Frida Kahlo',
    aliases: ['frida', 'kahlo'],
    options: ['Frida Kahlo', 'Georgia O\'Keeffe', 'Tamara de Lempicka', 'Berthe Morisot'],
    hint: 'Pintora mexicana famosa pelos autorretratos',
  },
  {
    id: 48, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Charles Darwin',
    aliases: ['charles', 'darwin'],
    options: ['Charles Darwin', 'Gregor Mendel', 'Louis Pasteur', 'Alexander Fleming'],
    hint: 'Propôs a teoria da evolução das espécies',
  },
  {
    id: 49, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Júlio César',
    aliases: ['júlio', 'julio', 'césar', 'cesar', 'julius caesar'],
    options: ['Júlio César', 'Marco Aurélio', 'Augusto César', 'Nero'],
    hint: 'General e ditador romano, "Vim, vi e venci"',
  },
  {
    id: 50, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Marco Aurélio',
    aliases: ['marco', 'aurélio', 'aurelio'],
    options: ['Marco Aurélio', 'Júlio César', 'Augusto César', 'Constantino'],
    hint: 'Imperador filósofo romano, autor das Meditações',
  },

  // ── NÍVEL 6 ──────────────────────────────────────────────────────────────
  {
    id: 51, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Simón Bolívar',
    aliases: ['simón', 'simon', 'bolívar', 'bolivar'],
    options: ['Simón Bolívar', 'José de San Martín', 'Francisco de Miranda', 'Antonio Sucre'],
    hint: 'Libertador de vários países da América do Sul',
  },
  {
    id: 52, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Sun Tzu',
    aliases: ['sun', 'tzu', 'sun tzu'],
    options: ['Sun Tzu', 'Confúcio', 'Lao-Tsé', 'Zhuge Liang'],
    hint: 'Estrategista e filósofo chinês, autor de A Arte da Guerra',
  },
  {
    id: 53, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Florence Nightingale',
    aliases: ['florence', 'nightingale'],
    options: ['Florence Nightingale', 'Clara Barton', 'Edith Cavell', 'Mary Seacole'],
    hint: 'Fundadora da enfermagem moderna',
  },
  {
    id: 54, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Ada Lovelace',
    aliases: ['ada', 'lovelace'],
    options: ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Charles Babbage'],
    hint: 'Considerada a primeira programadora da história',
  },
  {
    id: 55, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Harriet Tubman',
    aliases: ['harriet', 'tubman'],
    options: ['Harriet Tubman', 'Sojourner Truth', 'Frederick Douglass', 'Rosa Parks'],
    hint: 'Libertou dezenas de escravizados pela Ferrovia Subterrânea',
  },
  {
    id: 56, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Vlad III',
    aliases: ['vlad', 'empalador', 'drácula', 'dracula'],
    options: ['Vlad III', 'Ivan o Terrível', 'Henrique VIII', 'Ricardo III'],
    hint: 'Príncipe da Valáquia que inspirou o mito do Drácula',
  },
  {
    id: 57, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Nicolau Copérnico',
    aliases: ['copérnico', 'copernico', 'nicolau', 'copernicus'],
    options: ['Nicolau Copérnico', 'Galileu Galilei', 'Tycho Brahe', 'Johannes Kepler'],
    hint: 'Astrônomo que propôs que a Terra gira ao redor do Sol',
  },
  {
    id: 58, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Johannes Gutenberg',
    aliases: ['gutenberg', 'johannes'],
    options: ['Johannes Gutenberg', 'Johann Sebastian Bach', 'Martin Lutero', 'Erasmo de Roterdã'],
    hint: 'Inventor da prensa de tipos móveis no século XV',
  },
  {
    id: 59, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Alexandre o Grande',
    aliases: ['alexandre', 'alexander', 'magno'],
    options: ['Alexandre o Grande', 'Júlio César', 'Napoleão Bonaparte', 'Genghis Khan'],
    hint: 'Rei macedônio que criou um dos maiores impérios da Antiguidade',
  },
  {
    id: 60, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Átila',
    aliases: ['átila', 'atila', 'huno'],
    options: ['Átila', 'Genghis Khan', 'Tamerlão', 'Alarico'],
    hint: 'Rei dos Hunos, temido como "o Flagelo de Deus"',
  },

  // ── NÍVEL 7 ──────────────────────────────────────────────────────────────
  {
    id: 61, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Saladino',
    aliases: ['saladino', 'saladin'],
    options: ['Saladino', 'Ricardo Coração de Leão', 'Suleimão o Magnífico', 'Tamerlão'],
    hint: 'Sultão curdo que reconquistou Jerusalém dos Cruzados',
  },
  {
    id: 62, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Espartaco',
    aliases: ['espartaco', 'spartacus'],
    options: ['Espartaco', 'Júlio César', 'Aníbal', 'Vercingetórix'],
    hint: 'Gladiador trácio que liderou uma grande revolta de escravos em Roma',
  },
  {
    id: 63, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Nostradamus',
    aliases: ['nostradamus', 'michel de nostredame'],
    options: ['Nostradamus', 'Rasputin', 'Merlim', 'Leonardo da Vinci'],
    hint: 'Médico e astrólogo francês do século XVI, famoso por suas profecias',
  },
  {
    id: 64, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Mansa Musa',
    aliases: ['mansa', 'musa'],
    options: ['Mansa Musa', 'Sundiata Keita', 'Shaka Zulu', 'Haile Selassie'],
    hint: 'Imperador do Mali, considerado o homem mais rico da história',
  },
  {
    id: 65, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Tamerlão',
    aliases: ['tamerlão', 'tamerlan', 'timur'],
    options: ['Tamerlão', 'Genghis Khan', 'Átila', 'Saladino'],
    hint: 'Conquistador turco-mongol do século XIV, fundou o Império Timúrida',
  },
  {
    id: 66, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Hildegarda de Bingen',
    aliases: ['hildegarda', 'hildegard', 'bingen'],
    options: ['Hildegarda de Bingen', 'Joana d\'Arc', 'Catarina de Siena', 'Teresa de Ávila'],
    hint: 'Abadessa alemã do século XII, mística, compositora e cientista',
  },
  {
    id: 67, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Hipatia de Alexandria',
    aliases: ['hipatia', 'hypatia'],
    options: ['Hipatia de Alexandria', 'Aspásia', 'Marie Curie', 'Ada Lovelace'],
    hint: 'Matemática e filósofa grega do século IV d.C.',
  },
  {
    id: 68, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Ibn Battuta',
    aliases: ['ibn', 'battuta'],
    options: ['Ibn Battuta', 'Marco Polo', 'Zheng He', 'Vasco da Gama'],
    hint: 'Explorador marroquino do século XIV, viajou mais que qualquer pessoa de sua época',
  },
  {
    id: 69, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Suleimão o Magnífico',
    aliases: ['suleimão', 'suleiman', 'solimão'],
    options: ['Suleimão o Magnífico', 'Saladino', 'Mehmed II', 'Harun al-Rashid'],
    hint: 'Sultão otomano no auge do Império no século XVI',
  },
  {
    id: 70, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Zheng He',
    aliases: ['zheng', 'zheng he', 'cheng ho'],
    options: ['Zheng He', 'Kublai Khan', 'Marco Polo', 'Ibn Battuta'],
    hint: 'Almirante chinês que liderou grandes expedições marítimas no século XV',
  },

  // ── NÍVEL 8 ──────────────────────────────────────────────────────────────
  {
    id: 71, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Hatshepsut',
    aliases: ['hatshepsut', 'hatchepsut'],
    options: ['Hatshepsut', 'Cleópatra', 'Nefertiti', 'Zenobia'],
    hint: 'Faraó feminina do Antigo Egito, uma das mais poderosas da história',
  },
  {
    id: 72, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Ashoka',
    aliases: ['ashoka', 'asoka'],
    options: ['Ashoka', 'Chandragupta', 'Akbar', 'Aurangzeb'],
    hint: 'Imperador indiano que adotou o budismo após uma guerra devastadora',
  },
  {
    id: 73, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Zenobia',
    aliases: ['zenobia', 'zenóbia'],
    options: ['Zenobia', 'Cleópatra', 'Boudiceia', 'Tamara da Geórgia'],
    hint: 'Rainha de Palmira que desafiou o Império Romano no século III',
  },
  {
    id: 74, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Pachacuti',
    aliases: ['pachacuti', 'pachacutec'],
    options: ['Pachacuti', 'Atahualpa', 'Moctezuma', 'Huayna Capac'],
    hint: 'Imperador inca que construiu Machu Picchu',
  },
  {
    id: 75, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Vercingetórix',
    aliases: ['vercingetórix', 'vercingetorix'],
    options: ['Vercingetórix', 'Espartaco', 'Átila', 'Armínio'],
    hint: 'Chefe gaulês que liderou a resistência contra Júlio César',
  },
  {
    id: 76, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Ramanujan',
    aliases: ['ramanujan', 'srinivasa'],
    options: ['Ramanujan', 'Brahmagupta', 'Aryabhata', 'Al-Khwarizmi'],
    hint: 'Matemático indiano autodidata do início do século XX',
  },
  {
    id: 77, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Thomas Edison',
    aliases: ['thomas', 'edison'],
    options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Guglielmo Marconi'],
    hint: 'Inventor americano da lâmpada elétrica e do fonógrafo',
  },
  {
    id: 78, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Nicolau Maquiavel',
    aliases: ['maquiavel', 'machiavelli', 'nicolau'],
    options: ['Nicolau Maquiavel', 'Thomas Hobbes', 'John Locke', 'Erasmo de Roterdã'],
    hint: 'Filósofo florentino do século XV, autor de O Príncipe',
  },
  {
    id: 79, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Francisco de Assis',
    aliases: ['francisco', 'assis', 'são francisco'],
    options: ['Francisco de Assis', 'Tomás de Aquino', 'Agostinho de Hipona', 'Bernardo de Claraval'],
    hint: 'Santo padroeiro dos animais e da ecologia, fundador dos Franciscanos',
  },
  {
    id: 80, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Averróis',
    aliases: ['averróis', 'averrois', 'ibn rushd'],
    options: ['Averróis', 'Avicena', 'Al-Farabi', 'Al-Ghazali'],
    hint: 'Filósofo e médico árabe do século XII, grande comentador de Aristóteles',
  },

  // ── NÍVEL 9 ──────────────────────────────────────────────────────────────
  {
    id: 81, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Imhotep',
    aliases: ['imhotep'],
    options: ['Imhotep', 'Ramsés II', 'Tutancâmon', 'Amenhotep III'],
    hint: 'Arquiteto e médico do Egito Antigo, projetou a Pirâmide de Djoser',
  },
  {
    id: 82, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Amenhotep IV',
    aliases: ['amenhotep', 'akhenaton', 'akhenaten'],
    options: ['Amenhotep IV', 'Ramsés II', 'Tutancâmon', 'Hatshepsut'],
    hint: 'Faraó egípcio que tentou impor o monoteísmo no Egito Antigo',
  },
  {
    id: 83, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Al-Khwarizmi',
    aliases: ['al-khwarizmi', 'khwarizmi', 'algoritmi'],
    options: ['Al-Khwarizmi', 'Averróis', 'Avicena', 'Al-Biruni'],
    hint: 'Matemático persa do século IX, pai da álgebra',
  },
  {
    id: 84, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Sundiata Keita',
    aliases: ['sundiata', 'keita'],
    options: ['Sundiata Keita', 'Mansa Musa', 'Shaka Zulu', 'Askia Mohammed'],
    hint: 'Fundador do Império do Mali no século XIII',
  },
  {
    id: 85, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Njinga de Matamba',
    aliases: ['njinga', 'nzinga', 'matamba'],
    options: ['Njinga de Matamba', 'Zenobia', 'Hatshepsut', 'Amina de Zazzau'],
    hint: 'Rainha angolana do século XVII que resistiu à colonização portuguesa',
  },
  {
    id: 86, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Nur Jahan',
    aliases: ['nur', 'jahan', 'nur jahan'],
    options: ['Nur Jahan', 'Mumtaz Mahal', 'Razia Sultana', 'Mirabai'],
    hint: 'Imperatriz mogol do século XVII, a mulher mais poderosa da Índia medieval',
  },
  {
    id: 87, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Yoritomo Minamoto',
    aliases: ['yoritomo', 'minamoto'],
    options: ['Yoritomo Minamoto', 'Oda Nobunaga', 'Toyotomi Hideyoshi', 'Tokugawa Ieyasu'],
    hint: 'Fundador do primeiro xogunato do Japão no século XII',
  },
  {
    id: 88, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Pacal o Grande',
    aliases: ['pacal', 'pakal'],
    options: ['Pacal o Grande', 'Pachacuti', 'Moctezuma', 'Quetzalcoatl'],
    hint: 'Rei maia de Palenque no século VII, seu sarcófago é famoso mundialmente',
  },
  {
    id: 89, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Skanderbeg',
    aliases: ['skanderbeg', 'skenderbeu'],
    options: ['Skanderbeg', 'Vlad III', 'Stefan o Grande', 'Hunyadi'],
    hint: 'Herói nacional albanês que resistiu ao Império Otomano no século XV',
  },
  {
    id: 90, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Enheduanna',
    aliases: ['enheduanna', 'en-hedu-ana'],
    options: ['Enheduanna', 'Nefertiti', 'Hatshepsut', 'Semiramis'],
    hint: 'Sacerdotisa suméria do século XXIII a.C., primeira autora conhecida da história',
  },

  // ── NÍVEL 10 ─────────────────────────────────────────────────────────────
  {
    id: 91, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Sargão de Acade',
    aliases: ['sargão', 'sargao', 'sargon', 'acade'],
    options: ['Sargão de Acade', 'Hamurabi', 'Nabucodonosor', 'Ciro o Grande'],
    hint: 'Fundador do primeiro império da história, na Mesopotâmia',
  },
  {
    id: 92, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Zhang Heng',
    aliases: ['zhang', 'heng', 'zhang heng'],
    options: ['Zhang Heng', 'Confúcio', 'Sun Tzu', 'Zhuge Liang'],
    hint: 'Polímata chinês do século II que inventou o primeiro sismógrafo da história',
  },
  {
    id: 93, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Al-Biruni',
    aliases: ['al-biruni', 'biruni'],
    options: ['Al-Biruni', 'Al-Khwarizmi', 'Avicena', 'Ibn Battuta'],
    hint: 'Cientista persa do século XI, pioneiro na antropologia e na geodésia',
  },
  {
    id: 94, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Ibn Khaldun',
    aliases: ['ibn khaldun', 'khaldun'],
    options: ['Ibn Khaldun', 'Ibn Battuta', 'Averróis', 'Al-Farabi'],
    hint: 'Historiador e filósofo árabe do século XIV, pai da sociologia',
  },
  {
    id: 95, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Prithviraj Chauhan',
    aliases: ['prithviraj', 'chauhan'],
    options: ['Prithviraj Chauhan', 'Ashoka', 'Chandragupta', 'Akbar'],
    hint: 'Último grande rei hindu de Delhi, derrotado por Muhammad de Ghor em 1192',
  },
  {
    id: 96, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Xuanzang',
    aliases: ['xuanzang', 'hsuan-tsang', 'tripitaka'],
    options: ['Xuanzang', 'Zheng He', 'Confúcio', 'Bodhidharma'],
    hint: 'Monge budista chinês do século VII que viajou à Índia em busca de escrituras sagradas',
  },
  {
    id: 97, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Al-Idrisi',
    aliases: ['al-idrisi', 'idrisi'],
    options: ['Al-Idrisi', 'Ibn Battuta', 'Al-Biruni', 'Al-Khwarizmi'],
    hint: 'Geógrafo árabe do século XII que produziu o mapa-múndi mais preciso da Idade Média',
  },
  {
    id: 98, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Nagarjuna',
    aliases: ['nagarjuna'],
    options: ['Nagarjuna', 'Ashoka', 'Bodhidharma', 'Xuanzang'],
    hint: 'Filósofo budista indiano do século II, fundador da escola Madhyamaka',
  },
  {
    id: 99, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Boécio',
    aliases: ['boécio', 'boecio', 'boethius'],
    options: ['Boécio', 'Agostinho de Hipona', 'Tomás de Aquino', 'Anselmo de Cantuária'],
    hint: 'Filósofo romano do século VI, escreveu A Consolação da Filosofia na prisão',
  },
  {
    id: 100, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Snorri Sturluson',
    aliases: ['snorri', 'sturluson'],
    options: ['Snorri Sturluson', 'Erik o Vermelho', 'Leif Erikson', 'Ragnar Lothbrok'],
    hint: 'Escritor islandês do século XIII que registrou a mitologia nórdica na Edda',
  },
];

// ─── Mapeamento de nível → dificuldade ───────────────────────────────────────
const LEVEL_DIFFICULTY: Record<number, Difficulty[]> = {
  1: ['easy'],
  2: ['easy'],
  3: ['easy'],
  4: ['medium'],
  5: ['medium'],
  6: ['hard'],
  7: ['hard'],
  8: ['hard'],
  9: ['extreme'],
  10: ['extreme'],
};

const LEVEL_TIMER: Record<number, number> = {
  1: 30, 2: 28, 3: 25,
  4: 22, 5: 20,
  6: 18, 7: 16, 8: 14,
  9: 12, 10: 10,
};

// ─── Embaralha um array sem modificar o original ─────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Perguntas fixas por nível, sem repetição ────────────────────────────────
function getQuestionsForLevel(levelNum: number): Question[] {
  return ALL_QUESTIONS
    .filter((q) => q.level === levelNum)
    .sort(() => Math.random() - 0.5)
    .map((q) => ({ ...q, options: shuffle(q.options) })); // embaralha as opções de cada pergunta
}

const LETTERS = ['A', 'B', 'C', 'D'];
type Phase = 'playing' | 'feedback' | 'result';
interface RoundResult { correct: boolean; skipped?: boolean; }

export default function GameScreen() {
  const router = useRouter();
  const { mode, level } = useLocalSearchParams<{ mode: string; level: string }>();
  const { saveResult } = useGameStore();

  const isFree = mode === 'free';
  const levelNum = parseInt(level ?? '1', 10);
  const TIMER_SECS = LEVEL_TIMER[levelNum] ?? 24;

  const [questions] = useState(() => getQuestionsForLevel(levelNum));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selected, setSelected] = useState<string | null>(null);
  const [optsVisible, setOptsVisible] = useState(true);
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [timedOut, setTimedOut] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [earnedStars, setEarnedStars] = useState(0);
  const [attempts, setAttempts] = useState(0); // 0 = primeira vez, 1 = segunda tentativa
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[index];
  const totalQ = questions.length;
  const progress = (index + 1) / totalQ;
  const timerRed = timeLeft <= Math.floor(TIMER_SECS * 0.33);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  useEffect(() => {
    if (phase !== 'playing') return;
    setTimeLeft(TIMER_SECS);
    setTimedOut(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [index, phase]);

  function handleTimeout() { setTimedOut(true); setPhase('feedback'); }

  function checkFreeAnswer(val: string): boolean {
    const lower = val.toLowerCase().trim();
    return question.aliases.some((a) => lower.includes(a));
  }

  function pickOption(opt: string) {
    if (phase !== 'playing') return;
    stopTimer();
    setSelected(opt);
    setResults((r) => [...r, { correct: opt === question.answer }]);
    setPhase('feedback');
  }

  function confirmFree() {
    if (!textAnswer.trim()) return;
    Keyboard.dismiss();

    const correct = checkFreeAnswer(textAnswer);

    if (!correct && attempts === 0) {
      // Primeira tentativa errada → dá outra chance
      setAttempts(1);
      setTextAnswer('');
      return;
    }

    // Segunda tentativa ou acerto → segue o fluxo normal
    stopTimer();
    setResults((r) => [...r, { correct }]);
    setPhase('feedback');
  }

  function skipQuestion() {
    stopTimer();
    setResults((r) => [...r, { correct: false, skipped: true }]);
    const nextIndex = index + 1;
    if (nextIndex >= totalQ) finishGame([...results, { correct: false, skipped: true }]);
    else advance(nextIndex);
  }

  function advance(nextIndex: number) {
    setIndex(nextIndex);
    setSelected(null);
    setOptsVisible(true);
    setTextAnswer('');
    setAttempts(0); // ← adicione esta linha
    setPhase('playing');
  }

  async function finishGame(finalResults: RoundResult[]) {
    const correctCount = finalResults.filter((r) => r.correct).length;
    const stars = await saveResult(correctCount, totalQ, mode ?? 'multiple', level ?? '1');
    setEarnedStars(stars);
    setPhase('result');
  }

  function next() {
    const nextIndex = index + 1;
    if (nextIndex >= totalQ) finishGame([...results]);
    else advance(nextIndex);
  }

  const isCorrect = isFree
    ? phase === 'feedback' && !timedOut && checkFreeAnswer(textAnswer)
    : phase === 'feedback' && !timedOut && selected === question.answer;

  const correctCount = results.filter((r) => r.correct).length;

  // ── TELA DE RESULTADO ──────────────────────────────────────────────────────
  // ── TELA DE RESULTADO ──────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((correctCount / totalQ) * 100);
    const msg = pct >= 90 ? 'Incrível! 🏆' : pct >= 60 ? 'Bom trabalho! 👍' : 'Continue tentando! 💪';
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 40 }]}>
          <Text style={styles.starsLarge}>
            {[1, 2, 3].map((i) => (i <= earnedStars ? '★' : '☆')).join(' ')}
          </Text>
          <Text style={styles.resultTitle}>{msg}</Text>
          <Text style={styles.resultSub}>Nível {level} · {mode === 'free' ? 'Sem opções' : 'Com opções'}</Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{correctCount}/{totalQ}</Text>
              <Text style={styles.scoreLabel}>Acertos</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{pct}%</Text>
              <Text style={styles.scoreLabel}>Precisão</Text>
            </View>
          </View>

          <View style={styles.summaryList}>
            {results.map((r, i) => (
              <View key={i} style={styles.summaryRow}>
                <View style={[styles.summaryDot, r.correct ? styles.dotGreen : styles.dotRed]} />
                <Text style={styles.summaryQ} numberOfLines={1}>{questions[i]?.answer}</Text>
                <Text style={[styles.summaryStatus, { color: r.correct ? Colors.successText : Colors.errorText }]}>
                  {r.skipped ? 'Pulou' : r.correct ? 'Correto' : 'Errou'}
                </Text>
              </View>
            ))}
          </View>

          {/* ✏️ Jogar novamente — recria a tela sem empilhar */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => router.replace(`/game?mode=${mode}&level=${level}`)}
          >
            <Ionicons name="refresh" size={18} color={Colors.primaryLight} />
            <Text style={styles.confirmText}>Jogar novamente</Text>
          </TouchableOpacity>

          {/* ✏️ Outros níveis — volta para levels limpando o histórico */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: Colors.dark, marginTop: 10 }]}
            onPress={() => router.replace(`/levels?mode=${mode}`)}
          >
            <Ionicons name="list-outline" size={18} color={Colors.primaryLight} />
            <Text style={styles.confirmText}>Outros níveis</Text>
          </TouchableOpacity>

          {/* ✏️ Botão novo: volta direto ao menu principal */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: Colors.backgroundSecondary, marginTop: 10 }]}
            onPress={() => router.replace('/')}
          >
            <Ionicons name="home-outline" size={18} color={Colors.textPrimary} />
            <Text style={[styles.confirmText, { color: Colors.textPrimary }]}>Menu principal</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── TELA DE JOGO ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.timerPill, timerRed && styles.timerPillRed]}>
          <Ionicons name="time-outline" size={14} color={timerRed ? Colors.errorText : Colors.textSecondary} />
          <Text style={[styles.timerText, timerRed && styles.timerTextRed]}>
            {String(timeLeft).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.qCount}>{index + 1}/{totalQ}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Placeholder da imagem — substitua por <Image> quando tiver os arquivos */}
        <View style={styles.photoBox}>
          {question.image ? (
            <Image
              source={question.image}
              style={styles.photoImage}
              resizeMode="contain"   // ← era "cover", trocado para "contain"
            />
          ) : (
            <>
              <Ionicons name="person-circle-outline" size={72} color="rgba(255,255,255,0.15)" />
              <Text style={styles.photoHint}>{question.hint}</Text>
            </>
          )}
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        {/* MODO COM OPÇÕES */}
        {!isFree && (
          <>
            {optsVisible && (
              <View style={styles.options}>
                {question.options.map((opt, i) => {
                  let optStyle = {};
                  let letterStyle = {};
                  if (phase === 'feedback') {
                    if (opt === question.answer) { optStyle = styles.optCorrect; letterStyle = styles.letterCorrect; }
                    else if (opt === selected) { optStyle = styles.optWrong; letterStyle = styles.letterWrong; }
                  }
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.option, optStyle]}
                      activeOpacity={phase !== 'playing' ? 1 : 0.7}
                      onPress={() => pickOption(opt)}
                    >
                      <View style={[styles.optLetter, letterStyle]}>
                        <Text style={styles.optLetterText}>{LETTERS[i]}</Text>
                      </View>
                      <Text style={styles.optName}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {phase === 'playing' && (
              <TouchableOpacity style={styles.iKnowBtn} onPress={() => setOptsVisible((v) => !v)}>
                <Ionicons name={optsVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.primaryLight} />
                <Text style={styles.iKnowText}>
                  {optsVisible ? 'Esconder as opções' : 'Eu sei! Mostrar opções'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* MODO LIVRE */}
        {isFree && phase === 'playing' && (
          <>
            {attempts === 1 && (
              <View style={styles.retryBanner}>
                <Ionicons name="refresh-circle-outline" size={16} color="#854F0B" />
                <Text style={styles.retryText}>Tente mais uma vez!</Text>
              </View>
            )}
            <TextInput
              style={styles.textInput}
              placeholder="Digite o nome..."
              placeholderTextColor={Colors.textSecondary}
              value={textAnswer}
              onChangeText={setTextAnswer}
              returnKeyType="done"
              onSubmitEditing={confirmFree}
              autoCorrect={false}
            />
            <Text style={styles.hint}>Não precisa ser exato — reconhecemos variações</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmFree}>
              <Ionicons name="checkmark" size={18} color={Colors.primaryLight} />
              <Text style={styles.confirmText}>Confirmar resposta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={skipQuestion}>
              <Text style={styles.skipText}>Pular esta pergunta</Text>
            </TouchableOpacity>
          </>
        )}

        {/* FEEDBACK */}
        {phase === 'feedback' && (
          <View style={[styles.feedback, (isCorrect && !timedOut) ? styles.feedbackOk : styles.feedbackErr]}>
            <View style={styles.fbHead}>
              <Ionicons
                name={isCorrect && !timedOut ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={isCorrect && !timedOut ? Colors.successText : Colors.errorText}
              />
              <Text style={[styles.fbTitle, { color: isCorrect && !timedOut ? Colors.successText : Colors.errorText }]}>
                {timedOut ? 'Tempo esgotado!' : isCorrect ? 'Correto!' : 'Errou!'}
              </Text>
            </View>
            <Text style={[styles.fbBody, { color: isCorrect && !timedOut ? '#27500A' : '#791F1F' }]}>
              Era <Text style={{ fontWeight: '600' }}>{question.answer}</Text>
            </Text>
            <TouchableOpacity
              style={[styles.fbBtn, { backgroundColor: isCorrect && !timedOut ? Colors.successText : Colors.errorText }]}
              onPress={next}
            >
              <Text style={styles.fbBtnText}>
                {index + 1 >= totalQ ? 'Ver resultado' : 'Próxima pergunta'}
              </Text>
              <Ionicons name={index + 1 >= totalQ ? 'trophy-outline' : 'arrow-forward'} size={13} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundSecondary, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  timerPillRed: { backgroundColor: Colors.error, borderColor: '#F7C1C1' },
  timerText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  timerTextRed: { color: Colors.errorText },
  progressWrap: { flex: 1, height: 5, backgroundColor: Colors.backgroundSecondary, borderRadius: 99, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },
  qCount: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  photoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',   // ← garante que a imagem respeite o borderRadius
  },
  photoHint: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingHorizontal: 20 },

  questionText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, marginBottom: 10 },
  options: { gap: 7 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 12, padding: 11 },
  optCorrect: { backgroundColor: Colors.success, borderColor: '#C0DD97' },
  optWrong: { backgroundColor: Colors.error, borderColor: '#F7C1C1' },
  optLetter: { width: 26, height: 26, borderRadius: 8, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  letterCorrect: { backgroundColor: '#639922' },
  letterWrong: { backgroundColor: '#E24B4A' },
  optLetterText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  optName: { fontSize: 14, color: Colors.textPrimary },
  iKnowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.dark, borderRadius: 12, padding: 13, marginTop: 10 },
  iKnowText: { fontSize: 14, fontWeight: '500', color: Colors.primaryLight },
  textInput: { fontSize: 15, padding: 12, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.background, color: Colors.textPrimary },
  hint: { fontSize: 11, color: Colors.textSecondary, marginTop: 5 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, padding: 13, marginTop: 8 },
  confirmText: { fontSize: 15, fontWeight: '500', color: Colors.primaryLight },
  skipText: { textAlign: 'center', padding: 10, fontSize: 12, color: Colors.textSecondary },
  feedback: { marginTop: 10, padding: 14, borderRadius: 16 },
  feedbackOk: { backgroundColor: Colors.success, borderWidth: 0.5, borderColor: '#C0DD97' },
  feedbackErr: { backgroundColor: Colors.error, borderWidth: 0.5, borderColor: '#F7C1C1' },
  fbHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fbTitle: { fontSize: 15, fontWeight: '500' },
  fbBody: { fontSize: 13 },
  fbBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, padding: 10, marginTop: 10 },
  fbBtnText: { fontSize: 13, fontWeight: '500', color: '#fff' },
  starsLarge: { fontSize: 48, color: Colors.primary, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  resultSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 28 },
  scoreRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  scoreCard: { flex: 1, backgroundColor: Colors.backgroundSecondary, borderRadius: 14, padding: 16, alignItems: 'center' },
  scoreValue: { fontSize: 26, fontWeight: '600', color: Colors.textPrimary },
  scoreLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  summaryList: { width: '100%', gap: 8, marginBottom: 28, backgroundColor: Colors.backgroundSecondary, borderRadius: 14, padding: 14 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  dotGreen: { backgroundColor: Colors.successText },
  dotRed: { backgroundColor: Colors.errorText },
  summaryQ: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  summaryStatus: { fontSize: 12, fontWeight: '500' },
  retryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAEEDA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#854F0B',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});