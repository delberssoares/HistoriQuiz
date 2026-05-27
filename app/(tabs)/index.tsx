import { Colors } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const modes = [
  { id: 'multiple', name: 'Com opções', desc: 'Escolha entre 4 alternativas', icon: 'list-outline', iconBg: Colors.primaryLight, iconColor: Colors.primary },
  { id: 'free', name: 'Sem opções', desc: 'Digite o nome da figura histórica', icon: 'create-outline', iconBg: '#E1F5EE', iconColor: '#0F6E56' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { stats, accuracy, reload, resetAll } = useGameStore();


  // Recarrega stats toda vez que a aba ganhar foco (ao voltar do jogo)
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

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

  const statCards = [
    { value: String(stats.matches), label: 'Partidas' },
    { value: String(stats.correct), label: 'Acertos' },
    { value: String(stats.streak), label: 'Sequência' },
    { value: `${accuracy}%`, label: 'Precisão' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="business-outline" size={32} color={Colors.primaryLight} />
        </View>
        <Text style={styles.heroTitle}>HistóriQuiz</Text>
        <Text style={styles.heroSub}>Você conhece os grandes da história?</Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>MODOS DE JOGO</Text>
      {modes.map((m) => (
        <TouchableOpacity key={m.id} style={styles.modeBtn} activeOpacity={0.7} onPress={() => router.push(`/levels?mode=${m.id}`)}>
          <View style={[styles.modeIcon, { backgroundColor: m.iconBg }]}>
            <Ionicons name={m.icon as any} size={22} color={m.iconColor} />
          </View>
          <View style={styles.modeText}>
            <Text style={styles.modeName}>{m.name}</Text>
            <Text style={styles.modeDesc}>{m.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Ionicons name="trash-outline" size={16} color={Colors.errorText} />
        <Text style={styles.resetText}>Reiniciar progresso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  hero: { backgroundColor: Colors.dark, borderRadius: 16, padding: 28, alignItems: 'center', marginBottom: 12 },
  heroIcon: { width: 64, height: 64, backgroundColor: Colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '500', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.backgroundSecondary, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '500', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 16, padding: 14, marginBottom: 8 },
  modeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modeText: { flex: 1 },
  modeName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  modeDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    padding: 12,
  },
  resetText: {
    fontSize: 13,
    color: Colors.errorText,
  },
});
