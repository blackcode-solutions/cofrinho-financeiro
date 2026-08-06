import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Screen, Input, Button } from '@/src/components/ui';
import { GoogleAuthButton, SocialDivider } from '@/src/components/auth';
import { api } from '@/src/services/api';
import { signInWithGoogle } from '@/src/services/googleAuth';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const goToSetup = async (userId: string, name?: string) => {
    let profile = await api.getProfile(userId);
    if (profile && name) {
      profile = await api.updateProfile(userId, { name });
    }
    if (profile) setProfile(profile);
    router.replace('/(onboarding)/setup');
  };

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

      await goToSetup(userId, values.name);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { userId, session } = await signInWithGoogle();
      setSession(session);
      await goToSetup(userId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Não foi possível continuar com Google';
      if (message.includes('cancelado')) return;
      Alert.alert('Erro', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen backgroundColor="#FFFFFF">
      <Pressable
        onPress={() => router.replace('/(auth)/sign-in')}
        style={styles.back}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft size={24} color={colors.text} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Vamos começar sua transformação financeira.</Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Nome completo"
            placeholder="Digite seu nome"
            autoComplete="name"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="E-mail"
            placeholder="Digite seu e-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
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
            placeholder="Crie uma senha"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            rightElement={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.muted} />
                ) : (
                  <Eye size={20} color={colors.muted} />
                )}
              </Pressable>
            }
          />
        )}
      />

      <Button title="Criar conta" loading={loading} onPress={handleSubmit(onSubmit)} />

      <SocialDivider />
      <GoogleAuthButton onPress={onGoogle} loading={googleLoading} disabled={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem conta? </Text>
        <Pressable onPress={() => router.replace('/(auth)/sign-in')} hitSlop={8}>
          <Text style={styles.footerLink}>Fazer login</Text>
        </Pressable>
      </View>

      {!isSupabaseConfigured ? (
        <Text style={styles.hint}>
          Modo local ativo — configure o Supabase no .env para sync na nuvem.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  footerLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
});
