import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Target, CheckCircle2 } from 'lucide-react-native';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { Badge } from './Badge';
import { colors } from '@/src/theme/tokens';
import type { UserMission } from '@/src/types';

type Props = {
  item: UserMission;
  onPress?: () => void;
};

export function MissionCard({ item, onPress }: Props) {
  const mission = item.mission;
  const target = mission?.target_value ?? 1;
  const pct = Math.min(100, Math.round((item.progress / target) * 100));
  const done = item.status === 'completed';

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            {done ? (
              <CheckCircle2 color={colors.primary} size={22} />
            ) : (
              <Target color={colors.primary} size={22} />
            )}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.title}>{mission?.title ?? 'Missão'}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {mission?.description}
            </Text>
          </View>
          <Badge label={`+${mission?.xp_reward ?? 0} XP`} />
        </View>
        <View style={styles.progress}>
          <ProgressBar progress={pct} />
          <Text style={styles.meta}>
            {item.progress}/{target} · {mission?.period === 'daily' ? 'Diária' : mission?.period === 'weekly' ? 'Semanal' : 'Mensal'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  progress: { gap: 6 },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
});
