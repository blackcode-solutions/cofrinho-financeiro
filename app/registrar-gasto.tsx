import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Clock, Zap } from 'lucide-react-native';
import { Screen, Input, Button, Card, Chip } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { categories, colors } from '@/src/theme/tokens';
import { parseCurrencyInput } from '@/src/utils/finance';
import type { PurchaseDecision } from '@/src/types';

export default function RegistrarGastoScreen() {
  const profile = useAuthStore((s) => s.profile);
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Outros');
  const [step, setStep] = useState<'form' | 'friction'>('form');
  const [loading, setLoading] = useState(false);

  const goFriction = () => {
    if (parseCurrencyInput(amount) <= 0 || !description.trim()) {
      Alert.alert('Preencha valor e descrição');
      return;
    }
    setStep('friction');
  };

  const decide = async (decision: PurchaseDecision) => {
    if (!profile) return;
    try {
      setLoading(true);
      const purchase = await api.createPurchase(profile.id, {
        amount: parseCurrencyInput(amount),
        description: description.trim(),
        category,
        decision,
      });
      await qc.invalidateQueries({ queryKey: ['purchases', profile.id] });

      if (decision === 'wait') {
        router.replace({ pathname: '/esperar-24h', params: { id: purchase.id } });
        return;
      }
      router.replace({ pathname: '/compra/[id]', params: { id: purchase.id } });
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'friction') {
    return (
      <Screen title="Você realmente precisa disso?" subtitle="Respire. Escolha com consciência.">
        <Card>
          <Text style={styles.summary}>{description}</Text>
          <Text style={styles.amount}>R$ {amount}</Text>
          <Text style={styles.cat}>{category}</Text>
        </Card>

        <Decision
          icon={<Check color={colors.primary} size={22} />}
          title="Preciso"
          body="É necessário agora"
          onPress={() => decide('need')}
        />
        <Decision
          icon={<Clock color="#2563EB" size={22} />}
          title="Posso esperar"
          body="Ativar contador de 24h"
          onPress={() => decide('wait')}
        />
        <Decision
          icon={<Zap color={colors.warning} size={22} />}
          title="Foi impulso"
          body="Registrar e refletir"
          onPress={() => decide('impulse')}
        />
        <Button title="Voltar" variant="ghost" disabled={loading} onPress={() => setStep('form')} />
      </Screen>
    );
  }

  return (
    <Screen title="Registrar gasto" subtitle="Antes de gastar, pense.">
      <Input
        label="Valor"
        keyboardType="decimal-pad"
        placeholder="0,00"
        value={amount}
        onChangeText={setAmount}
      />
      <Input
        label="Descrição"
        placeholder="Ex: Tênis novo"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.chips}>
        {categories.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      <Button title="Continuar" onPress={goFriction} />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

function Decision({
  icon,
  title,
  body,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.decision}>
      <View style={styles.decisionIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.decisionTitle}>{title}</Text>
        <Text style={styles.decisionBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summary: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  amount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.primary,
    marginTop: 6,
  },
  cat: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  decision: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  decisionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  decisionBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
