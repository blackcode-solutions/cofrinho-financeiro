import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Button, PigCard } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { formatCurrency, isPayday, suggestedSaveAmount } from '@/src/utils/finance';

export default function GuardarScreen() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const amount = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  const payday = isPayday(profile.payday);

  const confirm = async () => {
    try {
      setLoading(true);
      await api.addSaving(profile.id, amount, 'Depósito mensal');
      const updated = await api.getProfile(profile.id);
      if (updated) setProfile(updated);
      await qc.invalidateQueries({ queryKey: ['savings', profile.id] });
      await qc.invalidateQueries({ queryKey: ['missions', profile.id] });
      showCelebration('Parabéns!', `Você guardou ${formatCurrency(amount)}. O cofrinho sorriu.`);
      router.back();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title={payday ? 'Hoje é dia de guardar' : 'Guardar dinheiro'}
      subtitle="Transfira para sua reserva e confirme aqui."
    >
      <View style={{ alignItems: 'center' }}>
        <PigCard stage={profile.pig_stage} size={110} mood="happy" />
      </View>

      <Card tone="primary" style={{ alignItems: 'center' }}>
        <Text style={styles.hint}>Valor sugerido ({profile.save_goal_pct}% do salário)</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Como transferir</Text>
        <Text style={styles.body}>
          1. Abra o app do seu banco{'\n'}
          2. Transfira {formatCurrency(amount)} para sua conta reserva{'\n'}
          3. Volte e toque em “Já transferi”
        </Text>
      </Card>

      <Button title="Já transferi" loading={loading} onPress={confirm} />
      <Button title="Agora não" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#DCFCE7',
  },
  amount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: '#fff',
    marginTop: 8,
  },
  section: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    lineHeight: 22,
  },
});
