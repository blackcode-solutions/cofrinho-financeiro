import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = {
  title: string;
  body?: string;
  tone?: 'info' | 'warning' | 'error' | 'success';
};

const map = {
  info: { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309' },
  error: { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C' },
  success: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
};

export function AlertBanner({ title, body, tone = 'info' }: Props) {
  const t = map[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: t.text }]}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});
