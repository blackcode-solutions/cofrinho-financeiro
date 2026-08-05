import { Stack } from 'expo-router';
import { colors } from '@/src/theme/tokens';

export default function OnboardingGroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  );
}
