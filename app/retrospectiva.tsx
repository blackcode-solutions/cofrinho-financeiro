import { Text, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { Screen, Card, Button, StatCard } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { formatCurrency } from '@/src/utils/finance';

export default function RetrospectivaScreen() {
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

  const { data: missions = [] } = useQuery({
    queryKey: ['missions', profile?.id],
    queryFn: () => api.listUserMissions(profile!.id),
    enabled: !!profile,
  });

  if (!profile) return null;

  const now = new Date();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

  const monthSavings = savings.filter((s) => new Date(s.transferred_at).getMonth() === month);
  const saved = monthSavings.reduce((s, x) => s + Number(x.amount), 0);
  const avoided = purchases.filter(
    (p) => p.status === 'avoided' && new Date(p.created_at).getMonth() === month,
  );
  const hours =
    Number(profile.salary) > 0
      ? Math.round(avoided.reduce((s, p) => s + Number(p.amount), 0) / (Number(profile.salary) / 160))
      : 0;
  const missionsDone = missions.filter((m) => m.status === 'completed').length;

  return (
    <Screen title={`Retrospectiva · ${monthName}`} subtitle="Seu mês em emoção, não só em números.">
      <Card style={styles.hero}>
        <View style={styles.trophy}>
          <Trophy color="#F59E0B" size={36} />
        </View>
        <Text style={styles.heroTitle}>Você cresceu este mês</Text>
        <Text style={styles.heroBody}>
          Continuar abrindo o Cofrinho todo dia é metade da vitória.
        </Text>
      </Card>

      <View style={styles.row}>
        <StatCard label="Compras evitadas" value={String(avoided.length)} />
        <StatCard label="Guardado" value={formatCurrency(saved)} />
      </View>
      <View style={styles.row}>
        <StatCard label="Horas da vida" value={`${hours}h`} hint="economizadas" />
        <StatCard label="Missões" value={String(missionsDone)} />
      </View>

      <Card>
        <Text style={styles.line}>Nível atual: {profile.level}</Text>
        <Text style={styles.line}>Sequência: {profile.streak_days} dias</Text>
        <Text style={styles.line}>Estágio do cofrinho: {profile.pig_stage}</Text>
      </Card>

      <Button title="Compartilhar (em breve)" variant="outline" onPress={() => {}} />
      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8 },
  trophy: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  heroBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  row: { flexDirection: 'row', gap: 12 },
  line: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
});
