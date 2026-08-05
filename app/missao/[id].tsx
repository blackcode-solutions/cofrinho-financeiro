import { Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Button, ProgressBar, Badge } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';

export default function MissaoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const qc = useQueryClient();

  const { data: missions = [] } = useQuery({
    queryKey: ['missions', profile?.id],
    queryFn: () => api.listUserMissions(profile!.id),
    enabled: !!profile,
  });

  const item = missions.find((m) => m.id === id);
  if (!item || !profile) {
    return (
      <Screen title="Missão">
        <Text style={{ color: colors.muted }}>Missão não encontrada</Text>
      </Screen>
    );
  }

  const mission = item.mission;
  const target = mission?.target_value ?? 1;
  const pct = Math.min(100, Math.round((item.progress / target) * 100));

  return (
    <Screen title="Missão da semana" subtitle={mission?.title}>
      <Card>
        <View style={styles.row}>
          <Badge label={`+${mission?.xp_reward ?? 0} XP`} />
          <Badge
            label={item.status === 'completed' ? 'Concluída' : 'Ativa'}
            tone={item.status === 'completed' ? 'success' : 'default'}
          />
        </View>
        <Text style={styles.desc}>{mission?.description}</Text>
        <Text style={styles.progressLabel}>
          {item.progress}/{target} dias
        </Text>
        <ProgressBar progress={pct} />
      </Card>

      {item.status === 'active' ? (
        <Button
          title="Concluir missão"
          onPress={async () => {
            const done = await api.completeMission(item.id, profile.id);
            const updated = await api.getProfile(profile.id);
            if (updated) setProfile(updated);
            await qc.invalidateQueries({ queryKey: ['missions', profile.id] });
            showCelebration('Missão completa!', `+${done.mission?.xp_reward ?? 0} XP conquistados`);
            router.back();
          }}
        />
      ) : null}
      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
  },
  progressLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
});
