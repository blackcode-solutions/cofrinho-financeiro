import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/tokens';

export function SocialDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>ou continue com</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
});
