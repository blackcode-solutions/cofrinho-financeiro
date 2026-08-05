import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius } from '@/src/theme/tokens';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.error,
  },
});
