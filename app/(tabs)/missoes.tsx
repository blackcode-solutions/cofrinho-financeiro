import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Screen, MissionCard, SegmentedControl, EmptyState } from '@/src/components/ui';
import { useMissions } from '@/src/hooks/useFinanceData';
import { colors } from '@/src/theme/tokens';

const TABS = [
  { value: 'active' as const, label: 'Ativos' },
  { value: 'completed' as const, label: 'Concluídos' },
];

export default function MissoesScreen() {
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const { data: missions = [], isLoading } = useMissions();

  const filtered = useMemo(
    () => missions.filter((m) => (tab === 'active' ? m.status === 'active' : m.status === 'completed')),
    [missions, tab],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={handleBack}
          hitSlop={12}
          style={styles.backBtn}
        >
          <ArrowLeft color={colors.text} size={24} />
        </Pressable>
        <Text style={styles.title}>Desafios</Text>
        <View style={styles.backBtn} />
      </View>

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={tab === 'active' ? 'Nenhuma missão ativa' : 'Nenhuma concluída ainda'}
          description="Complete ações no app para avançar nas missões."
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((item) => (
            <MissionCard
              key={item.id}
              item={item}
              onPress={() =>
                router.push({ pathname: '/missao/[id]', params: { id: item.id } })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  list: {
    gap: 12,
  },
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
