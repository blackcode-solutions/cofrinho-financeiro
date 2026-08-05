import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { supabase, isSupabaseConfigured } from '@/src/services/supabase';
import { api } from '@/src/services/api';
import { storage } from '@/src/services/storage';
import { useAuthStore, useUiStore } from '@/src/store';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ fade: true, duration: 400 });

const SPLASH_GREEN = '#16A34A';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AuthBootstrap({ children }: PropsWithChildren) {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setOnboardingSeen = useUiStore((s) => s.setOnboardingSeen);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      await storage.hydrate();

      // Redesign do carrossel: limpa flag antiga e, uma vez, força reexibir o onboarding
      storage.delete('onboarding_seen');
      const redesignReset = 'onboarding_redesign_reset_v1';
      if (storage.getString(redesignReset) !== '1') {
        storage.delete('onboarding_seen_v2');
        storage.set(redesignReset, '1');
        setOnboardingSeen(false);
        try {
          await api.signOut();
        } catch {
          // ignore
        }
        if (!mounted) return;
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const seen = storage.getString('onboarding_seen_v2');
      if (seen === '1') setOnboardingSeen(true);

      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (!mounted) return;
          setSession(data.session);
          if (data.session?.user) {
            const profile = await api.getProfile(data.session.user.id);
            if (profile) {
              const touched = await api.touchStreak(profile.id);
              setProfile(touched);
            }
          }
        } else {
          const local = await api.getLocalSession();
          if (local) {
            setSession({
              access_token: 'local',
              refresh_token: 'local',
              expires_in: 999999,
              token_type: 'bearer',
              user: { id: local.userId, email: local.email } as never,
            } as never);
            const profile = await api.getProfile(local.userId);
            if (profile) {
              const touched = await api.touchStreak(profile.id);
              setProfile(touched);
            }
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();

    if (isSupabaseConfigured) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const profile = await api.getProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
      });
      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [setLoading, setOnboardingSeen, setProfile, setSession]);

  return <>{children}</>;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setReady(true);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!ready) return;
    // Hide after the first branded frame can paint (avoids a blank/Expo flash).
    const frame = requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch(() => undefined);
    });
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: SPLASH_GREEN }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <AuthBootstrap>{children}</AuthBootstrap>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
