import { Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, shadow } from '@/src/theme/tokens';

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
};

export function QuickAction({ icon, label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
    ...shadow.card,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
});
