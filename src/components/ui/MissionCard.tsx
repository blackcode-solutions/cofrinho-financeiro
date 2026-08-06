import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { ProgressBar } from './ProgressBar';
import { colors, radius, spacing } from '@/src/theme/tokens';
import { getMissionMeta, isMoneyMission } from '@/src/theme/missionMeta';
import { formatCurrency } from '@/src/utils/finance';
import type { UserMission } from '@/src/types';

type Props = {
  item: UserMission;
  onPress?: () => void;
};

function progressLabel(item: UserMission): string {
  const mission = item.mission;
  const target = mission?.target_value ?? 1;
  const progress = item.progress;

  if (isMoneyMission(mission?.icon, mission?.title)) {
    return `${formatCurrency(progress)} / ${formatCurrency(target)}`;
  }

  const unit = target === 1 ? 'dia' : 'dias';
  return `${progress}/${target} ${unit}`;
}

export function MissionCard({ item, onPress }: Props) {
  const mission = item.mission;
  const target = mission?.target_value ?? 1;
  const pct = Math.min(100, Math.round((item.progress / target) * 100));
  const done = item.status === 'completed';
  const meta = getMissionMeta(mission?.icon);
  const Icon = done ? CheckCircle2 : meta.icon;
  const xp = mission?.xp_reward ?? 0;

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: meta.bg }]}>
        <View style={[styles.iconWrap, { backgroundColor: meta.iconBg }]}>
          <Icon color={done ? colors.primary : meta.color} size={22} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{mission?.title ?? 'Missão'}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            Conclua o desafio e ganhe {xp} XP
          </Text>
          <Text style={styles.progressText}>{progressLabel(item)}</Text>
          <ProgressBar progress={pct} height={6} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: spacing.md,
    borderRadius: radius.xl,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
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
  progressText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
