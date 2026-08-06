import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Timer, PieChart, Package } from 'lucide-react-native';
import { Screen, Input, Button, Card } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { colors, spacing, radius } from '@/src/theme/tokens';
import {
  calculateTemptation,
  formatCurrency,
  parseCurrencyInput,
  suggestedSaveAmount,
} from '@/src/utils/finance';

const BLUE = '#2563EB';
const GREEN_SOFT = '#DCFCE7';
const RED_SOFT = '#FEE2E2';
const BLUE_SOFT = '#DBEAFE';

export default function TentacaoScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const [product, setProduct] = useState('');
  const [value, setValue] = useState('');
  const [showResult, setShowResult] = useState(false);

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

  if (!profile) {
    return (
      <Screen backgroundColor={colors.card}>
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
      <Screen backgroundColor={colors.card}>
        <Header onBack={handleBack} />

        <Card style={styles.productCard}>
          <View style={styles.productImage}>
            <Package color={colors.muted} size={28} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
            <Text style={styles.productPrice}>{formatCurrency(amount)}</Text>
          </View>
        </Card>

        <InsightCard
          icon={<Clock color={colors.primary} size={22} />}
          iconBg={GREEN_SOFT}
          lines={[
            { text: 'Você trabalha' },
            { text: `${result.hoursWorked} horas`, emphasize: true, color: colors.primary },
            { text: 'para pagar isso' },
          ]}
        />

        <InsightCard
          icon={<Timer color={colors.error} size={22} />}
          iconBg={RED_SOFT}
          lines={[
            { text: 'Atrasará sua meta em' },
            { text: `${result.daysDelay} dias`, emphasize: true, color: colors.error },
          ]}
        />

        <InsightCard
          icon={<PieChart color={BLUE} size={22} />}
          iconBg={BLUE_SOFT}
          lines={[
            { text: 'Representa' },
            { text: `${result.carDownPaymentPercent}%`, emphasize: true, color: BLUE },
            { text: 'da entrada do seu carro' },
          ]}
        />

        <View style={styles.footer}>
          <Text style={styles.footerQuestion}>Ainda assim, deseja comprar?</Text>

          <View style={styles.ctaRow}>
            <Button
              title="Esperar 24h"
              variant="ghost"
              style={styles.ctaButtonOutline}
              onPress={() => {
                showCelebration('Boa pausa', 'Volte amanhã com a cabeça mais fria.');
                router.replace('/esperar-24h');
              }}
            />
            <Button
              title="Comprar mesmo assim"
              variant="primary"
              style={styles.ctaButton}
              onPress={() => {
                Alert.alert('Registrado', 'Tudo bem — o importante é ter pensado antes.');
                router.back();
              }}
            />
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
    <Screen backgroundColor={colors.card}>
      <Header onBack={handleBack} />
      <Input label="Produto" placeholder="Ex: PS5" value={product} onChangeText={setProduct} />
      <Input
        label="Valor"
        keyboardType="decimal-pad"
        placeholder="4500"
        value={value}
        onChangeText={setValue}
      />
      <Button
        title="Calcular"
        onPress={() => {
          if (parseCurrencyInput(value) <= 0) {
            Alert.alert('Informe um valor');
            return;
          }
          setShowResult(true);
        }}
      />
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
  icon: React.ReactNode;
  iconBg: string;
  lines: { text: string; emphasize?: boolean; color?: string }[];
}) {
  return (
    <Card style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.insightText}>
        {lines.map((line) => (
          <Text
            key={line.text}
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
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
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
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
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
    marginTop: spacing.sm,
    gap: spacing.md,
    alignItems: 'center',
  },
  footerQuestion: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  ctaButton: {
    flex: 1,
    width: 'auto',
    alignSelf: 'stretch',
    paddingHorizontal: 12,
  },
  ctaButtonOutline: {
    flex: 1,
    width: 'auto',
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  alternativesLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
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
