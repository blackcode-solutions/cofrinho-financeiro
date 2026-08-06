import { GoogleAuthButton, SocialDivider } from '@/src/components/auth';
import { Button, Input, Screen } from '@/src/components/ui';
import { api } from '@/src/services/api';
import { signInWithGoogle } from '@/src/services/googleAuth';
import { isSupabaseConfigured, supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const goAfterAuth = async (userId: string) => {
    const profile = await api.touchStreak(userId);
    setProfile(profile);
    router.replace(profile.onboarding_completed ? '/(tabs)' : '/(onboarding)/setup');
  };

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

      await goAfterAuth(userId);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { userId, session } = await signInWithGoogle();
      setSession(session);
      await goAfterAuth(userId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Não foi possível entrar com Google';
      if (message.includes('cancelado')) return;
      Alert.alert('Erro', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const onForgotPassword = async () => {
    const email = getValues('email').trim();
    if (!isSupabaseConfigured) {
      Alert.alert('Modo local', 'Recuperação de senha exige Supabase configurado.');
      return;
    }
    if (!email) {
      Alert.alert('E-mail necessário', 'Digite seu e-mail acima para receber o link de recuperação.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      Alert.alert('Pronto', 'Se existir uma conta com esse e-mail, enviamos um link de recuperação.');
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível enviar o e-mail');
    }
  };

  return (
    <Screen backgroundColor="#FFFFFF" style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Que bom te ver{'\n'}de novo!</Text>
        <Text style={styles.subtitle}>Faça login para continuar sua jornada.</Text>
      </View>

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
            placeholder="Digite sua senha"
            secureTextEntry={!showPassword}
            autoComplete="password"
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

      <Pressable onPress={onForgotPassword} hitSlop={8} style={styles.forgotWrap}>
        <Text style={styles.forgot}>Esqueci minha senha</Text>
      </Pressable>

      <Button title="Entrar" loading={loading} onPress={handleSubmit(onSubmit)} />

      <SocialDivider />
      <GoogleAuthButton onPress={onGoogle} loading={googleLoading} disabled={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta? </Text>
        <Pressable onPress={() => router.replace('/(auth)/sign-up')} hitSlop={8}>
          <Text style={styles.footerLink}>Criar conta</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56,
    paddingHorizontal: 24,
    gap: 20,
  },
  header: {
    marginBottom: 28,
    gap: 8,
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
  forgotWrap: {
    alignSelf: 'center',
    marginTop: -4,
  },
  forgot: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
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
});
