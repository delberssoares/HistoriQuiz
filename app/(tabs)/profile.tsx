import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { stats, accuracy } = useGameStore();

  const achievements = [
    {
      icon: 'trophy-outline',
      label: 'Primeira vitória',
      done: stats.matches >= 1,
    },
    {
      icon: 'flame-outline',
      label: 'Sequência de 5',
      done: stats.maxStreak >= 5,
    },
    {
      icon: 'star-outline',
      label: '10 acertos',
      done: stats.correct >= 10,
    },
    {
      icon: 'flash-outline',
      label: '5 partidas',
      done: stats.matches >= 5,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.primaryLight} />
        </View>
        <Text style={styles.name}>Jogador</Text>
        <Text style={styles.sub}>
          {stats.matches === 0 ? 'Nenhuma partida ainda' : `${stats.matches} partida${stats.matches > 1 ? 's' : ''} jogada${stats.matches > 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: String(stats.matches),  label: 'Partidas' },
          { value: String(stats.correct),  label: 'Acertos' },
          { value: `${accuracy}%`,         label: 'Precisão' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Maior sequência */}
      {stats.maxStreak > 0 && (
        <View style={styles.streakBanner}>
          <Ionicons name="flame" size={20} color="#854F0B" />
          <Text style={styles.streakText}>
            Maior sequência: <Text style={{ fontWeight: '600' }}>{stats.maxStreak}</Text> acertos seguidos
          </Text>
        </View>
      )}

      {/* Conquistas */}
      <Text style={styles.sectionLabel}>CONQUISTAS</Text>
      <View style={styles.achievements}>
        {achievements.map((a) => (
          <View key={a.label} style={[styles.achCard, !a.done && styles.achLocked]}>
            <View style={[styles.achIcon, a.done && styles.achIconDone]}>
              <Ionicons
                name={a.icon as any} size={22}
                color={a.done ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <Text style={[styles.achLabel, !a.done && styles.achLabelLocked]}>
              {a.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },

  avatarWrap: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '500', color: Colors.textPrimary },
  sub:  { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '500', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  streakBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FAEEDA', borderRadius: 12, padding: 12, marginBottom: 20,
  },
  streakText: { fontSize: 13, color: '#854F0B' },

  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: Colors.textSecondary,
    letterSpacing: 0.5, marginBottom: 10,
  },
  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achCard: {
    width: '47.5%', backgroundColor: Colors.background,
    borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 8,
  },
  achLocked: { opacity: 0.45 },
  achIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  achIconDone: { backgroundColor: Colors.primaryLight },
  achLabel: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary, textAlign: 'center' },
  achLabelLocked: { color: Colors.textSecondary },
});
