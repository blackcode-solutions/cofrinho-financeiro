import { Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, Card, Button, ProgressBar, Badge } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { formatCurrency, suggestedSaveAmount } from '@/src/utils/finance';

export default function CompraDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);

  const { data: purchase } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => api.getPurchase(id!),
    enabled: !!id,
  });

  if (!purchase || !profile) {
    return (
      <Screen title="Compra">
        <Text style={styles.muted}>Carregando...</Text>
      </Screen>
    );
  }

  const monthlyGoal = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  const impact = monthlyGoal > 0 ? Math.round((Number(purchase.amount) / monthlyGoal) * 100) : 0;

  return (
    <Screen title="Detalhes da compra" subtitle={purchase.description}>
      <Card>
        <View style={styles.row}>
          <Text style={styles.price}>{formatCurrency(Number(purchase.amount))}</Text>
          <Badge
            label={
              purchase.status === 'avoided'
                ? 'Evitada'
                : purchase.status === 'waiting'
                  ? 'Esperando'
                  : purchase.decision === 'impulse'
                    ? 'Impulso'
                    : 'Registrada'
            }
            tone={purchase.status === 'avoided' ? 'success' : purchase.decision === 'impulse' ? 'warning' : 'default'}
          />
        </View>
        <Text style={styles.meta}>{purchase.category}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Impacto na meta mensal</Text>
        <Text style={styles.impact}>{impact}% da sua meta</Text>
        <ProgressBar progress={Math.min(100, impact)} color={impact > 30 ? colors.warning : colors.primary} />
        <Text style={styles.hint}>
          Guardar {formatCurrency(Number(purchase.amount))} em vez de gastar acelera seu objetivo: {profile.objective}.
        </Text>
      </Card>

      {purchase.status === 'waiting' ? (
        <Button title="Abrir contador 24h" onPress={() => router.push({ pathname: '/esperar-24h', params: { id } })} />
      ) : null}
      <Button title="Modo Tentação" variant="outline" onPress={() => router.push('/tentacao')} />
      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { fontFamily: 'Inter_400Regular', color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: 'Inter_700Bold', fontSize: 32, color: colors.text },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.muted, marginTop: 8 },
  section: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text },
  impact: { fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.primary, marginVertical: 8 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, marginTop: 10, lineHeight: 20 },
});
