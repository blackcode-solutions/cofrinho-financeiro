export const colors = {
  primary: '#16A34A',
  primaryLight: '#22C55E',
  background: '#F8FAFC',
  card: '#FFFFFF',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#16A34A',
  info: '#2563EB',
  successSoft: '#DCFCE7',
  errorSoft: '#FEE2E2',
  infoSoft: '#DBEAFE',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  darkBg: '#0F172A',
  darkCard: '#1E293B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export type PigStage = 'baby' | 'golden' | 'giant' | 'castle' | 'city';

export const pigStages: { id: PigStage; label: string; minLevel: number }[] = [
  { id: 'baby', label: 'Cofrinho bebê', minLevel: 1 },
  { id: 'golden', label: 'Cofrinho dourado', minLevel: 5 },
  { id: 'giant', label: 'Cofrinho gigante', minLevel: 10 },
  { id: 'castle', label: 'Castelo', minLevel: 20 },
  { id: 'city', label: 'Cidade', minLevel: 35 },
];

export const objectives = ['Casa', 'Carro', 'Viagem', 'Reserva', 'Casamento'] as const;
export const saveGoalOptions = [20, 25, 30] as const;

export const categories = [
  'Alimentação',
  'Delivery',
  'Transporte',
  'Roupas',
  'Lazer',
  'Eletrônicos',
  'Casa',
  'Saúde',
  'Outros',
] as const;

export const XP_REWARDS = {
  save: 50,
  waitComplete: 40,
  avoidImpulse: 60,
  missionDaily: 40,
  openApp: 5,
} as const;

export const XP_PER_LEVEL = 200;
