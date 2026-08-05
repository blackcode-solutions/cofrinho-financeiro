import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Award } from 'lucide-react-native';
import { Button } from './Button';
import { colors } from '@/src/theme/tokens';
import { useUiStore } from '@/src/store';

export function CelebrationModal() {
  const celebration = useUiStore((s) => s.celebration);
  const hide = useUiStore((s) => s.hideCelebration);

  return (
    <Modal visible={!!celebration} transparent animationType="fade" onRequestClose={hide}>
      <Pressable style={styles.backdrop} onPress={hide}>
        <View style={styles.sheet}>
          <View style={styles.icon}>
            <Award color="#F59E0B" size={40} />
          </View>
          <Text style={styles.title}>{celebration?.title}</Text>
          <Text style={styles.subtitle}>{celebration?.subtitle}</Text>
          <Button title="Continuar" onPress={hide} style={{ marginTop: 8, width: '100%' }} />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
