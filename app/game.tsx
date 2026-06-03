import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing,
  Image,
  Keyboard, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
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
    image: require('@/assets/images/people/nivel1/pele.webp'),
    aliases: ['pelé', 'pele', 'edson', 'arantes'],
    options: ['Pelé', 'Zico', 'Ronaldo', 'Romário'],
    hint: 'Considerado o maior jogador de futebol de todos os tempos',
  },
  {
    id: 2, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Ayrton Senna',
    image: require('@/assets/images/people/nivel1/ayrton.webp'),
    aliases: ['ayrton', 'senna'],
    options: ['Ayrton Senna', 'Alain Prost', 'Michael Schumacher', 'Nelson Piquet'],
    hint: 'Tricampeão mundial de Fórmula 1, ídolo brasileiro',
  },
  {
    id: 3, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Jackson',
    image: require('@/assets/images/people/nivel1/michael.webp'),
    aliases: ['michael', 'jackson'],
    options: ['Michael Jackson', 'Prince', 'David Bowie', 'Elvis Presley'],
    hint: 'Rei do Pop',
  },
  {
    id: 4, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Cristiano Ronaldo',
    image: require('@/assets/images/people/nivel1/cr7.webp'),
    aliases: ['cristiano', 'ronaldo', 'cr7'],
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Neymar', 'Mbappé'],
    hint: 'Conhecido como CR7, um dos maiores goleadores da história',
  },
  {
    id: 5, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Lionel Messi',
    image: require('@/assets/images/people/nivel1/messi.webp'),
    aliases: ['lionel', 'messi', 'leo messi'],
    options: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar', 'Ronaldinho'],
    hint: 'Campeão mundial com a Argentina em 2022, La Pulga',
  },
  {
    id: 6, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Elvis Presley',
    image: require('@/assets/images/people/nivel1/elvis.webp'),
    aliases: ['elvis', 'presley'],
    options: ['Elvis Presley', 'Chuck Berry', 'Jerry Lee Lewis', 'Buddy Holly'],
    hint: 'Rei do Rock and Roll',
  },
  {
    id: 7, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Albert Einstein',
    image: require('@/assets/images/people/nivel1/albert.webp'),
    aliases: ['albert', 'einstein'],
    options: ['Albert Einstein', 'Isaac Newton', 'Nikola Tesla', 'Charles Darwin'],
    hint: 'Físico criador da teoria da relatividade',
  },
  {
    id: 8, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Neymar',
    image: require('@/assets/images/people/nivel1/neymar.webp'),
    aliases: ['neymar', 'ney'],
    options: ['Neymar', 'Pelé', 'Ronaldinho', 'Kaká'],
    hint: 'Atacante brasileiro, ex-Barcelona e PSG',
  },
  {
    id: 9, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Muhammad Ali',
    image: require('@/assets/images/people/nivel1/muhammadali.webp'),
    aliases: ['muhammad', 'ali', 'cassius clay'],
    options: ['Muhammad Ali', 'Mike Tyson', 'Joe Frazier', 'George Foreman'],
    hint: 'O maior boxeador de todos os tempos, "The Greatest"',
  },
  {
    id: 10, level: 1, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Usain Bolt',
    image: require('@/assets/images/people/nivel1/usainbolt.webp'),
    aliases: ['usain', 'bolt'],
    options: ['Usain Bolt', 'Carl Lewis', 'Maurice Greene', 'Asafa Powell'],
    hint: 'Jamaicano, homem mais rápido da história',
  },

  // ── NÍVEL 2 ──────────────────────────────────────────────────────────────
  {
    id: 11, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Elon Musk',
    image: require('@/assets/images/people/nivel2/musk.webp'),
    aliases: ['elon', 'musk'],
    options: ['Elon Musk', 'Bill Gates', 'Jeff Bezos', 'Mark Zuckerberg'],
    hint: 'Fundador da Tesla e SpaceX, um dos homens mais ricos do mundo',
  },
  {
    id: 12, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Bill Gates',
    image: require('@/assets/images/people/nivel2/billgates.webp'),
    aliases: ['bill', 'gates'],
    options: ['Bill Gates', 'Steve Jobs', 'Elon Musk', 'Jeff Bezos'],
    hint: 'Cofundador da Microsoft',
  },
  {
    id: 13, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Jordan',
    image: require('@/assets/images/people/nivel2/jordan.webp'),
    aliases: ['michael', 'jordan', 'mj'],
    options: ['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Magic Johnson'],
    hint: 'Considerado o maior jogador de basquete de todos os tempos, Air Jordan',
  },
  {
    id: 14, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'LeBron James',
    image: require('@/assets/images/people/nivel2/lebron.webp'),
    aliases: ['lebron', 'james', 'king james'],
    options: ['LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Shaquille O\'Neal'],
    hint: 'King James, um dos maiores da NBA',
  },
  {
    id: 15, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Napoleão Bonaparte',
    image: require('@/assets/images/people/nivel2/napoleao.webp'),
    aliases: ['napoleão', 'napoleao', 'bonaparte'],
    options: ['Napoleão Bonaparte', 'Júlio César', 'Alexandre o Grande', 'Genghis Khan'],
    hint: 'Imperador francês que conquistou boa parte da Europa',
  },
  {
    id: 16, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Adolf Hitler',
    image: require('@/assets/images/people/nivel2/hitler.webp'),
    aliases: ['adolf', 'hitler'],
    options: ['Adolf Hitler', 'Joseph Stalin', 'Benito Mussolini', 'Francisco Franco'],
    hint: 'Ditador alemão responsável pela Segunda Guerra Mundial e pelo Holocausto',
  },
  {
    id: 17, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Bob Marley',
    image: require('@/assets/images/people/nivel2/bobmarley.webp'),
    aliases: ['bob', 'marley'],
    options: ['Bob Marley', 'Jimmy Cliff', 'Peter Tosh', 'Burning Spear'],
    hint: 'Ícone do reggae jamaicano',
  },
  {
    id: 18, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Marilyn Monroe',
    image: require('@/assets/images/people/nivel2/marilynmonroe.webp'),
    aliases: ['marilyn', 'monroe'],
    options: ['Marilyn Monroe', 'Audrey Hepburn', 'Grace Kelly', 'Elizabeth Taylor'],
    hint: 'Ícone pop e sex symbol dos anos 50 e 60',
  },
  {
    id: 19, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Freddie Mercury',
    image: require('@/assets/images/people/nivel2/freddiemercury.webp'),
    aliases: ['freddie', 'mercury'],
    options: ['Freddie Mercury', 'David Bowie', 'Mick Jagger', 'Robert Plant'],
    hint: 'Vocalista do Queen, um dos maiores frontmen da história do rock',
  },
  {
    id: 20, level: 2, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'John Lennon',
    image: require('@/assets/images/people/nivel2/johnlennon.webp'),
    aliases: ['john', 'lennon'],
    options: ['John Lennon', 'Paul McCartney', 'George Harrison', 'Ringo Starr'],
    hint: 'Cofundador dos Beatles, autor de Imagine',
  },

  // ── NÍVEL 3 ──────────────────────────────────────────────────────────────
  {
    id: 21, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Donald Trump',
    image: require('@/assets/images/people/nivel3/donaldtrump.webp'),
    aliases: ['donald', 'trump'],
    options: ['Donald Trump', 'Barack Obama', 'Joe Biden', 'George Bush'],
    hint: '45º e 47º presidente dos Estados Unidos',
  },
  {
    id: 22, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Barack Obama',
    image: require('@/assets/images/people/nivel3/obama.webp'),
    aliases: ['barack', 'obama'],
    options: ['Barack Obama', 'Donald Trump', 'Bill Clinton', 'Joe Biden'],
    hint: 'Primeiro presidente negro dos Estados Unidos',
  },
  {
    id: 23, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Leonardo da Vinci',
    image: require('@/assets/images/people/nivel3/davinci.webp'),
    aliases: ['leonardo', 'da vinci', 'davinci'],
    options: ['Leonardo da Vinci', 'Michelangelo', 'Rafael', 'Donatello'],
    hint: 'Pintou a Mona Lisa e era também inventor',
  },
  {
    id: 24, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Marie Curie',
    image: require('@/assets/images/people/nivel3/marie.webp'),
    aliases: ['marie', 'curie'],
    options: ['Marie Curie', 'Florence Nightingale', 'Ada Lovelace', 'Rosalind Franklin'],
    hint: 'Única pessoa a ganhar Nobel em duas ciências diferentes',
  },
  {
    id: 25, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Mahatma Gandhi',
    image: require('@/assets/images/people/nivel3/gandhi.webp'),
    aliases: ['mahatma', 'gandhi'],
    options: ['Mahatma Gandhi', 'Nelson Mandela', 'Martin Luther King', 'Dalai Lama'],
    hint: 'Liderou a independência da Índia pela não-violência',
  },
  {
    id: 26, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Nelson Mandela',
    image: require('@/assets/images/people/nivel3/mandela.webp'),
    aliases: ['nelson', 'mandela'],
    options: ['Nelson Mandela', 'Mahatma Gandhi', 'Desmond Tutu', 'Steve Biko'],
    hint: 'Primeiro presidente negro da África do Sul',
  },
  {
    id: 27, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Walt Disney',
    image: require('@/assets/images/people/nivel3/disney.webp'),
    aliases: ['walt', 'disney'],
    options: ['Walt Disney', 'Steven Spielberg', 'Charlie Chaplin', 'George Lucas'],
    hint: 'Criador do Mickey Mouse e fundador da Disney',
  },
  {
    id: 28, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Charles Chaplin',
    image: require('@/assets/images/people/nivel3/chaplin.webp'),
    aliases: ['charles', 'chaplin', 'charlie chaplin'],
    options: ['Charles Chaplin', 'Buster Keaton', 'Harold Lloyd', 'Stan Laurel'],
    hint: 'Ator e diretor, ícone do cinema mudo com o personagem Carlitos',
  },
  {
    id: 29, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Stephen Hawking',
    image: require('@/assets/images/people/nivel3/stephen.webp'),
    aliases: ['stephen', 'hawking'],
    options: ['Stephen Hawking', 'Carl Sagan', 'Richard Feynman', 'Neil deGrasse Tyson'],
    hint: 'Físico teórico britânico, estudou buracos negros e o universo',
  },
  {
    id: 30, level: 3, difficulty: 'easy',
    question: 'Quem é esta figura histórica?',
    answer: 'Mark Zuckerberg',
    image: require('@/assets/images/people/nivel3/markzuckerberg.webp'),
    aliases: ['mark', 'zuckerberg', 'zuck'],
    options: ['Mark Zuckerberg', 'Elon Musk', 'Bill Gates', 'Jeff Bezos'],
    hint: 'Fundador do Facebook e Meta',
  },

  // ── NÍVEL 4 ──────────────────────────────────────────────────────────────
  {
    id: 31, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Winston Churchill',
    image: require('@/assets/images/people/nivel4/churchill.webp'),
    aliases: ['winston', 'churchill'],
    options: ['Winston Churchill', 'Franklin Roosevelt', 'Charles de Gaulle', 'Harry Truman'],
    hint: 'Primeiro-ministro britânico que liderou o Reino Unido na Segunda Guerra',
  },
  {
    id: 32, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Karl Marx',
    image: require('@/assets/images/people/nivel4/karlmarx.webp'),
    aliases: ['karl', 'marx'],
    options: ['Karl Marx', 'Friedrich Engels', 'Vladimir Lenin', 'Leon Trotsky'],
    hint: 'Filósofo alemão, autor do Manifesto Comunista',
  },
  {
    id: 33, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Sigmund Freud',
    image: require('@/assets/images/people/nivel4/sigmundfreud.webp'),
    aliases: ['sigmund', 'freud'],
    options: ['Sigmund Freud', 'Carl Jung', 'Alfred Adler', 'William James'],
    hint: 'Fundador da psicanálise',
  },
  {
    id: 34, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Nikola Tesla',
    image: require('@/assets/images/people/nivel4/nikolatesla.webp'),
    aliases: ['nikola', 'tesla'],
    options: ['Nikola Tesla', 'Thomas Edison', 'Guglielmo Marconi', 'Heinrich Hertz'],
    hint: 'Inventor sérvio-americano pioneiro da corrente alternada',
  },
  {
    id: 35, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Isaac Newton',
    image: require('@/assets/images/people/nivel4/isaacnewton.webp'),
    aliases: ['isaac', 'newton'],
    options: ['Isaac Newton', 'Galileu Galilei', 'Albert Einstein', 'Johannes Kepler'],
    hint: 'Formulou as leis do movimento e da gravidade universal',
  },
  {
    id: 36, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Martin Luther King',
    image: require('@/assets/images/people/nivel4/martinlutherlking.webp'),
    aliases: ['martin', 'luther', 'king', 'mlk'],
    options: ['Martin Luther King', 'Malcolm X', 'Nelson Mandela', 'Mahatma Gandhi'],
    hint: 'Líder do movimento dos direitos civis nos EUA, "I Have a Dream"',
  },
  {
    id: 37, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Che Guevara',
    image: require('@/assets/images/people/nivel4/cheguevara.webp'),
    aliases: ['che', 'guevara'],
    options: ['Che Guevara', 'Fidel Castro', 'Simón Bolívar', 'Hugo Chávez'],
    hint: 'Revolucionário argentino, ícone da esquerda mundial',
  },
  {
    id: 38, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Mother Teresa',
    image: require('@/assets/images/people/nivel4/santateresa.webp'),
    aliases: ['mother teresa', 'madre teresa', 'teresa'],
    options: ['Mother Teresa', 'Florence Nightingale', 'Malala Yousafzai', 'Simone de Beauvoir'],
    hint: 'Freira albanesa, Nobel da Paz por seu trabalho com os pobres na Índia',
  },
  {
    id: 39, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Mozart',
    image: require('@/assets/images/people/nivel4/mozart.webp'),
    aliases: ['mozart', 'wolfgang', 'amadeus'],
    options: ['Mozart', 'Beethoven', 'Bach', 'Chopin'],
    hint: 'Compositor austríaco prodígio do século XVIII',
  },
  {
    id: 40, level: 4, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Beethoven',
    image: require('@/assets/images/people/nivel4/beethoven.webp'),
    aliases: ['beethoven', 'ludwig'],
    options: ['Beethoven', 'Mozart', 'Bach', 'Schubert'],
    hint: 'Compôs a 9ª Sinfonia mesmo após ficar surdo',
  },

  // ── NÍVEL 5 ──────────────────────────────────────────────────────────────
  // Adicione as imagens em: @/assets/images/people/nivel5/
  {
    id: 41, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Abraham Lincoln',
    image: require('@/assets/images/people/nivel5/lincoln.webp'),
    aliases: ['abraham', 'lincoln'],
    options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'Theodore Roosevelt'],
    hint: 'Presidente americano que aboliu a escravidão nos EUA',
  },
  {
    id: 42, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Cleópatra',
    image: require('@/assets/images/people/nivel5/cleopatra.webp'),
    aliases: ['cleópatra', 'cleopatra'],
    options: ['Cleópatra', 'Nefertiti', 'Hatshepsut', 'Zenobia'],
    hint: 'Última rainha do Egito faraônico',
  },
  {
    id: 43, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Galileu Galilei',
    image: require('@/assets/images/people/nivel5/galileu.webp'),
    aliases: ['galileu', 'galilei', 'galileo'],
    options: ['Galileu Galilei', 'Nicolau Copérnico', 'Isaac Newton', 'Johannes Kepler'],
    hint: 'Astrônomo que confirmou que a Terra gira ao redor do Sol',
  },
  {
    id: 44, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Frida Kahlo',
    image: require('@/assets/images/people/nivel5/fridakahlo.webp'),
    aliases: ['frida', 'kahlo'],
    options: ['Frida Kahlo', 'Georgia O\'Keeffe', 'Tamara de Lempicka', 'Berthe Morisot'],
    hint: 'Pintora mexicana famosa pelos autorretratos',
  },
  {
    id: 45, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Charles Darwin',
    image: require('@/assets/images/people/nivel5/darwin.webp'),
    aliases: ['charles', 'darwin'],
    options: ['Charles Darwin', 'Gregor Mendel', 'Louis Pasteur', 'Alexander Fleming'],
    hint: 'Propôs a teoria da evolução das espécies',
  },
  {
    id: 46, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Júlio César',
    image: require('@/assets/images/people/nivel5/juliocesar.webp'),
    aliases: ['júlio', 'julio', 'césar', 'cesar', 'julius caesar'],
    options: ['Júlio César', 'Marco Aurélio', 'Augusto César', 'Nero'],
    hint: 'General e ditador romano, "Vim, vi e venci"',
  },
  {
    id: 47, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Joana d\'Arc',
    image: require('@/assets/images/people/nivel5/joanadearc.webp'),
    aliases: ['joana', 'joana d\'arc', 'joan of arc'],
    options: ['Joana d\'Arc', 'Isabel I', 'Maria Antonieta', 'Cleópatra'],
    hint: 'Heroína francesa da Guerra dos Cem Anos, canonizada como santa',
  },
  {
    id: 48, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Genghis Khan',
    image: require('@/assets/images/people/nivel5/genghiskhan.webp'),
    aliases: ['genghis', 'khan', 'gengis'],
    options: ['Genghis Khan', 'Kublai Khan', 'Átila', 'Tamerlão'],
    hint: 'Fundador do maior império contínuo da história, o Império Mongol',
  },
  {
    id: 49, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Alan Turing',
    image: require('@/assets/images/people/nivel5/alanturing.webp'),
    aliases: ['alan', 'turing'],
    options: ['Alan Turing', 'Ada Lovelace', 'John von Neumann', 'Claude Shannon'],
    hint: 'Matemático britânico considerado o pai da computação moderna',
  },
  {
    id: 50, level: 5, difficulty: 'medium',
    question: 'Quem é esta figura histórica?',
    answer: 'Marco Aurélio',
    image: require('@/assets/images/people/nivel5/marcoaurelio.webp'),
    aliases: ['marco', 'aurélio', 'aurelio'],
    options: ['Marco Aurélio', 'Júlio César', 'Augusto César', 'Constantino'],
    hint: 'Imperador filósofo romano, autor das Meditações',
  },

  // ── NÍVEL 6 ──────────────────────────────────────────────────────────────
  {
    id: 51, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Mao Tsé-Tung',
    image: require('@/assets/images/people/nivel6/mao.webp'),
    aliases: ['mao', 'tsé-tung', 'mao tse tung', 'mao zedong'],
    options: ['Mao Tsé-Tung', 'Ho Chi Minh', 'Kim Il-sung', 'Deng Xiaoping'],
    hint: 'Fundador da República Popular da China em 1949',
  },
  {
    id: 52, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Joseph Stalin',
    image: require('@/assets/images/people/nivel6/stalin.webp'),
    aliases: ['joseph', 'stalin'],
    options: ['Joseph Stalin', 'Vladimir Lenin', 'Leon Trotsky', 'Nikita Khrushchev'],
    hint: 'Ditador soviético que liderou a URSS por quase três décadas',
  },
  {
    id: 53, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Franklin Roosevelt',
    image: require('@/assets/images/people/nivel6/roosevelt.webp'),
    aliases: ['franklin', 'roosevelt', 'fdr'],
    options: ['Franklin Roosevelt', 'Harry Truman', 'Woodrow Wilson', 'Dwight Eisenhower'],
    hint: 'Presidente americano que conduziu os EUA pela Grande Depressão e a Segunda Guerra',
  },
  {
    id: 54, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Steve Jobs',
    image: require('@/assets/images/people/nivel6/stevejobs.webp'),
    aliases: ['steve', 'jobs'],
    options: ['Steve Jobs', 'Bill Gates', 'Elon Musk', 'Jeff Bezos'],
    hint: 'Cofundador da Apple e visionário da tecnologia pessoal',
  },
  {
    id: 55, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Ronaldinho Gaúcho',
    image: require('@/assets/images/people/nivel6/ronaldinho.webp'),
    aliases: ['ronaldinho', 'gaúcho', 'ronaldinho gaucho'],
    options: ['Ronaldinho Gaúcho', 'Kaká', 'Rivaldo', 'Roberto Carlos'],
    hint: 'Craque brasileiro eleito melhor do mundo duas vezes, ídolo do Barcelona',
  },
  {
    id: 56, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Vladimir Lenin',
    image: require('@/assets/images/people/nivel6/lenin.webp'),
    aliases: ['vladimir', 'lenin'],
    options: ['Vladimir Lenin', 'Joseph Stalin', 'Leon Trotsky', 'Karl Marx'],
    hint: 'Líder da Revolução Russa de 1917 e fundador da União Soviética',
  },
  {
    id: 57, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Nelson Piquet',
    image: require('@/assets/images/people/nivel6/piquet.webp'),
    aliases: ['nelson', 'piquet'],
    options: ['Nelson Piquet', 'Emerson Fittipaldi', 'Rubens Barrichello', 'Felipe Massa'],
    hint: 'Tricampeão mundial de Fórmula 1 pelo Brasil',
  },
  {
    id: 58, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Benito Mussolini',
    image: require('@/assets/images/people/nivel6/mussolini.webp'),
    aliases: ['benito', 'mussolini'],
    options: ['Benito Mussolini', 'Francisco Franco', 'António de Oliveira Salazar', 'Ante Pavelić'],
    hint: 'Ditador italiano e fundador do fascismo, aliado de Hitler na Segunda Guerra',
  },
  {
    id: 59, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Pablo Picasso',
    image: require('@/assets/images/people/nivel6/picasso.webp'),
    aliases: ['pablo', 'picasso'],
    options: ['Pablo Picasso', 'Salvador Dalí', 'Henri Matisse', 'Marcel Duchamp'],
    hint: 'Pintor espanhol criador do cubismo, um dos maiores artistas do século XX',
  },
  {
    id: 60, level: 6, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Diana Spencer',
    image: require('@/assets/images/people/nivel6/diana.webp'),
    aliases: ['diana', 'lady di', 'princesa diana'],
    options: ['Diana Spencer', 'Rainha Elizabeth II', 'Kate Middleton', 'Grace Kelly'],
    hint: 'Princesa de Gales, "Lady Di", ícone pop da realeza britânica',
  },

  // ── NÍVEL 7 ──────────────────────────────────────────────────────────────
  {
    id: 61, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Fidel Castro',
    image: require('@/assets/images/people/nivel7/fidel.webp'),
    aliases: ['fidel', 'castro'],
    options: ['Fidel Castro', 'Hugo Chávez', 'Augusto Pinochet', 'Daniel Ortega'],
    hint: 'Líder da Revolução Cubana e governante de Cuba por décadas',
  },
  {
    id: 62, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Neil Armstrong',
    image: require('@/assets/images/people/nivel7/armstrong.webp'),
    aliases: ['neil', 'armstrong'],
    options: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'John Glenn'],
    hint: 'Primeiro ser humano a pisar na Lua, em julho de 1969',
  },
  {
    id: 63, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Yuri Gagarin',
    image: require('@/assets/images/people/nivel7/gagarin.webp'),
    aliases: ['yuri', 'gagarin'],
    options: ['Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard', 'Valentina Tereshkova'],
    hint: 'Primeiro ser humano a viajar ao espaço, em abril de 1961',
  },
  {
    id: 64, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Mikhail Gorbachev',
    image: require('@/assets/images/people/nivel7/gorbachev.webp'),
    aliases: ['mikhail', 'gorbachev', 'gorbatchev'],
    options: ['Mikhail Gorbachev', 'Boris Yeltsin', 'Vladimir Putin', 'Nikita Khrushchev'],
    hint: 'Último líder da União Soviética, promoveu a glasnost e a perestroika',
  },
  {
    id: 65, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Malcolm X',
    image: require('@/assets/images/people/nivel7/malcolmx.webp'),
    aliases: ['malcolm', 'malcolm x'],
    options: ['Malcolm X', 'Fred Hampton', 'Marcus Garvey', 'Stokely Carmichael'],
    hint: 'Líder afro-americano e porta-voz da Nação do Islã nos anos 1960',
  },
  {
    id: 66, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Malala Yousafzai',
    image: require('@/assets/images/people/nivel7/malala.webp'),
    aliases: ['malala', 'yousafzai'],
    options: ['Malala Yousafzai', 'Greta Thunberg', 'Aung San Suu Kyi', 'Shirin Ebadi'],
    hint: 'Jovem paquistanesa, Nobel da Paz por defender a educação das meninas',
  },
  {
    id: 67, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Jeff Bezos',
    image: require('@/assets/images/people/nivel7/bezos.webp'),
    aliases: ['jeff', 'bezos'],
    options: ['Jeff Bezos', 'Larry Page', 'Sergey Brin', 'Jack Ma'],
    hint: 'Fundador da Amazon, uma das maiores empresas do mundo',
  },
  {
    id: 68, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Vladimir Putin',
    image: require('@/assets/images/people/nivel7/putin.webp'),
    aliases: ['vladimir', 'putin'],
    options: ['Vladimir Putin', 'Boris Yeltsin', 'Dmitri Medvedev', 'Alexander Lukashenko'],
    hint: 'Presidente da Rússia, ex-agente da KGB, no poder desde 1999',
  },
  {
    id: 69, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Getúlio Vargas',
    image: require('@/assets/images/people/nivel7/getulio.webp'),
    aliases: ['getúlio', 'getulio', 'vargas'],
    options: ['Getúlio Vargas', 'Juscelino Kubitschek', 'João Goulart', 'Castello Branco'],
    hint: 'Presidente brasileiro que criou a CLT e a Petrobras, chamado de "pai dos pobres"',
  },
  {
    id: 70, level: 7, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Amelia Earhart',
    image: require('@/assets/images/people/nivel7/amelia.webp'),
    aliases: ['amelia', 'earhart'],
    options: ['Amelia Earhart', 'Bessie Coleman', 'Sally Ride', 'Harriet Quimby'],
    hint: 'Primeira mulher a cruzar o Atlântico em voo solo, desapareceu em 1937',
  },

  // ── NÍVEL 8 ──────────────────────────────────────────────────────────────
  {
    id: 71, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Rosa Parks',
    image: require('@/assets/images/people/nivel8/rosaparks.webp'),
    aliases: ['rosa', 'parks'],
    options: ['Rosa Parks', 'Coretta Scott King', 'Ida B. Wells', 'Angela Davis'],
    hint: 'Costureira americana que recusou ceder seu assento em 1955, símbolo dos direitos civis',
  },
  {
    id: 72, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Valentina Tereshkova',
    image: require('@/assets/images/people/nivel8/tereshkova.webp'),
    aliases: ['valentina', 'tereshkova'],
    options: ['Valentina Tereshkova', 'Sally Ride', 'Svetlana Savitskaya', 'Mae Jemison'],
    hint: 'Primeira mulher a viajar ao espaço, em junho de 1963',
  },
  {
    id: 73, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Henry Ford',
    image: require('@/assets/images/people/nivel8/henryford.webp'),
    aliases: ['henry', 'ford'],
    options: ['Henry Ford', 'Andrew Carnegie', 'John D. Rockefeller', 'J.P. Morgan'],
    hint: 'Industrial americano que revolucionou a produção em massa com a linha de montagem',
  },
  {
    id: 74, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Greta Thunberg',
    image: require('@/assets/images/people/nivel8/greta.webp'),
    aliases: ['greta', 'thunberg'],
    options: ['Greta Thunberg', 'Jane Goodall', 'Wangari Maathai', 'Vandana Shiva'],
    hint: 'Jovem ativista sueca que inspirou o movimento Fridays for Future pelo clima',
  },
  {
    id: 75, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Jair Bolsonaro',
    image: require('@/assets/images/people/nivel8/bolsonaro.webp'),
    aliases: ['bolsonaro', 'jair', 'jair bolsonaro'],
    options: ['Jair Bolsonaro', 'Lula', 'Fernando Henrique Cardoso', 'Getúlio Vargas'],
    hint: 'Ex-capitão do Exército, foi o 38º presidente do Brasil entre 2019 e 2022',
  },
  {
    id: 76, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Lula',
    image: require('@/assets/images/people/nivel8/lula.webp'),
    aliases: ['lula', 'luiz inácio', 'lula da silva'],
    options: ['Lula', 'Fernando Henrique Cardoso', 'Dilma Rousseff', 'Michel Temer'],
    hint: 'Presidente do Brasil eleito três vezes, ex-operário metalúrgico e sindicalista',
  },
  {
    id: 77, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Robert Oppenheimer',
    image: require('@/assets/images/people/nivel8/oppenheimer.webp'),
    aliases: ['robert', 'oppenheimer', 'j. robert oppenheimer'],
    options: ['Robert Oppenheimer', 'Enrico Fermi', 'Edward Teller', 'Niels Bohr'],
    hint: 'Físico americano chamado de "pai da bomba atômica", liderou o Projeto Manhattan',
  },
  {
    id: 78, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Juscelino Kubitschek',
    image: require('@/assets/images/people/nivel8/jk.webp'),
    aliases: ['juscelino', 'kubitschek', 'jk'],
    options: ['Juscelino Kubitschek', 'Getúlio Vargas', 'João Goulart', 'Castello Branco'],
    hint: 'Presidente brasileiro que construiu Brasília e prometeu "50 anos em 5"',
  },
  {
    id: 79, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Oscar Niemeyer',
    image: require('@/assets/images/people/nivel8/niemeyer.webp'),
    aliases: ['oscar', 'niemeyer'],
    options: ['Oscar Niemeyer', 'Lúcio Costa', 'Renzo Piano', 'Le Corbusier'],
    hint: 'Arquiteto brasileiro responsável pelos principais edifícios de Brasília',
  },
  {
    id: 80, level: 8, difficulty: 'hard',
    question: 'Quem é esta figura histórica?',
    answer: 'Frank Sinatra',
    image: require('@/assets/images/people/nivel8/sinatra.webp'),
    aliases: ['frank', 'sinatra', 'ol blue eyes'],
    options: ['Frank Sinatra', 'Dean Martin', 'Sammy Davis Jr.', 'Tony Bennett'],
    hint: '"Ol\' Blue Eyes", um dos maiores cantores americanos do século XX',
  },

  // ── NÍVEL 9 ──────────────────────────────────────────────────────────────
  {
    id: 81, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Brad Arnold',
    image: require('@/assets/images/people/nivel9/bradarnold.webp'),
    aliases: ['brad', 'arnold', '3 doors down'],
    options: ['Brad Arnold', 'Chad Kroeger', 'Scott Stapp', 'Dave Grohl'],
    hint: 'Vocalista e baterista da banda americana 3 Doors Down, conhecida por "Kryptonite"',
  },
  {
    id: 82, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Santos Dumont',
    image: require('@/assets/images/people/nivel9/santosdumont.webp'),
    aliases: ['santos dumont', 'alberto', 'dumont'],
    options: ['Santos Dumont', 'Wright Brothers', 'Gustave Eiffel', 'Nikola Tesla'],
    hint: 'Brasileiro considerado o pai da aviação, voou com o 14-Bis em 1906',
  },
  {
    id: 83, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Cazuza',
    image: require('@/assets/images/people/nivel9/cazuza.webp'),
    aliases: ['cazuza', 'agenor de miranda'],
    options: ['Cazuza', 'Renato Russo', 'Lobão', 'Herbert Vianna'],
    hint: 'Cantor e poeta brasileiro do rock, vocalista do Barão Vermelho, ícone dos anos 80',
  },
  {
    id: 84, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Rita Lee',
    image: require('@/assets/images/people/nivel9/ritalee.webp'),
    aliases: ['rita', 'lee', 'rita lee'],
    options: ['Rita Lee', 'Elis Regina', 'Cássia Eller', 'Pitty'],
    hint: 'Rainha do rock brasileiro, ex-integrante dos Mutantes',
  },
  {
    id: 85, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Al Pacino',
    image: require('@/assets/images/people/nivel9/alpacino.webp'),
    aliases: ['al pacino', 'alfredo', 'pacino'],
    options: ['Al Pacino', 'Robert De Niro', 'Marlon Brando', 'Dustin Hoffman'],
    hint: 'Ator americano famoso por O Poderoso Chefão e Scarface',
  },
  {
    id: 86, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Morgan Freeman',
    image: require('@/assets/images/people/nivel9/morganfreeman.webp'),
    aliases: ['morgan', 'freeman'],
    options: ['Morgan Freeman', 'Denzel Washington', 'Samuel L. Jackson', 'Sidney Poitier'],
    hint: 'Ator americano de voz icônica, estrelou Um Sonho de Liberdade e Se7en',
  },
  {
    id: 87, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Tiger Woods',
    image: require('@/assets/images/people/nivel9/tigerwoods.webp'),
    aliases: ['tiger', 'woods', 'tiger woods'],
    options: ['Tiger Woods', 'Jack Nicklaus', 'Phil Mickelson', 'Rory McIlroy'],
    hint: 'Golfista americano considerado o maior de todos os tempos, com 15 títulos de Grand Slam',
  },
  {
    id: 88, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'MrBeast',
    image: require('@/assets/images/people/nivel9/mrbeast.webp'),
    aliases: ['mrbeast', 'mr beast', 'jimmy donaldson', 'james donaldson'],
    options: ['MrBeast', 'PewDiePie', 'Logan Paul', 'KSI'],
    hint: 'Youtuber americano mais seguido do mundo, famoso por desafios milionários e filantropia',
  },
  {
    id: 89, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Alexander Fleming',
    image: require('@/assets/images/people/nivel9/fleming.webp'),
    aliases: ['alexander', 'fleming'],
    options: ['Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Joseph Lister'],
    hint: 'Médico escocês que descobriu a penicilina em 1928, salvando milhões de vidas',
  },
  {
    id: 90, level: 9, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'John F. Kennedy',
    image: require('@/assets/images/people/nivel9/jfk.webp'),
    aliases: ['john', 'kennedy', 'jfk', 'john kennedy'],
    options: ['John F. Kennedy', 'Richard Nixon', 'Lyndon Johnson', 'Dwight Eisenhower'],
    hint: '35º presidente dos EUA, assassinado em Dallas em 1963',
  },

  // ── NÍVEL 10 ─────────────────────────────────────────────────────────────
  {
    id: 91, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Renato Russo',
    image: require('@/assets/images/people/nivel10/renatorusso.webp'),
    aliases: ['renato', 'russo', 'renato russo'],
    options: ['Renato Russo', 'Cazuza', 'Lobão', 'Raul Seixas'],
    hint: 'Vocalista e compositor da Legião Urbana, um dos maiores ícones do rock brasileiro',
  },
  {
    id: 92, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Antônio Fagundes',
    image: require('@/assets/images/people/nivel10/fagundes.webp'),
    aliases: ['antônio', 'antonio', 'fagundes'],
    options: ['Antônio Fagundes', 'Tony Ramos', 'Lima Duarte', 'Tarcísio Meira'],
    hint: 'Um dos atores mais premiados da televisão e do cinema brasileiro',
  },
  {
    id: 93, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Eduardo Saverin',
    image: require('@/assets/images/people/nivel10/saverin.webp'),
    aliases: ['eduardo', 'saverin', 'eduardo saverin'],
    options: ['Eduardo Saverin', 'Mark Zuckerberg', 'Sean Parker', 'Dustin Moskovitz'],
    hint: 'Cofundador brasileiro do Facebook, sua história foi retratada no filme "A Rede Social"',
  },
  {
    id: 94, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Luiza Helena Trajano',
    image: require('@/assets/images/people/nivel10/luizatrajano.webp'),
    aliases: ['luiza', 'trajano', 'luiza helena'],
    options: ['Luiza Helena Trajano', 'Cristina Junqueira', 'Nizan Guanaes', 'Abílio Diniz'],
    hint: 'Presidente do conselho do Magazine Luiza, uma das empresárias mais influentes do Brasil',
  },
  {
    id: 95, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Cristina Junqueira',
    image: require('@/assets/images/people/nivel10/cristinajunqueira.webp'),
    aliases: ['cristina', 'junqueira'],
    options: ['Cristina Junqueira', 'Luiza Helena Trajano', 'Leila Pereira', 'Alessandra Orofino'],
    hint: 'Cofundadora do Nubank, um dos maiores bancos digitais do mundo',
  },
  {
    id: 96, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Larry Page',
    image: require('@/assets/images/people/nivel10/larrypage.webp'),
    aliases: ['larry', 'page'],
    options: ['Larry Page', 'Sergey Brin', 'Jeff Bezos', 'Eric Schmidt'],
    hint: 'Cofundador do Google junto com Sergey Brin',
  },
  {
    id: 97, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Jensen Huang',
    image: require('@/assets/images/people/nivel10/jensenhuang.webp'),
    aliases: ['jensen', 'huang'],
    options: ['Jensen Huang', 'Lisa Su', 'Pat Gelsinger', 'Sundar Pichai'],
    hint: 'Fundador e CEO da NVIDIA, empresa que domina o mercado de chips de inteligência artificial',
  },
  {
    id: 98, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Phelps',
    image: require('@/assets/images/people/nivel10/michaelphelps.webp'),
    aliases: ['michael', 'phelps'],
    options: ['Michael Phelps', 'Mark Spitz', 'Ryan Lochte', 'Ian Thorpe'],
    hint: 'Nadador americano com 23 ouros olímpicos, o maior medalhista da história dos Jogos',
  },
  {
    id: 99, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Carlos Alberto Torres',
    image: require('@/assets/images/people/nivel10/carlosalberto.webp'),
    aliases: ['carlos alberto', 'capita', 'carlos alberto torres'],
    options: ['Carlos Alberto Torres', 'Tostão', 'Gérson', 'Clodoaldo'],
    hint: 'Capitão da Seleção Brasileira tri-campeã em 1970, marcou um dos gols mais bonitos da história',
  },
  {
    id: 100, level: 10, difficulty: 'extreme',
    question: 'Quem é esta figura histórica?',
    answer: 'Garrincha',
    image: require('@/assets/images/people/nivel10/garrincha.webp'),
    aliases: ['garrincha', 'manuel francisco', 'alegria do povo'],
    options: ['Garrincha', 'Didi', 'Vavá', 'Zagallo'],
    hint: 'Perna torta e drible desconcertante, foi bi-campeão mundial com o Brasil em 1958 e 1962',
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

// ─── Embaralha array sem modificar o original ────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Perguntas fixas por nível, sem repetição ────────────────────────────────
function getQuestionsForLevel(levelNum: number): Question[] {
  return ALL_QUESTIONS
    .filter((q) => q.level === levelNum)
    .sort(() => Math.random() - 0.5)
    .map((q) => ({ ...q, options: shuffle(q.options) }));
}

const LETTERS = ['A', 'B', 'C', 'D'];
type Phase = 'playing' | 'feedback' | 'result';
interface RoundResult { correct: boolean; skipped?: boolean; }

// ─── AdMob ────────────────────────────────────────────────────────────────────
const AD_UNIT_ID = TestIds.INTERSTITIAL;
let matchCountSinceAd = 0;


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

  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest(AD_UNIT_ID)
  );
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const ad = interstitialRef.current;
    const unsubLoad = ad.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
    const unsubClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      ad.load();
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => setAdLoaded(false));
    ad.load();
    return () => { unsubLoad(); unsubClose(); unsubError(); };
  }, []);

  const [selected, setSelected] = useState<string | null>(null);
  const [optsVisible, setOptsVisible] = useState(true);
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [timedOut, setTimedOut] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [earnedStars, setEarnedStars] = useState(0);
  const [attempts, setAttempts] = useState(0); // 0 = primeira vez, 1 = segunda tentativa
  const [hintVisible, setHintVisible] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animações por opção (A, B, C, D)
  const shakeAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const pulseAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;
  // Animação fade-in do botão de dica
  const hintFadeAnim = useRef(new Animated.Value(0)).current;

  const question = questions[index];
  const totalQ = questions.length;
  const progress = (index + 1) / totalQ;
  const timerRed = timeLeft <= Math.floor(TIMER_SECS * 0.33);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function stopHintTimer() {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }

  // Desbloqueia o botão de dica após 5 segundos de jogo
  useEffect(() => {
    if (phase !== 'playing') return;
    setHintVisible(false);
    setHintUnlocked(false);
    hintFadeAnim.setValue(0);
    hintTimerRef.current = setTimeout(() => {
      setHintUnlocked(true);
      Animated.timing(hintFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 5000);
    return stopHintTimer;
  }, [index, phase]);

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

  function handleTimeout() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimedOut(true);
    setPhase('feedback');
  }

  // Shake na opção errada (índice no array de options)
  function triggerShake(optIndex: number) {
    shakeAnims[optIndex].setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnims[optIndex], { toValue: 8, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnims[optIndex], { toValue: -8, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnims[optIndex], { toValue: 6, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnims[optIndex], { toValue: -6, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnims[optIndex], { toValue: 0, duration: 40, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  }

  // Pulse na opção correta
  function triggerPulse(optIndex: number) {
    pulseAnims[optIndex].setValue(1);
    Animated.sequence([
      Animated.timing(pulseAnims[optIndex], { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnims[optIndex], { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }

  function checkFreeAnswer(val: string): boolean {
    const lower = val.toLowerCase().trim();
    return question.aliases.some((a) => lower.includes(a));
  }

  function pickOption(opt: string) {
    if (phase !== 'playing') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => prev === opt ? null : opt); // toggle: toca de novo para desmarcar
  }

  function confirmOption() {
    if (!selected || phase !== 'playing') return;
    stopTimer();
    stopHintTimer();
    const correct = selected === question.answer;
    const optIndex = question.options.indexOf(selected);
    const correctIndex = question.options.indexOf(question.answer);
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (optIndex >= 0) triggerPulse(optIndex);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (optIndex >= 0) triggerShake(optIndex);
      if (correctIndex >= 0) triggerPulse(correctIndex);
    }
    setResults((r) => [...r, { correct }]);
    setPhase('feedback');
  }

  function confirmFree() {
    if (!textAnswer.trim()) return;
    Keyboard.dismiss();

    const correct = checkFreeAnswer(textAnswer);

    if (!correct && attempts === 0) {
      // Primeira tentativa errada → dá outra chance
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAttempts(1);
      setTextAnswer('');
      return;
    }

    // Segunda tentativa ou acerto → segue o fluxo normal
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    stopTimer();
    stopHintTimer();
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
    setAttempts(0);
    setHintVisible(false);
    setHintUnlocked(false);
    shakeAnims.forEach((a) => a.setValue(0));
    pulseAnims.forEach((a) => a.setValue(1));
    setPhase('playing');
  }

  async function finishGame(finalResults: RoundResult[]) {
    const correctCount = finalResults.filter((r) => r.correct).length;
    const stars = await saveResult(correctCount, totalQ, mode ?? 'multiple', level ?? '1');
    setEarnedStars(stars);
    setPhase('result');

    matchCountSinceAd += 1;
    if (adLoaded && matchCountSinceAd >= 2) {
      matchCountSinceAd = 0;
      setTimeout(() => interstitialRef.current.show(), 800);
    }
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

          {/* Jogar novamente + Outros níveis lado a lado */}
          <View style={styles.resultBtnRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.resultBtnHalf]}
              onPress={() => router.replace(`/game?mode=${mode}&level=${level}`)}
            >
              <Ionicons name="refresh" size={18} color={Colors.primaryLight} />
              <Text style={styles.confirmText}>Jogar novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, styles.resultBtnHalf, { backgroundColor: Colors.dark }]}
              onPress={() => router.replace(`/levels?mode=${mode}`)}
            >
              <Ionicons name="list-outline" size={18} color={Colors.primaryLight} />
              <Text style={styles.confirmText}>Outros níveis</Text>
            </TouchableOpacity>
          </View>

          {/* Menu principal centralizado abaixo */}
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace(`/levels?mode=${mode}`)}>
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

        {/* BOTÃO DE DICA — aparece após 5s, disponível em todos os modos */}
        {hintUnlocked && phase === 'playing' && (
          <Animated.View style={{ opacity: hintFadeAnim }}>
            <TouchableOpacity
              style={styles.hintBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHintVisible((v) => !v);
              }}
            >
              <Ionicons name="bulb-outline" size={16} color="#B07D10" />
              <Text style={styles.hintBtnText}>{hintVisible ? 'Ocultar dica' : 'Ver dica'}</Text>
            </TouchableOpacity>
            {hintVisible && (
              <View style={styles.hintBox}>
                <Text style={styles.hintBoxText}>{question.hint}</Text>
              </View>
            )}
          </Animated.View>
        )}

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
                  } else if (phase === 'playing' && opt === selected) {
                    optStyle = styles.optSelected;
                    letterStyle = styles.letterSelected;
                  }
                  return (
                    <Animated.View
                      key={opt}
                      style={{
                        transform: [
                          { translateX: shakeAnims[i] },
                          { scale: pulseAnims[i] },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.option, optStyle]}
                        activeOpacity={phase !== 'playing' ? 1 : 0.7}
                        onPress={() => pickOption(opt)}
                      >
                        <View style={[styles.optLetter, letterStyle]}>
                          <Text style={styles.optLetterText}>{LETTERS[i]}</Text>
                        </View>
                        <Text style={styles.optName}>{opt}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            )}
            {phase === 'playing' && (
              <>
                <TouchableOpacity
                  style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
                  activeOpacity={selected ? 0.8 : 1}
                  onPress={confirmOption}
                >
                  <Ionicons name="checkmark" size={18} color={selected ? Colors.primaryLight : Colors.textSecondary} />
                  <Text style={[styles.confirmText, !selected && styles.confirmTextDisabled]}>
                    Confirmar resposta
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iKnowBtn} onPress={() => setOptsVisible((v) => !v)}>
                  <Ionicons name={optsVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.primaryLight} />
                  <Text style={styles.iKnowText}>
                    {optsVisible ? 'Esconder as opções' : 'Eu sei! Mostrar opções'}
                  </Text>
                </TouchableOpacity>
              </>
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
  optSelected: { backgroundColor: Colors.primaryLight + '33', borderColor: Colors.primary, borderWidth: 1.5 },
  letterSelected: { backgroundColor: Colors.primary },
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
  resultBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  resultBtnHalf: { flex: 1, marginTop: 0 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, padding: 13, marginTop: 8 },
  confirmBtnDisabled: { backgroundColor: Colors.backgroundSecondary },
  confirmTextDisabled: { color: Colors.textSecondary },
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
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderWidth: 0.5,
    borderColor: '#F0D080',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  hintBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#B07D10',
  },
  hintBox: {
    backgroundColor: '#FFFBEA',
    borderWidth: 0.5,
    borderColor: '#F0D080',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  hintBoxText: {
    fontSize: 13,
    color: '#7A5800',
    textAlign: 'center',
  },
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