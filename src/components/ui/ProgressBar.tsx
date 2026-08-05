import { View, StyleSheet } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = {
  progress: number;
  color?: string;
  height?: number;
  segments?: { color: string; until: number }[];
};

export function ProgressBar({ progress, color = colors.primary, height = 10, segments }: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const fillColor = segments
    ? segments.find((s) => clamped <= s.until)?.color ?? segments[segments.length - 1].color
    : color;

  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: fillColor,
            height,
            borderRadius: height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    borderRadius: radius.full,
  },
  fill: {
    borderRadius: radius.full,
  },
});
