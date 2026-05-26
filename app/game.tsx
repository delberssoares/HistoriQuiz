import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Banco de perguntas ───────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Jackson',
    aliases: ['michael', 'jackson'],
    options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'David Bowie'],
    image: require('../assets/images/people/michael.webp'),
  },
  {
    id: 2,
    question: 'Quem é esta figura histórica?',
    answer: 'Albert Einstein',
    aliases: ['albert', 'einstein'],
    options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Charles Darwin'],
    image: require('../assets/images/people/albert.webp'),
  },
  {
    id: 3,
    question: 'Quem é esta figura histórica?',
    answer: 'Napoleão Bonaparte',
    aliases: ['napoleão', 'napoleao', 'bonaparte'],
    options: ['Napoleão Bonaparte', 'Júlio César', 'Alexandre o Grande', 'Genghis Khan'],
    image: require('../assets/images/people/napoleao.webp'),
  },
  {
    id: 4,
    question: 'Quem é esta figura histórica?',
    answer: 'Marie Curie',
    aliases: ['marie', 'curie', 'maria curie'],
    options: ['Florence Nightingale', 'Marie Curie', 'Ada Lovelace', 'Rosalind Franklin'],
    image: require('../assets/images/people/marie.webp'),
  },
  {
    id: 5,
    question: 'Quem é esta figura histórica?',
    answer: 'Leonardo da Vinci',
    aliases: ['leonardo', 'da vinci', 'davinci'],
    options: ['Michelangelo', 'Leonardo da Vinci', 'Rafael', 'Donatello'],
    image: require('../assets/images/people/davinci.webp'),
  },
];

const TIMER_SECS = 24;
const LETTERS = ['A', 'B', 'C', 'D'];

type Phase = 'playing' | 'feedback' | 'result';
interface RoundResult { correct: boolean; skipped?: boolean; }

export default function GameScreen() {
  const router = useRouter();
  const { mode, level } = useLocalSearchParams<{ mode: string; level: string }>();
  const { saveResult } = useGameStore();

  const isFree = mode === 'free';

  const [questions] = useState(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5),
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [selected, setSelected] = useState<string | null>(null);
  const [optsVisible, setOptsVisible] = useState(true);
  const [textAnswer, setTextAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [timedOut, setTimedOut] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [earnedStars, setEarnedStars] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[index];
  const totalQ = questions.length;
  const progress = (index + 1) / totalQ;
  const timerRed = timeLeft <= 8;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase]);

  function handleTimeout() { setTimedOut(true); setPhase('feedback'); }

  function checkFreeAnswer(val: string): boolean {
    const lower = val.toLowerCase();
    return question.aliases.some((a) => lower.includes(a));
  }

  function pickOption(opt: string) {
    if (phase !== 'playing') return;
    stopTimer();
    setSelected(opt);
    setPhase('feedback');
    setResults((r) => [...r, { correct: opt === question.answer }]);
  }

  function confirmFree() {
    if (!textAnswer.trim()) return;
    Keyboard.dismiss();
    stopTimer();
    const correct = checkFreeAnswer(textAnswer);
    setResults((r) => [...r, { correct }]);
    setPhase('feedback');
  }

  function skipQuestion() {
    stopTimer();
    setResults((r) => [...r, { correct: false, skipped: true }]);
    advanceOrFinish(false);
  }

  async function advanceOrFinish(fromFeedback = true) {
    const nextIndex = index + 1;
    if (nextIndex >= totalQ) {
      const allResults = fromFeedback ? [...results] : results;
      const correctCount = allResults.filter((r) => r.correct).length;
      const stars = await saveResult(correctCount, totalQ, mode ?? 'multiple', level ?? '1');
      setEarnedStars(stars);
      setPhase('result');
    } else {
      setIndex(nextIndex);
      setSelected(null);
      setOptsVisible(true);
      setTextAnswer('');
      setPhase('playing');
    }
  }

  function next() { advanceOrFinish(true); }

  const isCorrectFree = phase === 'feedback' && isFree && !timedOut ? checkFreeAnswer(textAnswer) : false;
  const isCorrectMultiple = phase === 'feedback' && !isFree && !timedOut ? selected === question.answer : false;
  const isCorrect = isFree ? isCorrectFree : isCorrectMultiple;
  const correctCount = results.filter((r) => r.correct).length;

  // ── RESULTADO FINAL ────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((correctCount / totalQ) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 40 }]}>
          <Text style={styles.starsLarge}>
            {[1, 2, 3].map((i) => (i <= earnedStars ? '★' : '☆')).join(' ')}
          </Text>
          <Text style={styles.resultTitle}>
            {pct >= 90 ? 'Incrível!' : pct >= 60 ? 'Bom trabalho!' : 'Continue tentando!'}
          </Text>
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

          <TouchableOpacity style={styles.confirmBtn} onPress={() => router.replace(`/game?mode=${mode}&level=${level}`)}>
            <Ionicons name="refresh" size={18} color={Colors.primaryLight} />
            <Text style={styles.confirmText}>Jogar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: Colors.dark, marginTop: 10 }]} onPress={() => router.replace(`/levels?mode=${mode}`)}>
            <Ionicons name="list-outline" size={18} color={Colors.primaryLight} />
            <Text style={styles.confirmText}>Outros níveis</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── JOGO ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.timerPill, timerRed && styles.timerPillRed]}>
          <Ionicons name="time-outline" size={14} color={timerRed ? Colors.errorText : Colors.textSecondary} />
          <Text style={[styles.timerText, timerRed && styles.timerTextRed]}>{String(timeLeft).padStart(2, '0')}</Text>
        </View>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.qCount}>{index + 1}/{totalQ}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Imagem da figura */}
        <Image
          source={question.image}
          style={styles.photoBox}
          resizeMode="cover"
        />

        <Text style={styles.questionText}>{question.question}</Text>

        {/* MODO COM OPÇÕES */}
        {!isFree && (
          <>
            {optsVisible && (
              <View style={styles.options}>
                {question.options.map((opt, i) => {
                  let optStyle = {};
                  let letterStyle = {};
                  if (phase === 'feedback' || timedOut) {
                    if (opt === question.answer) { optStyle = styles.optCorrect; letterStyle = styles.letterCorrect; }
                    else if (opt === selected) { optStyle = styles.optWrong; letterStyle = styles.letterWrong; }
                  }
                  return (
                    <TouchableOpacity key={opt} style={[styles.option, optStyle]} activeOpacity={phase !== 'playing' ? 1 : 0.7} onPress={() => pickOption(opt)}>
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
                <Text style={styles.iKnowText}>{optsVisible ? 'Esconder as opções' : 'Eu sei! Mostrar opções'}</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* MODO LIVRE */}
        {isFree && phase === 'playing' && (
          <>
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
        {(phase === 'feedback' || timedOut) && (
          <View style={[styles.feedback, (isCorrect && !timedOut) ? styles.feedbackOk : styles.feedbackErr]}>
            <View style={styles.fbHead}>
              <Ionicons name={isCorrect && !timedOut ? 'checkmark-circle' : 'close-circle'} size={20} color={isCorrect && !timedOut ? Colors.successText : Colors.errorText} />
              <Text style={[styles.fbTitle, { color: isCorrect && !timedOut ? Colors.successText : Colors.errorText }]}>
                {timedOut ? 'Tempo esgotado!' : isCorrect ? 'Correto!' : 'Errou!'}
              </Text>
            </View>
            <Text style={[styles.fbBody, { color: isCorrect && !timedOut ? '#27500A' : '#791F1F' }]}>
              Era <Text style={{ fontWeight: '600' }}>{question.answer}</Text>
            </Text>
            <TouchableOpacity style={[styles.fbBtn, { backgroundColor: isCorrect && !timedOut ? Colors.successText : Colors.errorText }]} onPress={next}>
              <Text style={styles.fbBtnText}>{index + 1 >= totalQ ? 'Ver resultado' : 'Próxima pergunta'}</Text>
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
    height: 400,        
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: Colors.dark,
  },

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
});
