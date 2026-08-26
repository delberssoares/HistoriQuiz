import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing,
  Image,
  Keyboard, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LEVEL_TIMER } from './data/levelConfig';
import { getQuestionBank } from './data/questions';
import { Question } from './data/questions/types';

const isExpoGo = Constants.appOwnership === 'expo';
const AdsModule = isExpoGo ? null : require('react-native-google-mobile-ads');


// ─── Embaralha array sem modificar o original ────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Perguntas fixas por nível, sem repetição ────────────────────────────────
function getQuestionsForLevel(levelNum: number, category: string): Question[] {
  const bank = getQuestionBank(category);
  return bank
    .filter((q) => q.level === levelNum)
    .sort(() => Math.random() - 0.5)
    .map((q) => ({ ...q, options: shuffle(q.options) }));
}

const LETTERS = ['A', 'B', 'C', 'D'];
type Phase = 'playing' | 'feedback' | 'result';
interface RoundResult { correct: boolean; skipped?: boolean; }

// ─── AdMob ────────────────────────────────────────────────────────────────────
const AD_UNIT_ID = __DEV__
  ? AdsModule?.TestIds?.INTERSTITIAL
  : 'ca-app-pub-6602652515276009/7297292275';
let matchCountSinceAd = 0;


export default function GameScreen() {
  const router = useRouter();
  const { mode, level, category } = useLocalSearchParams<{ mode: string; level: string; category?: string }>();
  const { saveResult } = useGameStore();

  const isFree = mode === 'free';
  const levelNum = parseInt(level ?? '1', 10);
  const TIMER_SECS = LEVEL_TIMER[levelNum] ?? 24;

  const [questions] = useState(() => getQuestionsForLevel(levelNum, category ?? 'geral'));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');

  // ── Guarda contra nível sem perguntas ──────────────────────────────────────
if (questions.length === 0) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }]}>
        <Ionicons name="construct-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.questionText}>Ainda não temos novas perguntas disponíveis</Text>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => router.replace(`/levels?mode=${mode}&category=${category ?? 'geral'}`)}
        >
          <Ionicons name="arrow-back" size={18} color={Colors.primaryLight} />
          <Text style={styles.confirmText}>Voltar aos níveis</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

  const interstitialRef = useRef(
    isExpoGo ? null : AdsModule.InterstitialAd.createForAdRequest(AD_UNIT_ID)
  );
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (isExpoGo) return;
    const ad = interstitialRef.current;
    const unsubLoad = ad.addAdEventListener(AdsModule.AdEventType.LOADED, () => setAdLoaded(true));
    const unsubClose = ad.addAdEventListener(AdsModule.AdEventType.CLOSED, () => {
      setAdLoaded(false);
      ad.load();
    });
    const unsubError = ad.addAdEventListener(AdsModule.AdEventType.ERROR, () => setAdLoaded(false));
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
    if (!isExpoGo && adLoaded && matchCountSinceAd >= 2) {
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

          {/* Jogar novamente + Próximo nível lado a lado */}
          <View style={styles.resultBtnRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.resultBtnHalf]}
              onPress={() => router.replace(`/game?mode=${mode}&level=${level}&category=${category ?? 'geral'}`)}
            >
              <Ionicons name="refresh" size={18} color={Colors.primaryLight} />
              <Text style={styles.confirmText}>Jogar novamente</Text>
            </TouchableOpacity>

            {levelNum < 10 && (
              <TouchableOpacity
                style={[styles.confirmBtn, styles.resultBtnHalf, { backgroundColor: Colors.dark }]}
                onPress={() => router.replace(`/game?mode=${mode}&level=${levelNum + 1}&category=${category ?? 'geral'}`)}
              >
                <Ionicons name="arrow-forward" size={18} color={Colors.primaryLight} />
                <Text style={styles.confirmText}>Próximo nível</Text>
              </TouchableOpacity>
            )}
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