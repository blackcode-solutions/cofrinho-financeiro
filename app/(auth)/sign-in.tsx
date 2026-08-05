import { useState } from 'react';
import { Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, Input, Button, PigCard } from '@/src/components/ui';
import { api } from '@/src/services/api';
import { useAuthStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';
import { isSupabaseConfigured, supabase } from '@/src/services/supabase';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: Form) => {
    try {
      setLoading(true);
      const { userId } = await api.signIn(values.email, values.password);
      if (!userId) throw new Error('Falha no login');

      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } else {
        setSession({
          access_token: 'local',
          refresh_token: 'local',
          expires_in: 999999,
          token_type: 'bearer',
          user: { id: userId, email: values.email } as never,
        } as never);
      }

      const profile = await api.touchStreak(userId);
      setProfile(profile);
      router.replace(profile.onboarding_completed ? '/(tabs)' : '/(onboarding)/setup');
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Entrar" subtitle="Bem-vindo de volta.">
      <PigCard stage="golden" size={80} />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Senha"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Button title="Entrar" loading={loading} onPress={handleSubmit(onSubmit)} />
      <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
        <Text style={styles.link}>Criar conta</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: {
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    color: colors.primary,
  },
});
