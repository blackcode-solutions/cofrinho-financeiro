import { useState, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Zap,
  Utensils,
  Bike,
  Car,
  Shirt,
  Gamepad2,
  Smartphone,
  Home,
  HeartPulse,
  Package,
  type LucideIcon,
} from 'lucide-react-native';
import { Screen, Input, Card } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { categories, colors, radius, shadow } from '@/src/theme/tokens';
import { parseCurrencyInput } from '@/src/utils/finance';
import type { PurchaseDecision } from '@/src/types';

type Category = (typeof categories)[number];

const CATEGORY_META: Record<Category, { icon: LucideIcon; color: string; bg: string }> = {
  Alimentação: { icon: Utensils, color: '#EA580C', bg: '#FFF7ED' },
  Delivery: { icon: Bike, color: '#DC2626', bg: '#FEF2F2' },
  Transporte: { icon: Car, color: '#2563EB', bg: '#EFF6FF' },
  Roupas: { icon: Shirt, color: '#DB2777', bg: '#FDF2F8' },
  Lazer: { icon: Gamepad2, color: '#DB2777', bg: '#FDF2F8' },
  Eletrônicos: { icon: Smartphone, color: '#7C3AED', bg: '#F5F3FF' },
  Casa: { icon: Home, color: '#0D9488', bg: '#F0FDFA' },
  Saúde: { icon: HeartPulse, color: '#E11D48', bg: '#FFF1F2' },
  Outros: { icon: Package, color: '#6B7280', bg: '#F3F4F6' },
};

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

export default function RegistrarGastoScreen() {
  const profile = useAuthStore((s) => s.profile);
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Outros');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAmountChange = (text: string) => {
    setAmount(formatCurrencyMask(text));
  };

  const decide = async (decision: PurchaseDecision) => {
    if (loading) return;
    if (!profile) return;

    const parsed = parseCurrencyInput(amount);
    if (parsed <= 0 || !description.trim()) {
      Alert.alert('Preencha valor e descrição');
      return;
    }

    try {
      setLoading(true);
      const purchase = await api.createPurchase(profile.id, {
        amount: parsed,
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

  const meta = CATEGORY_META[category];
  const CategoryIcon = meta.icon;

  return (
    <Screen backgroundColor={colors.background}>
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
        <Text style={styles.title}>Novo gasto</Text>
        <View style={styles.backBtn} />
      </View>

      <Input
        label="Valor"
        keyboardType="decimal-pad"
        placeholder="R$ 0,00"
        value={amount}
        onChangeText={onAmountChange}
      />

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Categoria</Text>
        <Pressable
          onPress={() => setCategoryOpen(true)}
          style={styles.selectTrigger}
          accessibilityRole="button"
          accessibilityLabel="Selecionar categoria"
        >
          <View style={[styles.categoryIcon, { backgroundColor: meta.bg }]}>
            <CategoryIcon size={16} color={meta.color} />
          </View>
          <Text style={styles.selectValue} numberOfLines={1}>
            {category}
          </Text>
          <ChevronDown size={20} color={colors.muted} />
        </Pressable>
      </View>

      <Input
        label="Descrição"
        placeholder="Tênis novo"
        value={description}
        onChangeText={setDescription}
      />

      <Card style={styles.decisionCard}>
        <Text style={styles.decisionTitle}>Você realmente precisa disso?</Text>
        <Text style={styles.decisionSubtitle}>Pense bem antes de decidir.</Text>

        <View style={[styles.decisionRow, loading && styles.decisionRowDisabled]}>
          <DecisionTile
            icon={<Check color="#fff" size={20} strokeWidth={2.5} />}
            iconBg={colors.success}
            label="Preciso"
            disabled={loading}
            onPress={() => decide('need')}
          />
          <DecisionTile
            icon={<Clock color="#fff" size={20} />}
            iconBg={colors.warning}
            label={'Posso\nesperar'}
            disabled={loading}
            onPress={() => decide('wait')}
          />
          <DecisionTile
            icon={<Zap color="#fff" size={20} />}
            iconBg={colors.error}
            label={'Foi\nimpulso'}
            disabled={loading}
            onPress={() => decide('impulse')}
          />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
      </Card>

      <CategoryModal
        visible={categoryOpen}
        selected={category}
        onSelect={setCategory}
        onClose={() => setCategoryOpen(false)}
      />
    </Screen>
  );
}

function DecisionTile({
  icon,
  iconBg,
  label,
  onPress,
  disabled,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label.replace('\n', ' ')}
      style={styles.tile}
    >
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

function CategoryModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: Category;
  onSelect: (value: Category) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Categoria</Text>
          <FlatList
            data={categories as unknown as Category[]}
            keyExtractor={(item) => item}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const itemMeta = CATEGORY_META[item];
              const Icon = itemMeta.icon;
              const isSelected = item === selected;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: itemMeta.bg }]}>
                    <Icon size={16} color={itemMeta.color} />
                  </View>
                  <Text
                    style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectValue: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  decisionCard: {
    marginTop: 8,
    gap: 8,
  },
  decisionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.text,
  },
  decisionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  decisionRowDisabled: {
    opacity: 0.55,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 17,
  },
  loadingWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalList: {
    flexGrow: 0,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  modalOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalOptionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  modalOptionTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
});
