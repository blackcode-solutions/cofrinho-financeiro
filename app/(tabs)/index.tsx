import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Flame, PiggyBank, ShoppingBag, Sparkles, Building2 } from 'lucide-react-native';
import {
  Screen,
  Card,
  ProgressRing,
  QuickAction,
  Badge,
  AlertBanner,
} from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { formatCurrency, isPayday, suggestedSaveAmount } from '@/src/utils/finance';

export default function HomeScreen() {
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

  const savedTotal = savings.reduce((s, x) => s + Number(x.amount), 0);
  const monthlyGoal = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  const month = new Date().getMonth();
  const monthSaved = savings
    .filter((s) => new Date(s.transferred_at).getMonth() === month)
    .reduce((s, x) => s + Number(x.amount), 0);
  const goalPct = monthlyGoal > 0 ? Math.min(100, Math.round((monthSaved / monthlyGoal) * 100)) : 0;
  const avoidedImpulseDays = purchases.filter((p) => p.status === 'avoided').length;
  const activeMission = missions.find((m) => m.status === 'active');
  const payday = isPayday(profile.payday);

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <Text style={styles.hello}>Olá, {profile.name.split(' ')[0]}!</Text>
          <Text style={styles.sub}>Objetivo: {profile.objective}</Text>
        </View>
        <Badge label={`Nv. ${profile.level}`} />
      </View>

      {payday ? (
        <AlertBanner
          tone="success"
          title="Hoje é dia de guardar"
          body={`Sua meta de hoje: ${formatCurrency(monthlyGoal)}`}
        />
      ) : null}

      <Card tone="primary">
        <Text style={styles.savedLabel}>Dinheiro guardado</Text>
        <Text style={styles.savedValue}>{formatCurrency(savedTotal)}</Text>
        <Text style={styles.savedHint}>Meta mensal {profile.save_goal_pct}% · {formatCurrency(monthlyGoal)}</Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.half}>
          <ProgressRing progress={goalPct} size={100} label="Meta" />
        </Card>
        <Card style={[styles.half, styles.streakCard]}>
          <Flame color="#F59E0B" size={28} />
          <Text style={styles.streakValue}>{profile.streak_days} dias</Text>
          <Text style={styles.streakLabel}>Sequência</Text>
          <Text style={styles.impulse}>{avoidedImpulseDays} impulsos evitados</Text>
        </Card>
      </View>

      {activeMission ? (
        <Card>
          <Text style={styles.section}>Desafio atual</Text>
          <Text style={styles.missionTitle}>{activeMission.mission?.title}</Text>
          <Text style={styles.missionDesc}>{activeMission.mission?.description}</Text>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <QuickAction
          label="Guardar dinheiro"
          icon={<PiggyBank color={colors.primary} size={24} />}
          onPress={() => router.push('/guardar')}
        />
        <QuickAction
          label="Registrar gasto"
          icon={<ShoppingBag color={colors.primary} size={24} />}
          onPress={() => router.push('/registrar-gasto')}
        />
        <QuickAction
          label="Ver desafios"
          icon={<Sparkles color={colors.primary} size={24} />}
          onPress={() => router.push('/(tabs)/missoes')}
        />
        <QuickAction
          label="Cidade"
          icon={<Building2 color={colors.primary} size={24} />}
          onPress={() => router.push('/cidade')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: colors.text,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  savedLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#DCFCE7',
  },
  savedValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#fff',
    marginTop: 6,
  },
  savedHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#BBF7D0',
    marginTop: 6,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1, alignItems: 'center' },
  streakCard: { justifyContent: 'center', gap: 4 },
  streakValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.text,
  },
  streakLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  impulse: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  section: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.muted,
  },
  missionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: colors.text,
    marginTop: 4,
  },
  missionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
});
