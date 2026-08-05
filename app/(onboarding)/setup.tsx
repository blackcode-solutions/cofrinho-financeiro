import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, Input, Button, Chip, Card } from '@/src/components/ui';
import { api } from '@/src/services/api';
import { useAuthStore } from '@/src/store';
import { colors, objectives, saveGoalOptions } from '@/src/theme/tokens';
import { parseCurrencyInput } from '@/src/utils/finance';

const schema = z.object({
  name: z.string().min(2),
  salary: z.string().min(1),
  payday: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export default function SetupScreen() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [goal, setGoal] = useState(30);
  const [objective, setObjective] = useState<string>('Reserva');
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen title="Seu Cofrinho" subtitle="Personalize sua jornada financeira.">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input label="Nome" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />
      <Controller
        control={control}
        name="salary"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Salário mensal"
            keyboardType="decimal-pad"
            placeholder="Ex: 5000"
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
          <Input
            label="Dia do pagamento"
            keyboardType="number-pad"
            placeholder="Ex: 5"
            value={value}
            onChangeText={onChange}
            error={errors.payday?.message}
          />
        )}
      />

      <Card>
        <Text style={styles.section}>Meta de guardar</Text>
        <View style={styles.row}>
          {saveGoalOptions.map((pct) => (
            <Chip key={pct} label={`${pct}%`} selected={goal === pct} onPress={() => setGoal(pct)} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>Objetivo</Text>
        <View style={styles.wrap}>
          {objectives.map((obj) => (
            <Chip
              key={obj}
              label={obj}
              selected={objective === obj}
              onPress={() => setObjective(obj)}
            />
          ))}
        </View>
      </Card>

      <Button title="Começar a economizar" loading={loading} onPress={handleSubmit(onSubmit)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
