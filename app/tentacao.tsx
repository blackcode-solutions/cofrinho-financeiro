import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Clock, Target, Car } from 'lucide-react-native';
import { Screen, Input, Button, Card } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';
import {
  calculateTemptation,
  formatCurrency,
  parseCurrencyInput,
  suggestedSaveAmount,
} from '@/src/utils/finance';

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

  if (!profile) return null;

  if (showResult && result) {
    return (
      <Screen title="Modo Tentação" subtitle="Ainda vale a pena?">
        <Card tone="primary">
          <Text style={styles.product}>{product || 'Produto'}</Text>
          <Text style={styles.price}>{formatCurrency(parseCurrencyInput(value))}</Text>
        </Card>

        <Card>
          <Row icon={<Clock color={colors.primary} size={20} />} label="Horas de trabalho" value={`${result.hoursWorked}h`} />
          <Row icon={<Target color={colors.warning} size={20} />} label="Da meta mensal" value={`${result.goalPercent}%`} />
          <Row icon={<Clock color={colors.error} size={20} />} label="Atraso na meta" value={`${result.daysDelay} dias`} />
          <Row icon={<Car color="#2563EB" size={20} />} label="Entrada de um carro" value={`${result.carDownPaymentPercent}%`} />
        </Card>

        <Button
          title="Esperar 24h"
          onPress={() => {
            showCelebration('Boa pausa', 'Volte amanhã com a cabeça mais fria.');
            router.replace('/esperar-24h');
          }}
        />
        <Button
          title="Comprar mesmo assim"
          variant="danger"
          onPress={() => {
            Alert.alert('Registrado', 'Tudo bem — o importante é ter pensado antes.');
            router.back();
          }}
        />
        <Button title="Recalcular" variant="ghost" onPress={() => setShowResult(false)} />
      </Screen>
    );
  }

  return (
    <Screen title="Modo Tentação" subtitle="Transforme o preço em tempo e meta.">
      <Input label="Produto" placeholder="Ex: PS5" value={product} onChangeText={setProduct} />
      <Input
        label="Valor"
        keyboardType="decimal-pad"
        placeholder="4500"
        value={value}
        onChangeText={setValue}
      />
      <Button
        title="Calcular impacto"
        onPress={() => {
          if (parseCurrencyInput(value) <= 0) {
            Alert.alert('Informe um valor');
            return;
          }
          setShowResult(true);
        }}
      />
      <Button title="Fechar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  product: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#DCFCE7',
  },
  price: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#fff',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  value: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.text,
  },
});
