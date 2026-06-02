import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getRank(matches: number, accuracy: number): { label: string; icon: string; color: string } {
  if (matches === 0)  return { label: 'Novato',      icon: 'leaf-outline',    color: Colors.textSecondary };
  if (matches < 5)    return { label: 'Aprendiz',    icon: 'school-outline',  color: '#3B6D11' };
  if (matches < 15)   return { label: 'Explorador',  icon: 'compass-outline', color: '#854F0B' };
  if (accuracy >= 80) return { label: 'Historiador', icon: 'library-outline', color: Colors.primary };
  return                     { label: 'Veterano',    icon: 'shield-outline',  color: '#993C1D' };
}

interface Achievement {
  icon: string;
  label: string;
  desc: string;
  done: boolean;
}

function getAchievements(
  stats: { matches: number; correct: number; streak: number; maxStreak: number },
  accuracy: number,
): Achievement[] {
  return [
    { icon: 'trophy-outline',   label: 'Primeira Partida',  desc: 'Complete uma partida',              done: stats.matches >= 1 },
    { icon: 'flame-outline',    label: 'Em Chamas',         desc: 'Sequência de 5 acertos',            done: stats.maxStreak >= 5 },
    { icon: 'star-outline',     label: 'Estudioso',         desc: '10 acertos no total',               done: stats.correct >= 10 },
    { icon: 'flash-outline',    label: 'Dedicado',          desc: '5 partidas jogadas',                done: stats.matches >= 5 },
    { icon: 'medal-outline',    label: 'Atirador de Elite', desc: '80% de precisão em mais de 10 partidas',     done: accuracy >= 80 && stats.matches >= 10 },
    { icon: 'infinite-outline', label: 'Imparável',         desc: 'Sequência de 10',                   done: stats.maxStreak >= 10 },
  ];
}

export default function ProfileScreen() {
  const { stats, accuracy, reload, resetAll } = useGameStore();
  const [selected, setSelected] = useState<Achievement | null>(null);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const rank         = getRank(stats.matches, accuracy);
  const achievements = getAchievements(stats, accuracy);
  const doneCount    = achievements.filter((a) => a.done).length;

  function handleReset() {
    Alert.alert(
      'Reiniciar tudo?',
      'Seu progresso, estrelas e estatísticas serão apagados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetAll },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={Colors.primaryLight} />
            </View>
          </View>
          <Text style={styles.heroName}>Jogador</Text>
          <View style={styles.rankBadge}>
            <Ionicons name={rank.icon as any} size={13} color={rank.color} />
            <Text style={[styles.rankText, { color: rank.color }]}>{rank.label}</Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.matches}</Text>
              <Text style={styles.heroStatLabel}>Partidas</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.correct}</Text>
              <Text style={styles.heroStatLabel}>Acertos</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{accuracy}%</Text>
              <Text style={styles.heroStatLabel}>Precisão</Text>
            </View>
          </View>
        </View>

        {/* ── Destaques ────────────────────────────────────────────── */}
        <View style={styles.highlights}>
          <View style={[styles.highlightCard, styles.highlightStreak]}>
            <Ionicons name="flame" size={22} color="#C05A0A" />
            <Text style={styles.highlightValue}>{stats.maxStreak}</Text>
            <Text style={styles.highlightLabel}>Maior sequência</Text>
          </View>
          <View style={[styles.highlightCard, styles.highlightAch]}>
            <Ionicons name="ribbon" size={22} color={Colors.primary} />
            <Text style={styles.highlightValue}>{doneCount}/{achievements.length}</Text>
            <Text style={styles.highlightLabel}>Conquistas</Text>
          </View>
        </View>

        {/* ── Barra de precisão ────────────────────────────────────── */}
        {stats.matches > 0 && (
          <View style={styles.accuracyCard}>
            <View style={styles.accuracyHeader}>
              <Text style={styles.accuracyTitle}>Precisão geral</Text>
              <Text style={styles.accuracyPct}>{accuracy}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${accuracy}%` }]} />
            </View>
            <Text style={styles.accuracyHint}>
              {accuracy >= 80 ? 'Excelente desempenho! 🏆' : accuracy >= 50 ? 'Bom ritmo, continue assim!' : 'Pratique mais para melhorar!'}
            </Text>
          </View>
        )}

        {/* ── Reset ────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={16} color={Colors.errorText} />
          <Text style={styles.resetText}>Reiniciar progresso</Text>
        </TouchableOpacity>

        {/* ── Conquistas ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CONQUISTAS</Text>
          <Text style={styles.sectionCount}>{doneCount} de {achievements.length}</Text>
        </View>
        <View style={styles.achievements}>
          {achievements.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.achCard, !a.done && styles.achLocked]}
              activeOpacity={0.7}
              onPress={() => setSelected(a)}
            >
              <View style={[styles.achIcon, a.done && styles.achIconDone]}>
                <Ionicons name={a.icon as any} size={20} color={a.done ? Colors.primary : Colors.textSecondary} />
              </View>
              <Text style={[styles.achLabel, !a.done && styles.achLabelLocked]}>{a.label}</Text>
              <Text style={styles.achDesc}>{a.desc}</Text>
              {a.done && (
                <View style={styles.achDonePill}>
                  <Text style={styles.achDoneText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Modal de conquista ───────────────────────────────────── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={() => {}}>

            {/* Ícone grande */}
            <View style={[styles.modalIconWrap, selected?.done ? styles.modalIconDone : styles.modalIconLocked]}>
              <Ionicons
                name={selected?.icon as any}
                size={36}
                color={selected?.done ? Colors.primary : Colors.textSecondary}
              />
            </View>

            {/* Status pill */}
            <View style={[styles.modalStatusPill, selected?.done ? styles.modalStatusDone : styles.modalStatusPending]}>
              <Text style={[styles.modalStatusText, { color: selected?.done ? Colors.primary : Colors.textSecondary }]}>
                {selected?.done ? '✓ Conquistado' : '🔒 Bloqueado'}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{selected?.label}</Text>
            <Text style={styles.modalDesc}>{selected?.desc}</Text>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelected(null)}>
              <Text style={styles.modalCloseBtnText}>Fechar</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, paddingBottom: 40 },

  heroCard: { backgroundColor: Colors.dark, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 12 },
  avatarRing: { width: 84, height: 84, borderRadius: 26, borderWidth: 2, borderColor: Colors.primary + '55', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  heroName: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 6 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 20 },
  rankText: { fontSize: 12, fontWeight: '500' },
  heroStats: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.10)', paddingTop: 16, width: '100%' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 22, fontWeight: '600', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  heroStatDivider: { width: 0.5, height: 30, backgroundColor: 'rgba(255,255,255,0.12)' },

  highlights: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  highlightCard: { flex: 1, borderRadius: 14, borderWidth: 0.5, padding: 14, alignItems: 'center', gap: 4 },
  highlightStreak: { backgroundColor: '#FAEEDA', borderColor: '#F0D090' },
  highlightAch: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary + '44' },
  highlightValue: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary },
  highlightLabel: { fontSize: 11, color: Colors.textSecondary },

  accuracyCard: { backgroundColor: Colors.backgroundSecondary, borderRadius: 14, padding: 14, marginBottom: 20 },
  accuracyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  accuracyTitle: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  accuracyPct: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  barBg: { height: 6, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },
  accuracyHint: { fontSize: 11, color: Colors.textSecondary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, letterSpacing: 0.5 },
  sectionCount: { fontSize: 11, color: Colors.textSecondary },

  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  achCard: { width: '47.5%', backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 14, padding: 14, gap: 4, position: 'relative' },
  achLocked: { opacity: 0.6 },
  achIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  achIconDone: { backgroundColor: Colors.primaryLight },
  achLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  achLabelLocked: { color: Colors.textSecondary },
  achDesc: { fontSize: 10, color: Colors.textSecondary, lineHeight: 14 },
  achDonePill: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  achDoneText: { fontSize: 10, color: '#fff', fontWeight: '700' },

  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: 12, marginBottom: 4 },
  resetText: { fontSize: 13, color: Colors.errorText },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  modalIconWrap: {
    width: 80, height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalIconDone:   { backgroundColor: Colors.primaryLight },
  modalIconLocked: { backgroundColor: Colors.backgroundSecondary },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  modalStatusDone:    { backgroundColor: Colors.primaryLight },
  modalStatusPending: { backgroundColor: Colors.backgroundSecondary },
  modalStatusText: { fontSize: 12, fontWeight: '600' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  modalDesc:  { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  modalCloseBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: Colors.dark,
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
  },
  modalCloseBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
