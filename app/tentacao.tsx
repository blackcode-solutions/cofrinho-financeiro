import { useMemo, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Timer, PieChart } from 'lucide-react-native';
import { Screen, Input, Button, Card } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors, spacing, radius, shadow } from '@/src/theme/tokens';
import {
  calculateTemptation,
  formatCurrency,
  parseCurrencyInput,
  suggestedSaveAmount,
} from '@/src/utils/finance';

const PRODUCT_IMAGE = require('../assets/images/product-ps5.png');

function formatCurrencyMask(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (!digits) return '';
  const cents = Number(digits);
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

const CTA_WAIT_STYLE = {
  flex: 1,
  minHeight: 52,
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: '#16A34A',
  backgroundColor: '#FFFFFF',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const CTA_BUY_STYLE = {
  flex: 1,
  minHeight: 52,
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderRadius: 16,
  backgroundColor: '#16A34A',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const CTA_WAIT_TEXT = {
  fontFamily: 'Inter_600SemiBold',
  fontSize: 15,
  color: '#16A34A',
  textAlign: 'center' as const,
};

const CTA_BUY_TEXT = {
  fontFamily: 'Inter_600SemiBold',
  fontSize: 15,
  color: '#FFFFFF',
  textAlign: 'center' as const,
};

export default function TentacaoScreen() {
  const profile = useAuthStore((s) => s.profile);
  const qc = useQueryClient();
  const [product, setProduct] = useState('');
  const [value, setValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const result = useMemo(() => {
    if (!profile) return null;
    const amount = parseCurrencyInput(value);
    const monthlyGoal = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
    const monthlyRate = monthlyGoal;
    return calculateTemptation(amount, Number(profile.salary), monthlyGoal, monthlyRate);
  }, [profile, value]);

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    router.back();
  };

  const onValueChange = (text: string) => {
    setValue(formatCurrencyMask(text));
  };

  const handleWait24h = async () => {
    if (!profile || waiting) return;
    const amount = parseCurrencyInput(value);
    if (amount <= 0) {
      Alert.alert('Informe um valor');
      return;
    }
    try {
      setWaiting(true);
      const purchase = await api.createPurchase(profile.id, {
        amount,
        description: product.trim() || 'Produto',
        category: 'Outros',
        decision: 'wait',
      });
      await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });
      router.replace({ pathname: '/esperar-24h', params: { id: purchase.id } });
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar');
    } finally {
      setWaiting(false);
    }
  };

  if (!profile) {
    return (
      <Screen backgroundColor={colors.card} edges={['top', 'left', 'right', 'bottom']}>
        <Header onBack={() => router.back()} />
        <Card>
          <Text style={styles.emptyTitle}>Perfil não encontrado</Text>
          <Text style={styles.emptyBody}>
            Complete o cadastro para calcular o impacto da compra.
          </Text>
          <Button title="Voltar" variant="outline" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  if (showResult && result) {
    const amount = parseCurrencyInput(value);
    const productName = product.trim() || 'Produto';

    return (
      <Screen
        backgroundColor={colors.card}
        scroll={false}
        edges={['top', 'left', 'right', 'bottom']}
        style={styles.resultScreen}
      >
        <Header onBack={handleBack} />

        <View style={styles.resultBody}>
          <View style={[styles.surfaceCard, styles.productCard]}>
            <View style={styles.productImage}>
              <Image source={PRODUCT_IMAGE} style={styles.productPhoto} resizeMode="cover" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {productName}
              </Text>
              <Text style={styles.productPrice}>{formatCurrency(amount)}</Text>
            </View>
          </View>

          <InsightCard
            icon={<Clock color={colors.primary} size={22} />}
            iconBg={colors.successSoft}
            lines={[
              { text: 'Você trabalha' },
              { text: `${result.hoursWorked} horas`, emphasize: true, color: colors.primary },
              { text: 'para pagar isso' },
            ]}
          />

          <InsightCard
            icon={<Timer color={colors.error} size={22} />}
            iconBg={colors.errorSoft}
            lines={[
              { text: 'Atrasará sua meta em' },
              { text: `${result.daysDelay} dias`, emphasize: true, color: colors.error },
            ]}
          />

          <InsightCard
            icon={<PieChart color={colors.info} size={22} />}
            iconBg={colors.infoSoft}
            lines={[
              { text: 'Representa' },
              {
                text: `${result.carDownPaymentPercent}%`,
                emphasize: true,
                color: colors.info,
              },
              { text: 'da entrada do seu carro' },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerQuestion}>Ainda assim, deseja comprar?</Text>

          <View style={[styles.ctaRow, waiting && styles.ctaRowDisabled]}>
            <View style={CTA_WAIT_STYLE}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Esperar 24h"
                activeOpacity={0.85}
                disabled={waiting}
                style={styles.ctaHit}
                onPress={() => {
                  void handleWait24h();
                }}
              >
                {waiting ? (
                  <ActivityIndicator color="#16A34A" />
                ) : (
                  <Text style={CTA_WAIT_TEXT}>Esperar 24h</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={CTA_BUY_STYLE}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                disabled={waiting}
                style={styles.ctaHit}
                onPress={() => {
                  Alert.alert('Registrado', 'Tudo bem — o importante é ter pensado antes.');
                  router.back();
                }}
              >
                <Text style={CTA_BUY_TEXT} numberOfLines={1}>
                  Comprar mesmo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            accessibilityRole="link"
            onPress={() =>
              Alert.alert('Em breve', 'Alternativas para esta compra estarão disponíveis em breve.')
            }
            hitSlop={8}
          >
            <Text style={styles.alternativesLink}>Ver alternativas</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={colors.card} edges={['top', 'left', 'right', 'bottom']}>
      <Header onBack={handleBack} />
      <Input label="Produto" placeholder="Ex: PS5" value={product} onChangeText={setProduct} />
      <Input
        label="Valor"
        keyboardType="decimal-pad"
        placeholder="R$ 0,00"
        value={value}
        onChangeText={onValueChange}
      />
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.9}
        onPress={() => {
          if (parseCurrencyInput(value) <= 0) {
            Alert.alert('Informe um valor');
            return;
          }
          setShowResult(true);
        }}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Calcular</Text>
      </TouchableOpacity>
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        hitSlop={12}
        style={styles.backBtn}
      >
        <ArrowLeft color={colors.text} size={24} />
      </Pressable>
      <View style={styles.headerText}>
        <Text style={styles.title}>Modo Tentação</Text>
        <Text style={styles.subtitle}>Quanto custa?</Text>
      </View>
      <View style={styles.backBtn} />
    </View>
  );
}

function InsightCard({
  icon,
  iconBg,
  lines,
}: {
  icon: ReactNode;
  iconBg: string;
  lines: { text: string; emphasize?: boolean; color?: string }[];
}) {
  return (
    <View style={[styles.surfaceCard, styles.insightCard]}>
      <View style={[styles.insightIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.insightText}>
        {lines.map((line, index) => (
          <Text
            key={`${index}-${line.text}`}
            style={
              line.emphasize
                ? [styles.insightValue, { color: line.color ?? colors.text }]
                : styles.insightLabel
            }
          >
            {line.text}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultScreen: {
    flex: 1,
    gap: spacing.md,
  },
  resultBody: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  surfaceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productPhoto: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
  },
  insightLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  insightValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    marginVertical: 2,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.md,
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  footerQuestion: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    width: '100%',
  },
  ctaRowDisabled: {
    opacity: 0.55,
  },
  ctaHit: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativesLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  primaryButton: {
    alignSelf: 'stretch',
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.md,
  },
});
