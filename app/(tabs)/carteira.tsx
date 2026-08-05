import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Input, Button, ProgressBar, AlertBanner, EmptyState } from '@/src/components/ui';
import { useAuthStore, useUiStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { cardStatus, cardUsagePercent, formatCurrency, parseCurrencyInput } from '@/src/utils/finance';

export default function CarteiraScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const qc = useQueryClient();
  const [label, setLabel] = useState('Cartão principal');
  const [limit, setLimit] = useState('');
  const [bill, setBill] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', profile?.id],
    queryFn: () => api.listCards(profile!.id),
    enabled: !!profile,
  });

  const card = cards[0];
  const percent = card ? cardUsagePercent(Number(card.current_bill), Number(card.limit_amount)) : 0;
  const status = cardStatus(percent);

  const save = async () => {
    if (!profile) return;
    const limitAmount = parseCurrencyInput(limit || String(card?.limit_amount ?? 0));
    const currentBill = parseCurrencyInput(bill || String(card?.current_bill ?? 0));
    if (limitAmount <= 0) {
      Alert.alert('Informe o limite');
      return;
    }
    try {
      setSaving(true);
      await api.upsertCard(profile.id, {
        id: card?.id,
        label: label || card?.label || 'Cartão',
        limit_amount: limitAmount,
        current_bill: currentBill,
      });
      await qc.invalidateQueries({ queryKey: ['cards', profile.id] });
      const pct = cardUsagePercent(currentBill, limitAmount);
      if (pct >= 80) {
        Alert.alert('Atenção', 'Você já usou 80% ou mais do limite do cartão.');
      } else {
        showCelebration('Cartão atualizado', 'Continue monitorando a fatura.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Carteira" subtitle="Controle o cartão sem culpa — com fricção.">
      {card ? (
        <Card>
          <View style={styles.row}>
            <Text style={styles.label}>{card.label}</Text>
            <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.bill}>{formatCurrency(Number(card.current_bill))}</Text>
          <Text style={styles.limit}>de {formatCurrency(Number(card.limit_amount))} · {percent}%</Text>
          <View style={{ marginTop: 12 }}>
            <ProgressBar
              progress={percent}
              segments={[
                { until: 49, color: colors.primary },
                { until: 79, color: colors.warning },
                { until: 100, color: colors.error },
              ]}
            />
          </View>
        </Card>
      ) : (
        <EmptyState
          title="Cadastre seu cartão"
          description="Acompanhe o % da fatura e receba alerta em 80%."
        />
      )}

      {percent >= 80 ? (
        <AlertBanner
          tone="error"
          title="Limite em risco"
          body="Pausar o cartão hoje pode salvar sua meta do mês."
        />
      ) : null}

      <Card>
        <Text style={styles.formTitle}>{card ? 'Atualizar cartão' : 'Novo cartão'}</Text>
        <View style={{ gap: 12, marginTop: 12 }}>
          <Input label="Nome" value={label} onChangeText={setLabel} />
          <Input
            label="Limite"
            keyboardType="decimal-pad"
            placeholder={card ? String(card.limit_amount) : '3000'}
            value={limit}
            onChangeText={setLimit}
          />
          <Input
            label="Fatura atual"
            keyboardType="decimal-pad"
            placeholder={card ? String(card.current_bill) : '0'}
            value={bill}
            onChangeText={setBill}
          />
          <Button title="Salvar" loading={saving} onPress={save} />
        </View>
      </Card>

      <Card>
        <Text style={styles.formTitle}>Atalhos comportamentais</Text>
        <Text style={styles.hint}>
          Use o Modo Tentação antes de qualquer compra no cartão acima de R$ 200.
        </Text>
        <Button
          title="Abrir Modo Tentação"
          variant="outline"
          onPress={() => router.push('/tentacao')}
          style={{ marginTop: 12 }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.muted },
  status: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  bill: { fontFamily: 'Inter_700Bold', fontSize: 32, color: colors.text, marginTop: 8 },
  limit: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, marginTop: 4 },
  formTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 20 },
});
