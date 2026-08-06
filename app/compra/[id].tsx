import { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { Screen, Card, Button, ProgressBar } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors, spacing, radius } from '@/src/theme/tokens';
import { getCategoryMeta } from '@/src/theme/categoryMeta';
import { formatCurrency, suggestedSaveAmount } from '@/src/utils/finance';

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function CompraDetalheScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = normalizeParam(params.id);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const qc = useQueryClient();
  const [resolving, setResolving] = useState<'bought' | 'avoided' | null>(null);

  const {
    data: purchase,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => api.getPurchase(id!),
    enabled: !!id,
  });

  const confirmPurchase = async () => {
    if (!profile || !id || resolving) return;
    try {
      setResolving('bought');
      await api.resolvePurchase(id, 'bought', profile.id);
      await qc.invalidateQueries({ queryKey: ['purchase', id] });
      await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
      router.back();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao confirmar');
    } finally {
      setResolving(null);
    }
  };

  const cancelPurchase = async () => {
    if (!profile || !id || resolving) return;
    try {
      setResolving('avoided');
      await api.resolvePurchase(id, 'avoided', profile.id);
      const updated = await api.getProfile(profile.id);
      if (updated) setProfile(updated);
      await qc.invalidateQueries({ queryKey: ['purchase', id] });
      await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
      router.back();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao cancelar');
    } finally {
      setResolving(null);
    }
  };

  if (!id) {
    return (
      <Screen backgroundColor={colors.background}>
        <Header />
        <Text style={styles.muted}>Compra inválida.</Text>
        <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (isLoading || !profile) {
    return (
      <Screen backgroundColor={colors.background}>
        <Header />
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}>Carregando detalhes...</Text>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen backgroundColor={colors.background}>
        <Header />
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Não foi possível carregar a compra.'}
          </Text>
          <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (!purchase) {
    return (
      <Screen backgroundColor={colors.background}>
        <Header />
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Compra não encontrada.</Text>
          <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const amount = Number(purchase.amount);
  const monthlyGoal = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  const impactPct = monthlyGoal > 0 ? Math.round((amount / monthlyGoal) * 100) : 0;
  const barProgress = Math.min(100, impactPct);
  const categoryMeta = getCategoryMeta(purchase.category);
  const CategoryIcon = categoryMeta.icon;

  return (
    <Screen backgroundColor={colors.background} scroll={false} style={styles.screen}>
      <Header />

      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.heroCircle}>
            <CategoryIcon size={52} color={categoryMeta.color} strokeWidth={1.75} />
          </View>
          <Text style={styles.heroName}>{purchase.description}</Text>
          <Text style={styles.heroCategory}>{purchase.category}</Text>
        </View>

        <Card style={styles.impactCard}>
          <View style={styles.valorRow}>
            <Text style={styles.valorLabel}>Valor</Text>
            <Text style={styles.valorAmount}>{formatCurrency(amount)}</Text>
          </View>

          <View style={styles.impactBox}>
            <Text style={styles.impactLead}>Esse gasto representa</Text>
            <Text style={styles.impactPct}>{impactPct}%</Text>
            <Text style={styles.impactTail}>da sua meta mensal.</Text>
          </View>

          <ProgressBar progress={barProgress} color={colors.primary} />

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{formatCurrency(amount)}</Text>
            <Text style={styles.progressLabel}>Meta: {formatCurrency(monthlyGoal)}</Text>
          </View>
        </Card>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={confirmPurchase}
            disabled={!!resolving}
            accessibilityRole="button"
            accessibilityLabel="Confirmar compra"
            style={[styles.confirmButton, resolving ? styles.confirmButtonDisabled : null]}
          >
            {resolving === 'bought' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar compra</Text>
            )}
          </TouchableOpacity>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            disabled={!!resolving}
            onPress={cancelPurchase}
            hitSlop={8}
            style={({ pressed }) => [
              styles.cancelLink,
              { opacity: resolving ? 0.5 : pressed ? 0.7 : 1 },
            ]}
          >
            {resolving === 'avoided' ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.cancelLinkText}>Cancelar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        hitSlop={12}
        style={styles.backBtn}
      >
        <ArrowLeft color={colors.text} size={24} />
      </Pressable>
      <Text style={styles.title}>Detalhes da compra</Text>
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 0,
    paddingTop: 8,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  muted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.error,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  heroCategory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  impactCard: {
    padding: 16,
  },
  valorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  valorLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  valorAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  impactBox: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  impactLead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  impactPct: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: colors.primary,
    lineHeight: 48,
    marginVertical: 4,
  },
  impactTail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  actions: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
  confirmButton: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: '#16A34A',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  cancelLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  cancelLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
  },
});
