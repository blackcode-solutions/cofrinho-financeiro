import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors } from '@/src/theme/tokens';

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
};

export function StatCard({ label, value, hint, icon }: Props) {
  return (
    <Card style={styles.card}>
      {icon}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6, flex: 1, minWidth: 140 },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  value: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.text,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.primary,
  },
});
