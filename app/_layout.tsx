import '../global.css';
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/src/providers/AppProviders';
import { CelebrationModal } from '@/src/components/ui';
import { colors } from '@/src/theme/tokens';

export { ErrorBoundary } from 'expo-router';

const SPLASH_GREEN = '#16A34A';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: SPLASH_GREEN } }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="guardar" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="registrar-gasto" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="esperar-24h"
          options={{ animation: 'fade', contentStyle: { backgroundColor: '#14532D' } }}
        />
        <Stack.Screen name="tentacao" options={{ presentation: 'modal' }} />
        <Stack.Screen name="compra/[id]" />
        <Stack.Screen name="missao/[id]" />
        <Stack.Screen name="cidade" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="amigos" />
        <Stack.Screen name="retrospectiva" />
        <Stack.Screen name="settings" />
      </Stack>
      <CelebrationModal />
    </AppProviders>
  );
}
