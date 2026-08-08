import { Card, Input, Screen } from '@/src/components/ui';
import { api } from '@/src/services/api';
import { useAuthStore, useUiStore } from '@/src/store';
import { colors, radius } from '@/src/theme/tokens';
import {
  formatCurrency,
  parseCurrencyInput,
  suggestedSaveAmount,
} from '@/src/utils/finance';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GuardarScreen() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [amountOverride, setAmountOverride] = useState<number | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customError, setCustomError] = useState<string | undefined>();

  if (!profile) return null;

  const suggested = suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  const amount = amountOverride ?? suggested;
  const isCustom = amountOverride !== null && amountOverride !== suggested;

  const openCustom = () => {
    setCustomText(amount > 0 ? String(amount).replace('.', ',') : '');
    setCustomError(undefined);
    setCustomOpen(true);
  };

  const applyCustom = () => {
    const parsed = parseCurrencyInput(customText);
    if (!(parsed > 0)) {
      setCustomError('Informe um valor maior que zero');
      return;
    }
    setAmountOverride(parsed);
    setCustomOpen(false);
  };

  const confirm = async () => {
    if (loading) return;
    if (!(amount > 0)) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    try {
      setLoading(true);
      await api.addSaving(
        profile.id,
        amount,
        isCustom ? 'Depósito' : 'Depósito mensal',
      );
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
    <Screen backgroundColor={colors.card}>
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
        <View style={styles.headerText}>
          <Text style={styles.title}>Guardar dinheiro</Text>
          <Text style={styles.subtitle}>Primeiro você, depois o resto.</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <Card style={styles.amountCard}>
        <Text style={styles.label}>Valor sugerido para guardar</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        <Text style={styles.pct}>{profile.save_goal_pct}% do seu salário</Text>
        <Image
          source={require('../assets/images/pig/splash-pig-transparent.png')}
          style={styles.pig}
          resizeMode="contain"
        />
      </Card>

      <Text style={styles.hint}>Transfira para sua conta separada</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={confirm}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Já transferi"
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Já transferi</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openCustom}
          accessibilityRole="button"
          accessibilityLabel="Guardar outro valor"
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}></Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={customOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setCustomOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}></Text>
            <Input
              label="Valor"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={customText}
              onChangeText={(t) => {
                setCustomText(t);
                setCustomError(undefined);
              }}
              error={customError}
              autoFocus
            />
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={applyCustom}
              accessibilityRole="button"
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCustomOpen(false)}
              accessibilityRole="button"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  amountCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  amount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: colors.text,
    marginTop: 8,
  },
  pct: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  pig: {
    width: 120,
    height: 120,
    marginTop: 20,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  submitButton: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: '#16A34A',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    alignSelf: 'stretch',
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#16A34A',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    gap: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
});
