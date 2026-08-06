import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { Screen, Input } from '@/src/components/ui';
import { api } from '@/src/services/api';
import { useAuthStore } from '@/src/store';
import { colors, objectives, radius, saveGoalOptions } from '@/src/theme/tokens';
import { parseCurrencyInput } from '@/src/utils/finance';

const schema = z.object({
  name: z.string().min(2),
  salary: z.string().min(1),
  payday: z.string().min(1),
});

type Form = z.infer<typeof schema>;

const PAYDAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  onPress: () => void;
};

function SelectField({ label, value, placeholder, error, onPress }: SelectFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={[styles.selectTrigger, error ? styles.selectError : null]}
        accessibilityRole="button"
      >
        <Text style={[styles.selectValue, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {value || placeholder || 'Selecione'}
        </Text>
        <ChevronDown size={20} color={colors.muted} />
      </Pressable>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

type OptionModalProps = {
  visible: boolean;
  title: string;
  options: readonly string[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

function OptionModal({ visible, title, options, selected, onSelect, onClose }: OptionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options as string[]}
            keyExtractor={(item) => item}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item === selected;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                >
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
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

export default function SetupScreen() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [goal, setGoal] = useState(30);
  const [objective, setObjective] = useState<string>('Reserva');
  const [loading, setLoading] = useState(false);
  const [paydayOpen, setPaydayOpen] = useState(false);
  const [objectiveOpen, setObjectiveOpen] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? '',
      salary: profile?.salary ? String(profile.salary) : '',
      payday: profile?.payday ? String(profile.payday) : '5',
    },
  });

  const onSubmit = async (values: Form) => {
    if (!profile) return;
    try {
      setLoading(true);
      const updated = await api.updateProfile(profile.id, {
        name: values.name,
        salary: parseCurrencyInput(values.salary),
        payday: Math.min(31, Math.max(1, Number(values.payday) || 1)),
        save_goal_pct: goal,
        objective,
        onboarding_completed: true,
      });
      setProfile(updated);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <Screen backgroundColor="#FFFFFF" style={styles.screen}>
      <Pressable
        onPress={onBack}
        style={styles.back}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft size={24} color={colors.text} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Falta pouco! 🎯</Text>
        <Text style={styles.subtitle}>Conte-nos mais para personalizar sua experiência.</Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Nome"
            placeholder="Digite seu nome"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="salary"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Salário mensal"
            keyboardType="decimal-pad"
            placeholder="R$ 0,00"
            value={value}
            onChangeText={onChange}
            error={errors.salary?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="payday"
        render={({ field: { onChange, value } }) => (
          <>
            <SelectField
              label="Dia do pagamento"
              value={value ? `Dia ${value}` : ''}
              placeholder="Selecione o dia"
              error={errors.payday?.message}
              onPress={() => setPaydayOpen(true)}
            />
            <OptionModal
              visible={paydayOpen}
              title="Dia do pagamento"
              options={PAYDAY_OPTIONS}
              selected={value}
              onSelect={onChange}
              onClose={() => setPaydayOpen(false)}
            />
          </>
        )}
      />

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Meta de economia</Text>
        <View style={styles.segmentRow}>
          {saveGoalOptions.map((pct) => {
            const selected = goal === pct;
            return (
              <Pressable
                key={pct}
                onPress={() => setGoal(pct)}
                style={[styles.segment, selected && styles.segmentSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                  {pct}%
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SelectField
        label="Qual seu objetivo?"
        value={objective}
        placeholder="Selecione"
        onPress={() => setObjectiveOpen(true)}
      />
      <OptionModal
        visible={objectiveOpen}
        title="Qual seu objetivo?"
        options={objectives}
        selected={objective}
        onSelect={setObjective}
        onClose={() => setObjectiveOpen(false)}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Concluir cadastro"
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Concluir cadastro</Text>
        )}
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 20,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  header: {
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
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
  fieldError: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.error,
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
    gap: 8,
  },
  selectError: {
    borderColor: colors.error,
  },
  selectValue: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  selectPlaceholder: {
    color: colors.muted,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: 4,
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
