import { View, Text, StyleSheet } from 'react-native';
import { colors, pigStages, type PigStage } from '@/src/theme/tokens';

type Props = {
  stage?: PigStage;
  mood?: 'happy' | 'neutral' | 'sad';
  size?: number;
  label?: boolean;
};

const emoji: Record<PigStage, string> = {
  baby: '🐷',
  golden: '✨🐷',
  giant: '🐖',
  castle: '🏰',
  city: '🏙️',
};

export function PigCard({ stage = 'baby', mood = 'happy', size = 96, label }: Props) {
  const meta = pigStages.find((s) => s.id === stage);
  const scale = mood === 'happy' ? 1 : mood === 'sad' ? 0.92 : 0.96;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.42 }}>{emoji[stage]}</Text>
      </View>
      {label ? <Text style={styles.label}>{meta?.label ?? 'Cofrinho'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  bubble: {
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.muted,
  },
});
