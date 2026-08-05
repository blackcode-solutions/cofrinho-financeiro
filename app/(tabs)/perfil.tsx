import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Award } from 'lucide-react-native';
import {
  Screen,
  Card,
  Avatar,
  ProgressBar,
  Button,
  Badge,
  PigCard,
} from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { xpProgress } from '@/src/utils/finance';

export default function PerfilScreen() {
  const profile = useAuthStore((s) => s.profile);

  const { data: achievements } = useQuery({
    queryKey: ['achievements', profile?.id],
    queryFn: () => api.listAchievements(profile!.id),
    enabled: !!profile,
  });

  if (!profile) return null;

  const xp = xpProgress(profile.xp, profile.level);

  return (
    <Screen title="Meu perfil">
      <Card style={styles.hero}>
        <Avatar name={profile.name} size={72} uri={profile.avatar_url} />
        <Text style={styles.name}>{profile.name}</Text>
        <Badge label={`Nível ${profile.level}`} />
        <View style={{ width: '100%', gap: 6, marginTop: 8 }}>
          <ProgressBar progress={xp.percent} />
          <Text style={styles.xp}>
            {xp.intoLevel}/{xp.needed} XP para o próximo nível
          </Text>
        </View>
      </Card>

      <View style={styles.row}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{profile.streak_days}</Text>
          <Text style={styles.statLabel}>Sequência</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{achievements?.unlocked.length ?? 0}</Text>
          <Text style={styles.statLabel}>Medalhas</Text>
        </Card>
      </View>

      <Card style={{ alignItems: 'center' }}>
        <PigCard stage={profile.pig_stage} size={100} label />
      </Card>

      <Card>
        <Text style={styles.section}>Medalhas</Text>
        <View style={styles.medals}>
          {(achievements?.all ?? []).slice(0, 6).map((a) => {
            const unlocked = achievements?.unlocked.some((u) => u.achievement_id === a.id);
            return (
              <View key={a.id} style={[styles.medal, !unlocked && { opacity: 0.35 }]}>
                <Award color={unlocked ? '#F59E0B' : colors.muted} size={22} />
                <Text style={styles.medalText} numberOfLines={1}>
                  {a.title}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Button
        title="Amigos e ranking"
        variant="outline"
        onPress={() => router.push('/amigos')}
      />
      <Button title="Configurações" variant="ghost" onPress={() => router.push('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8 },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.text,
  },
  xp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.text,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  section: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  medals: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  medal: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
  },
  medalText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
  },
});
