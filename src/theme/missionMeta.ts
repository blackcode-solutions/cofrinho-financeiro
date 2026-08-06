import {
  Shield,
  Coins,
  Gift,
  Shirt,
  Trophy,
  Target,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from './tokens';

export type MissionVisual = {
  icon: LucideIcon;
  color: string;
  bg: string;
  iconBg: string;
};

const FALLBACK: MissionVisual = {
  icon: Target,
  color: colors.muted,
  bg: '#F3F4F6',
  iconBg: '#E5E7EB',
};

const MISSION_META: Record<string, MissionVisual> = {
  shield: {
    icon: Shield,
    color: '#16A34A',
    bg: '#ECFDF5',
    iconBg: '#DCFCE7',
  },
  utensils: {
    icon: Shield,
    color: '#16A34A',
    bg: '#ECFDF5',
    iconBg: '#DCFCE7',
  },
  coins: {
    icon: Coins,
    color: '#D97706',
    bg: '#FFFBEB',
    iconBg: '#FEF3C7',
  },
  'credit-card': {
    icon: Coins,
    color: '#D97706',
    bg: '#FFFBEB',
    iconBg: '#FEF3C7',
  },
  gift: {
    icon: Gift,
    color: '#7C3AED',
    bg: '#F5F3FF',
    iconBg: '#EDE9FE',
  },
  'piggy-bank': {
    icon: Gift,
    color: '#7C3AED',
    bg: '#F5F3FF',
    iconBg: '#EDE9FE',
  },
  shirt: {
    icon: Shirt,
    color: '#DB2777',
    bg: '#FDF2F8',
    iconBg: '#FCE7F3',
  },
  trophy: {
    icon: Trophy,
    color: '#CA8A04',
    bg: '#FEFCE8',
    iconBg: '#FEF9C3',
  },
};

export function getMissionMeta(icon: string | undefined): MissionVisual {
  if (!icon) return FALLBACK;
  return MISSION_META[icon] ?? FALLBACK;
}

export function isMoneyMission(icon: string | undefined, title: string | undefined): boolean {
  if (icon === 'piggy-bank' || icon === 'gift') return true;
  const t = title ?? '';
  return /R\$|Economize|Economizar/i.test(t);
}
