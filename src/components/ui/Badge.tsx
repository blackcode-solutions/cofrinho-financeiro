import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'error' | 'primary';
};

const tones = {
  default: { bg: '#F3F4F6', text: colors.text },
  success: { bg: '#DCFCE7', text: colors.primary },
  warning: { bg: '#FEF3C7', text: '#B45309' },
  error: { bg: '#FEE2E2', text: colors.error },
  primary: { bg: '#DCFCE7', text: colors.primary },
};

export function Badge({ label, tone = 'primary' }: Props) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});
