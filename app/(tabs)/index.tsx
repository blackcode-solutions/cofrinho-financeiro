import { Card, ProgressRing, QuickAction, Screen } from '@/src/components/ui';
import { useSavings } from '@/src/hooks/useFinanceData';
import { useAuthStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';
import { formatCurrency, suggestedSaveAmount } from '@/src/utils/finance';
import { router } from 'expo-router';
import { Bell, Eye, EyeOff, Flame, PiggyBank, Receipt } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { data: savings = [] } = useSavings();
  const [balanceVisible, setBalanceVisible] = useState(true);

  if (!profile) return null;

  const savedTotal = savings.reduce((s, x) => s + Number(x.amount), 0);
  const monthlyGoal = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  const now = new Date();
  const monthSaved = savings
    .filter((s) => {
      const d = new Date(s.transferred_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, x) => s + Number(x.amount), 0);
  const goalPct = monthlyGoal > 0 ? Math.min(100, Math.round((monthSaved / monthlyGoal) * 100)) : 0;
  const remaining = Math.max(0, monthlyGoal - monthSaved);
  const firstName = profile.name.split(' ')[0];

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.topText}>
          <Text style={styles.hello}>Olá, {firstName}!</Text>
          <Text style={styles.sub}>Foco hoje, liberdade sempre.</Text>
        </View>
        <Pressable hitSlop={12} accessibilityLabel="Notificações">
          <Bell color={colors.text} size={24} />
        </Pressable>
      </View>

      <Card tone="primary">
        <View style={styles.balanceHeader}>
          <Text style={styles.savedLabel}>Dinheiro guardado</Text>
          <Pressable
            onPress={() => setBalanceVisible((v) => !v)}
            hitSlop={12}
            accessibilityLabel={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {balanceVisible ? (
              <Eye color="#fff" size={22} />
            ) : (
              <EyeOff color="#fff" size={22} />
            )}
          </Pressable>
        </View>
        <Text style={styles.savedValue}>
          {balanceVisible ? formatCurrency(savedTotal) : 'R$ ••••••'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.goalTitle}>Meta mensal</Text>
        <View style={styles.goalRow}>
          <ProgressRing progress={goalPct} size={100} />
          <View style={styles.goalStats}>
            <View>
              <Text style={styles.goalStatLabel}>Meta</Text>
              <Text style={styles.goalStatValue}>{formatCurrency(monthlyGoal)}</Text>
            </View>
            <View>
              <Text style={styles.goalStatLabel}>Faltam</Text>
              <Text style={styles.goalStatValueBold}>{formatCurrency(remaining)}</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.streakCard}>
        <Flame color="#F59E0B" size={28} />
        <View style={styles.streakText}>
          <Text style={styles.streakValue}>{profile.streak_days} dias</Text>
          <Text style={styles.streakLabel}>Sem compras por impulso</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <QuickAction
          label="Guardar dinheiro"
          icon={<PiggyBank color={colors.primary} size={36} />}
          onPress={() => router.push('/guardar')}
        />
        <QuickAction
          label="Registrar gasto"
          icon={<Receipt color={colors.error} size={36} />}
          onPress={() => router.push('/registrar-gasto')}
        />
        {/* <QuickAction
          label="Ver desafios"
          icon={<Package color={colors.primary} size={28} />}
          onPress={() => router.push('/(tabs)/missoes')}
        /> */}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topText: {
    flex: 1,
    paddingRight: 12,
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
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  goalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: colors.text,
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  goalStats: {
    flex: 1,
    gap: 16,
  },
  goalStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  goalStatValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: colors.text,
    marginTop: 2,
  },
  goalStatValueBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.text,
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakText: {
    flex: 1,
    gap: 2,
  },
  streakValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.text,
  },
  streakLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
});
