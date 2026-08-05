import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Screen, MissionCard, Chip, EmptyState, Button } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { api } from '@/src/services/api';

export default function MissoesScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const qc = useQueryClient();

  const { data: missions = [], refetch } = useQuery({
    queryKey: ['missions', profile?.id],
    queryFn: () => api.listUserMissions(profile!.id),
    enabled: !!profile,
  });

  const filtered = useMemo(
    () => missions.filter((m) => (tab === 'active' ? m.status === 'active' : m.status === 'completed')),
    [missions, tab],
  );

  return (
    <Screen title="Desafios" subtitle="Missões diárias, semanais e mensais.">
      <View style={styles.tabs}>
        <Chip label="Ativos" selected={tab === 'active'} onPress={() => setTab('active')} />
        <Chip label="Concluídos" selected={tab === 'completed'} onPress={() => setTab('completed')} />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title={tab === 'active' ? 'Nenhuma missão ativa' : 'Nenhuma concluída ainda'}
          description="Complete ações no app para avançar nas missões."
        />
      ) : (
        filtered.map((item) => (
          <MissionCard
            key={item.id}
            item={item}
            onPress={() =>
              router.push({ pathname: '/missao/[id]', params: { id: item.id } })
            }
          />
        ))
      )}

      {tab === 'active' && filtered[0] ? (
        <Button
          title="Marcar primeira missão como feita"
          variant="outline"
          onPress={async () => {
            if (!profile) return;
            const done = await api.completeMission(filtered[0].id, profile.id);
            await qc.invalidateQueries({ queryKey: ['missions', profile.id] });
            const refreshed = await api.getProfile(profile.id);
            if (refreshed) useAuthStore.getState().setProfile(refreshed);
            showCelebration('Missão concluída!', `+${done.mission?.xp_reward ?? 0} XP`);
            refetch();
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
});
