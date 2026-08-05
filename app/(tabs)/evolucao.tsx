import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { CartesianChart, Line, Area } from 'victory-native';
import { Screen, Card, StatCard, Button, ProgressBar } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { formatCurrency } from '@/src/utils/finance';

export default function EvolucaoScreen() {
  const profile = useAuthStore((s) => s.profile);

  const { data: savings = [] } = useQuery({
    queryKey: ['savings', profile?.id],
    queryFn: () => api.listSavings(profile!.id),
    enabled: !!profile,
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', profile?.id],
    queryFn: () => api.listPurchases(profile!.id),
    enabled: !!profile,
  });

  if (!profile) return null;

  const saved = savings.reduce((s, x) => s + Number(x.amount), 0);
  const avoided = purchases.filter((p) => p.status === 'avoided');
  const avoidedSum = avoided.reduce((s, x) => s + Number(x.amount), 0);

  const byMonth: Record<string, number> = {};
  savings.forEach((s) => {
    const d = new Date(s.transferred_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    byMonth[key] = (byMonth[key] ?? 0) + Number(s.amount);
  });

  const chartData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value], i) => ({ x: i + 1, y: value, label: key }));

  if (chartData.length === 0) {
    chartData.push({ x: 1, y: 0, label: 'agora' }, { x: 2, y: saved || 10, label: 'meta' });
  }

  return (
    <Screen title="Evolução" subtitle="Seu progresso em números e emoção.">
      <View style={styles.row}>
        <StatCard label="Guardado" value={formatCurrency(saved)} />
        <StatCard label="Evitado" value={formatCurrency(avoidedSum)} hint={`${avoided.length} compras`} />
      </View>
      <StatCard label="Maior sequência" value={`${profile.streak_days} dias`} hint={`Nível ${profile.level}`} />

      <Card>
        <Text style={styles.chartTitle}>Evolução da economia</Text>
        <View style={{ height: 180, marginTop: 12 }}>
          <CartesianChart data={chartData} xKey="x" yKeys={['y']}>
            {({ points, chartBounds }) => (
              <>
                <Area
                  points={points.y}
                  y0={chartBounds.bottom}
                  color="rgba(22,163,74,0.15)"
                  animate={{ type: 'timing', duration: 600 }}
                />
                <Line
                  points={points.y}
                  color={colors.primary}
                  strokeWidth={3}
                  animate={{ type: 'timing', duration: 600 }}
                />
              </>
            )}
          </CartesianChart>
        </View>
      </Card>

      <Card>
        <Text style={styles.chartTitle}>Progresso de XP</Text>
        <Text style={styles.xp}>
          {profile.xp} XP · Nível {profile.level}
        </Text>
        <ProgressBar progress={(profile.xp % 200) / 2} />
      </Card>

      <Button title="Ver minha cidade" onPress={() => router.push('/cidade')} />
      <Button title="Insights da IA" variant="outline" onPress={() => router.push('/insights')} />
      <Button title="Retrospectiva do mês" variant="ghost" onPress={() => router.push('/retrospectiva')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  chartTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  xp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginVertical: 8,
  },
});
