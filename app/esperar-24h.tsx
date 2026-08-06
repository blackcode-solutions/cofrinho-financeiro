import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CountdownTimer } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { api } from '@/src/services/api';
import { radius } from '@/src/theme/tokens';

export default function Esperar24hScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const qc = useQueryClient();
  const [resolving, setResolving] = useState(false);

  const { data: purchase, isLoading } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => api.getPurchase(id!),
    enabled: !!id,
  });

  const endsAt = purchase?.wait_until ?? null;

  const stillWant = useCallback(async () => {
    if (!profile || !id || resolving) return;
    Alert.alert('Ainda quer comprar?', 'Você pode esperar mais ou registrar a compra.', [
      {
        text: 'Desistir (evitar)',
        onPress: async () => {
          try {
            setResolving(true);
            await api.resolvePurchase(id, 'avoided', profile.id);
            const updated = await api.getProfile(profile.id);
            if (updated) setProfile(updated);
            await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
            showCelebration('Ótima escolha!', 'Você evitou uma compra por impulso.');
            router.replace('/(tabs)');
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar');
          } finally {
            setResolving(false);
          }
        },
      },
      {
        text: 'Comprar mesmo assim',
        style: 'destructive',
        onPress: async () => {
          try {
            setResolving(true);
            await api.resolvePurchase(id, 'bought', profile.id);
            await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
            router.replace({ pathname: '/compra/[id]', params: { id } });
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar');
          } finally {
            setResolving(false);
          }
        },
      },
    ]);
  }, [profile, id, resolving, qc, setProfile, showCelebration]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backBtn}
          >
            <ArrowLeft color="#fff" size={24} />
          </Pressable>
        </View>

        <View style={styles.center}>
          <Image
            source={require('../assets/images/esperar-clock-orb.png')}
            style={styles.orb}
            accessibilityLabel="Relógio"
          />

          <Text style={styles.title}>Respire. Pense.</Text>
          <Text style={styles.subtitle}>A decisão pode esperar.</Text>

          <Text style={styles.label}>Tempo restante</Text>

          {isLoading || !endsAt ? (
            <View style={styles.timerPlaceholder}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.placeholderDigits}>--:--:--</Text>
              )}
            </View>
          ) : (
            <CountdownTimer
              endsAt={endsAt}
              large
              showUnits
              onComplete={stillWant}
            />
          )}

          <View style={styles.quoteCard}>
            <Text style={styles.quote}>
              {'Muitas vezes o que parece\nimportante agora, não será\namanhã.'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {/* Mesmo formato do botão verde do onboarding — só que vazado */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace('/(tabs)');
            }}
            accessibilityRole="button"
            accessibilityLabel="Já decidi esperar"
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Já decidi esperar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#14532D',
  },
  safe: {
    flex: 1,
    backgroundColor: '#14532D',
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  orb: {
    width: 112,
    height: 112,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  timerPlaceholder: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderDigits: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
  quoteCard: {
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '100%',
  },
  quote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  // Espelho do botão do onboarding (height 56, radius 16) — fundo transparente + borda branca
  cta: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
