import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '@/src/theme/tokens';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'outlinePrimary'
  | 'outlineLight';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const stylesFor: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: '#fff' },
  secondary: { bg: colors.primaryLight, text: '#fff' },
  ghost: { bg: 'transparent', text: colors.primary },
  danger: { bg: colors.error, text: '#fff' },
  outline: { bg: 'transparent', text: colors.text, border: colors.border },
  outlinePrimary: { bg: colors.card, text: colors.primary, border: colors.primary },
  outlineLight: { bg: 'transparent', text: '#fff', border: '#FFFFFF' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
}: Props) {
  const v = stylesFor[variant];
  const isCapsule = variant === 'outlinePrimary';
  const isSoftPill = variant === 'outlineLight';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        isCapsule && styles.capsule,
        isSoftPill && styles.pillSoft,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1.5 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text
          style={[styles.text, { color: v.text }, textStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  capsule: {
    borderRadius: radius.full,
    height: 48,
  },
  pillSoft: {
    borderRadius: 16,
    height: 56,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});
