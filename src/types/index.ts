export type PigStage = 'baby' | 'golden' | 'giant' | 'castle' | 'city';
export type PurchaseDecision = 'need' | 'wait' | 'impulse';
export type PurchaseStatus = 'pending' | 'waiting' | 'bought' | 'avoided';
export type MissionPeriod = 'daily' | 'weekly' | 'monthly';
export type MissionStatus = 'active' | 'completed' | 'failed';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  salary: number;
  payday: number;
  save_goal_pct: number;
  objective: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak_days: number;
  last_active_date: string | null;
  pig_stage: PigStage;
  onboarding_completed: boolean;
  theme: ThemeMode;
  created_at: string;
  updated_at: string;
}

export interface Saving {
  id: string;
  user_id: string;
  amount: number;
  transferred_at: string;
  note: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  decision: PurchaseDecision | null;
  status: PurchaseStatus;
  wait_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  label: string;
  limit_amount: number;
  current_bill: number;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  period: MissionPeriod;
  target_value: number;
  xp_reward: number;
  icon: string;
  active: boolean;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  progress: number;
  status: MissionStatus;
  period_start: string;
  completed_at: string | null;
  created_at: string;
  mission?: Mission;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface CityState {
  user_id: string;
  houses: number;
  trees: number;
  lakes: number;
  plazas: number;
  buildings: number;
  monuments: number;
  next_build_progress: number;
  updated_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface NotificationPrefs {
  user_id: string;
  payday: boolean;
  wait_end: boolean;
  mission: boolean;
  card_alert: boolean;
}

export interface TemptationResult {
  hoursWorked: number;
  goalPercent: number;
  daysDelay: number;
  carDownPaymentPercent: number;
}

export interface MonthlyStats {
  saved: number;
  avoided: number;
  avoidedCount: number;
  streak: number;
  missionsCompleted: number;
  hoursSaved: number;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  type: 'tip' | 'warning' | 'celebration';
}
