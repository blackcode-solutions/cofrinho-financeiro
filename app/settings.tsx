import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Share, Switch } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Screen, Card, Button, Chip } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { storage } from '@/src/services/storage';
import { colors, saveGoalOptions } from '@/src/theme/tokens';
import { isSupabaseConfigured } from '@/src/services/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const reset = useAuthStore((s) => s.reset);
  const [goal, setGoal] = useState(profile?.save_goal_pct ?? 30);
  const [notif, setNotif] = useState(true);
  const [theme, setTheme] = useState(profile?.theme ?? 'light');

  if (!profile) return null;

  const saveGoal = async () => {
    const updated = await api.updateProfile(profile.id, {
      save_goal_pct: goal,
      theme: theme as 'light' | 'dark' | 'system',
    });
    setProfile(updated);
    Alert.alert('Salvo', 'Preferências atualizadas.');
  };

  const enableNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada');
      setNotif(false);
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cofrinho',
        body: 'Que tal abrir o app e manter sua sequência?',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24,
        repeats: true,
      },
    });
    Alert.alert('Ativado', 'Você receberá lembretes diários.');
  };

  const exportData = async () => {
    const json = api.exportAll(profile.id);
    try {
      await Share.share({ message: json, title: 'Backup Cofrinho' });
    } catch {
      Alert.alert('Exportação', 'Dados prontos no modo local.');
    }
  };

  const logout = async () => {
    await api.signOut();
    reset();
    router.replace('/(auth)/sign-in');
  };

  return (
    <Screen title="Configurações" subtitle="Perfil, meta, tema e backup.">
      <Card>
        <Text style={styles.section}>Conta</Text>
        <Text style={styles.line}>{profile.name}</Text>
        <Text style={styles.muted}>{profile.email}</Text>
        <Text style={styles.muted}>
          Sync: {isSupabaseConfigured ? 'Supabase ativo' : 'Modo local (configure .env)'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.section}>Meta de guardar</Text>
        <View style={styles.row}>
          {saveGoalOptions.map((pct) => (
            <Chip key={pct} label={`${pct}%`} selected={goal === pct} onPress={() => setGoal(pct)} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>Tema</Text>
        <View style={styles.row}>
          {(['light', 'dark', 'system'] as const).map((t) => (
            <Chip
              key={t}
              label={t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Sistema'}
              selected={theme === t}
              onPress={() => setTheme(t)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.switchRow}>
          <Text style={styles.section}>Notificações</Text>
          <Switch
            value={notif}
            onValueChange={async (v) => {
              setNotif(v);
              if (v) await enableNotifications();
              else await Notifications.cancelAllScheduledNotificationsAsync();
            }}
            trackColor={{ true: colors.primaryLight }}
          />
        </View>
      </Card>

      <Button title="Salvar preferências" onPress={saveGoal} />
      <Button title="Exportar dados / backup" variant="outline" onPress={exportData} />
      <Button
        title="Limpar cache local"
        variant="ghost"
        onPress={() => {
          storage.delete('local_db_v1');
          Alert.alert('Cache', 'Dados locais de demo podem ser recriados no próximo cadastro.');
        }}
      />
      <Button title="Sair" variant="danger" onPress={logout} />
      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  line: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text,
  },
  muted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
