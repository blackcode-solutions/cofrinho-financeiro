import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Screen, Card, Avatar, Chip, Button, Badge } from '@/src/components/ui';
import { useAuthStore } from '@/src/store';
import { api } from '@/src/services/api';
import { colors } from '@/src/theme/tokens';
import { formatCurrency } from '@/src/utils/finance';

export default function AmigosScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [tab, setTab] = useState<'geral' | 'economia' | 'streak'>('geral');

  const { data: ranking = [] } = useQuery({
    queryKey: ['ranking', profile?.id],
    queryFn: () => api.listFriendsRanking(profile!.id),
    enabled: !!profile,
  });

  const sorted = [...ranking].sort((a, b) => {
    if (tab === 'streak') return b.streak - a.streak;
    if (tab === 'economia') return b.saved - a.saved;
    return b.saved * 0.7 + b.streak * 10 + b.level * 5 - (a.saved * 0.7 + a.streak * 10 + a.level * 5);
  });

  return (
    <Screen title="Amigos" subtitle="Ranking saudável — sem pressão tóxica.">
      <View style={styles.tabs}>
        <Chip label="Geral" selected={tab === 'geral'} onPress={() => setTab('geral')} />
        <Chip label="Economia" selected={tab === 'economia'} onPress={() => setTab('economia')} />
        <Chip label="Sequência" selected={tab === 'streak'} onPress={() => setTab('streak')} />
      </View>

      {sorted.map((item, index) => (
        <Card key={item.id} style={[styles.row, item.isMe && styles.me]}>
          <Text style={styles.pos}>{index + 1}</Text>
          <Avatar name={item.name} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {item.name} {item.isMe ? '(você)' : ''}
            </Text>
            <Text style={styles.meta}>
              {formatCurrency(item.saved)} · {item.streak} dias · Nv. {item.level}
            </Text>
          </View>
          {index === 0 ? <Badge label="Top" tone="warning" /> : null}
        </Card>
      ))}

      <Card>
        <Text style={styles.inviteTitle}>Convidar amigos</Text>
        <Text style={styles.inviteBody}>
          Em breve: convites por link. Por enquanto o ranking local mostra comparativos de demonstração.
        </Text>
      </Card>

      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  me: { borderWidth: 1.5, borderColor: colors.primaryLight },
  pos: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.muted,
    width: 22,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  inviteTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  inviteBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
  },
});
