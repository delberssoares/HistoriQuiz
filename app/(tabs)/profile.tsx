import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const achievements = [
  { icon: 'trophy-outline',     label: 'Primeira vitória',    done: false },
  { icon: 'flame-outline',      label: 'Sequência de 5',      done: false },
  { icon: 'star-outline',       label: '3 estrelas em nível', done: false },
  { icon: 'flash-outline',      label: 'Resposta rápida',     done: false },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.primaryLight} />
        </View>
        <Text style={styles.name}>Jogador</Text>
        <Text style={styles.sub}>Nível 1 · Iniciante</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: '0', label: 'Partidas' },
          { value: '0', label: 'Acertos' },
          { value: '0%', label: 'Precisão' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

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
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '500', color: Colors.textPrimary },
  sub:  { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '500', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

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