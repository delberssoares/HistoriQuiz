import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LEVELS = [
  { number: 1, name: 'Iniciante',     difficulty: 'Fácil',   diffStyle: 'easy' },
  { number: 2, name: 'Aprendiz',      difficulty: 'Fácil',   diffStyle: 'easy' },
  { number: 3, name: 'Intermediário', difficulty: 'Médio',   diffStyle: 'med'  },
  { number: 4, name: 'Avançado',      difficulty: 'Médio',   diffStyle: 'med'  },
  { number: 5, name: 'Expert',        difficulty: 'Difícil', diffStyle: 'hard' },
  { number: 6, name: 'Mestre',        difficulty: 'Difícil', diffStyle: 'hard' },
  { number: 7, name: 'Lendário',      difficulty: 'Extremo', diffStyle: 'xtr'  },
  { number: 8, name: 'Imortal',       difficulty: 'Extremo', diffStyle: 'xtr'  },
];

// Níveis 1-3 sempre liberados; a partir do 4, precisa de ≥1 estrela no anterior
const ALWAYS_UNLOCKED = 3;

const diffColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#EAF3DE', text: '#3B6D11' },
  med:  { bg: '#FAEEDA', text: '#854F0B' },
  hard: { bg: '#FAECE7', text: '#993C1D' },
  xtr:  { bg: '#FCEBEB', text: '#A32D2D' },
};

const modeLabel: Record<string, string> = { multiple: 'Com opções', free: 'Sem opções' };
const modeBadge: Record<string, { bg: string; text: string }> = {
  multiple: { bg: Colors.primaryLight, text: '#3C3489' },
  free:     { bg: '#E1F5EE',           text: '#085041' },
};

export default function LevelsScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { getLevelStars } = useGameStore();

  const badge = modeBadge[mode] ?? modeBadge.multiple;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Escolha o nível</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{modeLabel[mode] ?? mode}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {LEVELS.map((lvl) => {
          const diff = diffColors[lvl.diffStyle];
          const stars = getLevelStars(mode ?? 'multiple', lvl.number);
          // Desbloqueado se: dentro dos primeiros ALWAYS_UNLOCKED, ou o anterior tem ≥1 estrela
          const locked =
            lvl.number > ALWAYS_UNLOCKED &&
            getLevelStars(mode ?? 'multiple', lvl.number - 1) === 0;

          return (
            <TouchableOpacity
              key={lvl.number}
              style={[styles.card, locked && styles.cardLocked]}
              activeOpacity={locked ? 1 : 0.7}
              onPress={() => {
                if (!locked) router.push(`/game?mode=${mode}&level=${lvl.number}`);
              }}
            >
              <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                <Text style={[styles.diffText, { color: diff.text }]}>{lvl.difficulty}</Text>
              </View>
              <Text style={styles.lvlNumber}>{lvl.number}</Text>
              <Text style={styles.lvlName}>{lvl.name}</Text>
              <Text style={styles.stars}>
                {locked
                  ? '🔒'
                  : [1, 2, 3].map((i) => (i <= stars ? '★' : '☆')).join('')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  backBtn: { width: 34, height: 34, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  topbarTitle: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 32 },
  card: { width: '47.5%', backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 16, padding: 14, position: 'relative' },
  cardLocked: { opacity: 0.4 },
  diffBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  diffText: { fontSize: 10, fontWeight: '500' },
  lvlNumber: { fontSize: 26, fontWeight: '500', color: Colors.textPrimary },
  lvlName:   { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  stars:     { fontSize: 13, marginTop: 6, letterSpacing: 1, color: Colors.primary },
});
