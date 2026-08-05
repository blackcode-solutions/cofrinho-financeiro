import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@/src/theme/tokens';

type Props = {
  name: string;
  size?: number;
  uri?: string | null;
};

export function Avatar({ name, size = 48, uri }: Props) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.34 }]}>{initials || '?'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
});
