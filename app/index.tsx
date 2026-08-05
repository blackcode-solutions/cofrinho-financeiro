import { Redirect } from 'expo-router';
import { SplashScreenView } from '@/src/components/SplashScreenView';
import { useAuthStore, useUiStore } from '@/src/store';

export default function Index() {
  const loading = useAuthStore((s) => s.loading);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const onboardingSeen = useUiStore((s) => s.onboardingSeen);

  if (loading) {
    return <SplashScreenView />;
  }

  if (!onboardingSeen && !session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (profile && !profile.onboarding_completed) {
    return <Redirect href="/(onboarding)/setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
