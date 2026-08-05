import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen, Button, CountdownTimer, PigCard } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { api } from '@/src/services/api';
export default function Esperar24hScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const qc = useQueryClient();

  const { data: purchase } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => api.getPurchase(id!),
    enabled: !!id,
  });

  const endsAt =
    purchase?.wait_until ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const stillWant = async () => {
    if (!profile || !id) return;
    Alert.alert('Ainda quer comprar?', 'Você pode esperar mais ou registrar a compra.', [
      {
        text: 'Desistir (evitar)',
        onPress: async () => {
          await api.resolvePurchase(id, 'avoided', profile.id);
          const updated = await api.getProfile(profile.id);
          if (updated) setProfile(updated);
          await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
          showCelebration('Ótima escolha!', 'Você evitou uma compra por impulso.');
          router.replace('/(tabs)');
        },
      },
      {
        text: 'Comprar mesmo assim',
        style: 'destructive',
        onPress: async () => {
          await api.resolvePurchase(id, 'bought', profile.id);
          await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
          router.replace({ pathname: '/compra/[id]', params: { id } });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Screen scroll={false} dark title="Esperar 24h" subtitle="Respire. Pense. Decida depois.">
        <View style={styles.center}>
          <PigCard stage={profile?.pig_stage ?? 'baby'} size={90} />
          <Text style={styles.label}>Tempo restante</Text>
          <CountdownTimer endsAt={endsAt} large />
          <Text style={styles.body}>
            {purchase
              ? `Sobre: ${purchase.description}`
              : 'Enquanto o timer roda, sua vontade costuma diminuir.'}
          </Text>
        </View>
        <View style={styles.footer}>
          <Button title="Já decidi esperar" onPress={() => router.replace('/(tabs)')} />
          <Button title="Você ainda quer comprar?" variant="outline" onPress={stillWant} />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14532D' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#BBF7D0',
    marginTop: 16,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#DCFCE7',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  footer: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
