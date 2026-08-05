import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
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
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: Form) => {
    try {
      setLoading(true);
      const { userId } = await api.signUp(values.email, values.password, values.name);
      if (!userId) throw new Error('Falha ao criar conta');

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

      const profile = await api.getProfile(userId);
      if (profile) {
        const updated = await api.updateProfile(userId, { name: values.name });
        setProfile(updated);
      }
      router.replace('/(onboarding)/setup');
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Criar conta" subtitle="Vamos montar seu Cofrinho.">
      <View style={styles.hero}>
        <PigCard stage="baby" size={88} />
      </View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input label="Nome" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />
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
      <Button title="Continuar" loading={loading} onPress={handleSubmit(onSubmit)} />
      <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
        <Text style={styles.link}>Já tenho conta</Text>
      </Pressable>
      {!isSupabaseConfigured ? (
        <Text style={styles.hint}>Modo local ativo — configure o Supabase no .env para sync na nuvem.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginVertical: 8 },
  link: {
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    color: colors.primary,
    marginTop: 4,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
});
