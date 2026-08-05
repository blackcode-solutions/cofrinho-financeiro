import { Text, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Lightbulb, AlertTriangle, PartyPopper } from 'lucide-react-native';
import { Screen, Card, Button, EmptyState } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { generateInsights } from '@/src/utils/insights';
import type { Insight } from '@/src/types';

const iconFor = (type: Insight['type']) => {
  if (type === 'warning') return <AlertTriangle color={colors.warning} size={22} />;
  if (type === 'celebration') return <PartyPopper color={colors.primary} size={22} />;
  return <Lightbulb color="#2563EB" size={22} />;
};

export default function InsightsScreen() {
  const profile = useAuthStore((s) => s.profile);

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', profile?.id],
    queryFn: () => api.listPurchases(profile!.id),
    enabled: !!profile,
  });

  const { data: savings = [] } = useQuery({
    queryKey: ['savings', profile?.id],
    queryFn: () => api.listSavings(profile!.id),
    enabled: !!profile,
  });

  if (!profile) return null;

  const insights = generateInsights(purchases, savings, profile.streak_days);

  return (
    <Screen title="Insights" subtitle="Sugestões baseadas no seu comportamento.">
      {insights.length === 0 ? (
        <EmptyState title="Sem insights ainda" description="Use o app por alguns dias." />
      ) : (
        insights.map((insight) => (
          <Card key={insight.id}>
            <View style={styles.row}>
              <View style={styles.icon}>{iconFor(insight.type)}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{insight.title}</Text>
                <Text style={styles.body}>{insight.body}</Text>
              </View>
            </View>
          </Card>
        ))
      )}
      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 20,
  },
});
