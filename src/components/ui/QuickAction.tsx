import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, shadow } from '@/src/theme/tokens';

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
};

export function QuickAction({ icon, label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
});
