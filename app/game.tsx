import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ── dados mockados ──────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    question: 'Quem é esta figura histórica?',
    answer: 'Michael Jackson',
    options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'David Bowie'],
  },
  {
    id: 2,
    question: 'Quem é esta figura histórica?',
    answer: 'Albert Einstein',
    options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Charles Darwin'],
  },
  {
    id: 3,
    question: 'Quem é esta figura histórica?',
    answer: 'Napoleão Bonaparte',
    options: ['Napoleão Bonaparte', 'Júlio César', 'Alexandre o Grande', 'Genghis Khan'],
  },
];

const TIMER_SECS = 24;
const LETTERS = ['A', 'B', 'C', 'D'];

export default function GameScreen() {
  const router = useRouter();
  const { mode, level } = useLocalSearchParams<{ mode: string; level: string }>();

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [optsVisible, setOptsVisible] = useState(true);
  const [textAnswer, setTextAnswer] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFree = mode === 'free';
  const question = QUESTIONS[index % QUESTIONS.length];
  const isCorrect = isFree
    ? textAnswer.toLowerCase().includes(question.answer.split(' ')[0].toLowerCase()) ||
      textAnswer.toLowerCase().includes(question.answer.split(' ')[1]?.toLowerCase() ?? '')
    : selected === question.answer;

  // ── timer ──────────────────────────────────────────────────────
  useEffect(() => {
    setTimeLeft(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [index]);

  function stopTimer() { clearInterval(timerRef.current!); }

  // ── ações ──────────────────────────────────────────────────────
  function pickOption(opt: string) {
    if (selected) return;
    setSelected(opt);
    setShowFeedback(true);
    stopTimer();
  }

  function confirmFree() {
    if (!textAnswer.trim()) return;
    Keyboard.dismiss();
    setShowFeedback(true);
    stopTimer();
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
    setShowFeedback(false);
    setOptsVisible(true);
    setTextAnswer('');
  }

  function skip() {
    next();
  }

  const progress = ((index % QUESTIONS.length) + 1) / QUESTIONS.length;
  const timerRed = timeLeft <= 8;

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={[styles.timerPill, timerRed && styles.timerPillRed]}>
          <Ionicons
            name="time-outline" size={14}
            color={timerRed ? Colors.errorText : Colors.textSecondary}
          />
          <Text style={[styles.timerText, timerRed && styles.timerTextRed]}>
            {String(timeLeft).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.qCount}>
          {(index % QUESTIONS.length) + 1}/{QUESTIONS.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Foto placeholder */}
        <View style={styles.photoBox}>
          <Ionicons name="person-circle-outline" size={64} color="rgba(255,255,255,0.15)" />
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        {/* ── MODO COM OPÇÕES ── */}
        {!isFree && (
          <>
            {optsVisible && (
              <View style={styles.options}>
                {question.options.map((opt, i) => {
                  let optStyle = {};
                  let letterStyle = {};
                  if (showFeedback) {
                    if (opt === question.answer) {
                      optStyle = styles.optCorrect;
                      letterStyle = styles.letterCorrect;
                    } else if (opt === selected) {
                      optStyle = styles.optWrong;
                      letterStyle = styles.letterWrong;
                    }
                  }
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.option, optStyle]}
                      activeOpacity={showFeedback ? 1 : 0.7}
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

            {!showFeedback && (
              <TouchableOpacity
                style={styles.iKnowBtn}
                onPress={() => setOptsVisible((v) => !v)}
              >
                <Ionicons
                  name={optsVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color={Colors.primaryLight}
                />
                <Text style={styles.iKnowText}>
                  {optsVisible ? 'Esconder as opções' : 'Eu sei! Mostrar opções'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── MODO LIVRE ── */}
        {isFree && !showFeedback && (
          <>
            <TextInput
              style={styles.textInput}
              placeholder="Digite o nome..."
              placeholderTextColor={Colors.textSecondary}
              value={textAnswer}
              onChangeText={setTextAnswer}
              returnKeyType="done"
              onSubmitEditing={confirmFree}
            />
            <Text style={styles.hint}>
              <Ionicons name="information-circle-outline" size={12} /> Não precisa ser exato — reconhecemos variações
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmFree}>
              <Ionicons name="checkmark" size={18} color={Colors.primaryLight} />
              <Text style={styles.confirmText}>Confirmar resposta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={skip}>
              <Text style={styles.skipText}>Pular esta pergunta</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── FEEDBACK ── */}
        {showFeedback && (
          <View style={[styles.feedback, isCorrect ? styles.feedbackOk : styles.feedbackErr]}>
            <View style={styles.fbHead}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={isCorrect ? Colors.successText : Colors.errorText}
              />
              <Text style={[styles.fbTitle, { color: isCorrect ? Colors.successText : Colors.errorText }]}>
                {isCorrect ? 'Correto!' : 'Errou!'}
              </Text>
            </View>
            <Text style={[styles.fbBody, { color: isCorrect ? '#27500A' : '#791F1F' }]}>
              Era <Text style={{ fontWeight: '600' }}>{question.answer}</Text>
            </Text>
            <TouchableOpacity
              style={[styles.fbBtn, { backgroundColor: isCorrect ? Colors.successText : Colors.errorText }]}
              onPress={next}
            >
              <Text style={styles.fbBtnText}>Próxima pergunta</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },

  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  timerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  timerPillRed: { backgroundColor: Colors.error, borderColor: '#F7C1C1' },
  timerText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  timerTextRed: { color: Colors.errorText },
  progressWrap: {
    flex: 1, height: 5,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 99, overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },
  qCount: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  photoBox: {
    borderRadius: 16, borderWidth: 0.5, borderColor: Colors.border,
    aspectRatio: 4 / 3,
    backgroundColor: Colors.dark,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  questionText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, marginBottom: 10 },

  options: { gap: 7 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.background,
    borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: 12, padding: 11,
  },
  optCorrect: { backgroundColor: Colors.success, borderColor: '#C0DD97' },
  optWrong:   { backgroundColor: Colors.error,   borderColor: '#F7C1C1' },
  optLetter: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  letterCorrect: { backgroundColor: '#639922' },
  letterWrong:   { backgroundColor: '#E24B4A' },
  optLetterText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  optName: { fontSize: 14, color: Colors.textPrimary },

  iKnowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.dark,
    borderRadius: 12, padding: 13, marginTop: 10,
  },
  iKnowText: { fontSize: 14, fontWeight: '500', color: Colors.primaryLight },

  textInput: {
    fontSize: 15, padding: 12,
    borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
  },
  hint: { fontSize: 11, color: Colors.textSecondary, marginTop: 5 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12, padding: 13, marginTop: 8,
  },
  confirmText: { fontSize: 15, fontWeight: '500', color: Colors.primaryLight },
  skipText: { textAlign: 'center', padding: 10, fontSize: 12, color: Colors.textSecondary },

  feedback: { marginTop: 10, padding: 14, borderRadius: 16 },
  feedbackOk:  { backgroundColor: Colors.success,  borderWidth: 0.5, borderColor: '#C0DD97' },
  feedbackErr: { backgroundColor: Colors.error,    borderWidth: 0.5, borderColor: '#F7C1C1' },
  fbHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fbTitle: { fontSize: 15, fontWeight: '500' },
  fbBody: { fontSize: 13 },
  fbBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 10, padding: 10, marginTop: 10,
  },
  fbBtnText: { fontSize: 13, fontWeight: '500', color: '#fff' },
});