import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, radius, shadow } from '@/src/theme/tokens';

type Props = ViewProps & {
  padded?: boolean;
  tone?: 'default' | 'primary' | 'dark';
};

export function Card({ children, style, padded = true, tone = 'default', ...rest }: Props) {
  const bg =
    tone === 'primary' ? colors.primary : tone === 'dark' ? '#14532D' : colors.card;
  return (
    <View
      style={[
        styles.card,
        shadow.card,
        { backgroundColor: bg, padding: padded ? 20 : 0 },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
});
