import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Em breve</Text>
      <Text style={styles.sub}>Categorias e desafios especiais</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 18, fontWeight: '500', color: Colors.textPrimary },
  sub:  { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
});