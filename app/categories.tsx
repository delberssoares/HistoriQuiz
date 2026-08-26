import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Category {
  id: string;
  name: string;
  desc: string;
  icon: string;
  ready: boolean;
}

const CATEGORIES: Category[] = [
  { id: 'geral', name: 'Geral', desc: 'Todas as figuras misturadas', icon: 'shuffle-outline', ready: true },
  { id: 'futebol', name: 'Futebol', desc: 'Craques e lendas do futebol', icon: 'football-outline', ready: true },
  { id: 'atletas', name: 'Atletas', desc: 'Ídolos de outros esportes', icon: 'trophy-outline', ready: false },
  { id: 'musica', name: 'Música', desc: 'Cantores e bandas icônicas', icon: 'musical-notes-outline', ready: false },
  { id: 'ciencia', name: 'Ciência', desc: 'Cientistas e inventores', icon: 'flask-outline', ready: false },
  { id: 'politica', name: 'Política', desc: 'Líderes e governantes', icon: 'megaphone-outline', ready: false },
];

const modeLabel: Record<string, string> = { multiple: 'Com opções', free: 'Sem opções' };

export default function CategoriesScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();

  function handlePress(cat: Category) {
    if (!cat.ready) {
      Alert.alert('Em breve', `A categoria "${cat.name}" ainda está em produção.`);
      return;
    }
    router.push(`/levels?mode=${mode}&category=${cat.id}`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Categorias',
          headerRight: () => (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{modeLabel[mode ?? 'multiple']}</Text>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, !cat.ready && styles.cardLocked]}
            activeOpacity={cat.ready ? 0.7 : 1}
            onPress={() => handlePress(cat)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={cat.icon as any} size={26} color={cat.ready ? Colors.primary : Colors.textSecondary} />
            </View>
            <Text style={styles.catName}>{cat.name}</Text>
            <Text style={styles.catDesc}>{cat.desc}</Text>
            {!cat.ready && (
              <View style={styles.soonPill}>
                <Text style={styles.soonText}>Em breve</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 0, paddingBottom: 8 },
  backBtn: { width: 34, height: 34, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  topbarTitle: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
  badge: { backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 32 },
  card: { width: '47.5%', backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 16, padding: 14, position: 'relative', gap: 4 },
  cardLocked: { opacity: 0.5 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  catName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  catDesc: { fontSize: 11, color: Colors.textSecondary },
  soonPill: { position: 'absolute', top: 10, right: 10, backgroundColor: Colors.backgroundSecondary, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  soonText: { fontSize: 9, fontWeight: '500', color: Colors.textSecondary },
});