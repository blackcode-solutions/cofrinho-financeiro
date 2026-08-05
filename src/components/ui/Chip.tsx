import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : '#fff',
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: selected ? '#fff' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
