import { isSupabaseConfigured, supabase } from './supabase';
import { storage } from './storage';
import type {
  Achievement,
  CityState,
  CreditCard,
  Mission,
  Profile,
  Purchase,
  PurchaseDecision,
  PurchaseStatus,
  Saving,
  UserAchievement,
  UserMission,
} from '@/src/types';
import {
  levelFromXp,
  pigStageFromLevel,
  suggestedSaveAmount,
} from '@/src/utils/finance';
import { XP_REWARDS } from '@/src/theme/tokens';

const LOCAL_KEY = 'local_db_v1';

interface LocalDb {
  profile: Profile | null;
  savings: Saving[];
  purchases: Purchase[];
  cards: CreditCard[];
  missions: Mission[];
  userMissions: UserMission[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  city: CityState | null;
  password?: string;
}

function uid() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultMissions(): Mission[] {
  return [
    {
      id: 'm1',
      title: 'Sem cartão hoje',
      description: 'Não use o cartão de crédito hoje',
      period: 'daily',
      target_value: 1,
      xp_reward: 40,
      icon: 'credit-card',
      active: true,
    },
    {
      id: 'm2',
      title: 'Economize R$ 50',
      description: 'Guarde R$ 50 esta semana',
      period: 'weekly',
      target_value: 50,
      xp_reward: 80,
      icon: 'piggy-bank',
      active: true,
    },
    {
      id: 'm3',
      title: '3 dias sem delivery',
      description: 'Passe 3 dias sem pedir delivery',
      period: 'weekly',
      target_value: 3,
      xp_reward: 100,
      icon: 'utensils',
      active: true,
    },
    {
      id: 'm4',
      title: 'Semana sem roupas',
      description: 'Não compre roupas por 7 dias',
      period: 'weekly',
      target_value: 7,
      xp_reward: 120,
      icon: 'shirt',
      active: true,
    },
    {
      id: 'm5',
      title: 'Meta do mês',
      description: 'Bata sua meta de poupança mensal',
      period: 'monthly',
      target_value: 1,
      xp_reward: 200,
      icon: 'trophy',
      active: true,
    },
  ];
}

function defaultAchievements(): Achievement[] {
  return [
    { id: 'a1', code: 'first_save', title: 'Primeiro depósito', description: 'Guardou dinheiro pela primeira vez', icon: 'coins', xp_reward: 50 },
    { id: 'a2', code: 'wait_master', title: 'Mestre da espera', description: 'Completou 5 esperas de 24h', icon: 'clock', xp_reward: 100 },
    { id: 'a3', code: 'streak_7', title: 'Sequência de 7', description: '7 dias seguidos no app', icon: 'flame', xp_reward: 150 },
    { id: 'a4', code: 'save_30pct', title: 'Guardião dos 30%', description: 'Guardou 30% do salário no mês', icon: 'medal', xp_reward: 200 },
    { id: 'a5', code: 'city_starter', title: 'Fundador', description: 'Construiu o primeiro item na cidade', icon: 'home', xp_reward: 80 },
    { id: 'a6', code: 'impulse_blocker', title: 'Anti-impulso', description: 'Evitou 10 compras por impulso', icon: 'shield', xp_reward: 180 },
  ];
}

function loadLocal(): LocalDb {
  const raw = storage.getString(LOCAL_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as LocalDb;
    } catch {
      /* fallthrough */
    }
  }
  return {
    profile: null,
    savings: [],
    purchases: [],
    cards: [],
    missions: defaultMissions(),
    userMissions: [],
    achievements: defaultAchievements(),
    userAchievements: [],
    city: null,
  };
}

function saveLocal(db: LocalDb) {
  storage.set(LOCAL_KEY, JSON.stringify(db));
}

function applyXp(profile: Profile, amount: number): Profile {
  const xp = profile.xp + amount;
  const level = levelFromXp(xp);
  return {
    ...profile,
    xp,
    level,
    pig_stage: pigStageFromLevel(level),
  };
}

function bumpCity(city: CityState, amount: number): CityState {
  let progress = city.next_build_progress + amount;
  const next = { ...city };
  while (progress >= 100) {
    progress -= 100;
    if (next.trees < 8) next.trees += 1;
    else if (next.houses < 6) next.houses += 1;
    else if (next.lakes < 2) next.lakes += 1;
    else if (next.plazas < 3) next.plazas += 1;
    else if (next.buildings < 4) next.buildings += 1;
    else next.monuments += 1;
  }
  next.next_build_progress = progress;
  next.updated_at = new Date().toISOString();
  return next;
}

export const api = {
  isRemote: isSupabaseConfigured,

  async signUp(email: string, password: string, name: string) {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      const id = uid();
      const now = new Date().toISOString();
      db.profile = {
        id,
        name,
        email,
        salary: 0,
        payday: 1,
        save_goal_pct: 30,
        objective: 'Reserva',
        avatar_url: null,
        level: 1,
        xp: 0,
        streak_days: 0,
        last_active_date: null,
        pig_stage: 'baby',
        onboarding_completed: false,
        theme: 'light',
        created_at: now,
        updated_at: now,
      };
      db.city = {
        user_id: id,
        houses: 0,
        trees: 0,
        lakes: 0,
        plazas: 0,
        buildings: 0,
        monuments: 0,
        next_build_progress: 0,
        updated_at: now,
      };
      db.password = password;
      db.userMissions = db.missions.map((m) => ({
        id: uid(),
        user_id: id,
        mission_id: m.id,
        progress: 0,
        status: 'active' as const,
        period_start: new Date().toISOString().slice(0, 10),
        completed_at: null,
        created_at: now,
        mission: m,
      }));
      saveLocal(db);
      storage.set('local_session', JSON.stringify({ userId: id, email }));
      return { userId: id };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return { userId: data.user?.id };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      if (!db.profile || db.profile.email !== email || db.password !== password) {
        throw new Error('Email ou senha inválidos');
      }
      storage.set('local_session', JSON.stringify({ userId: db.profile.id, email }));
      return { userId: db.profile.id };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { userId: data.user?.id };
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      storage.delete('local_session');
      return;
    }
    await supabase.auth.signOut();
  },

  async getLocalSession(): Promise<{ userId: string; email: string } | null> {
    const raw = storage.getString('local_session');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      return db.profile?.id === userId ? db.profile : null;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  async updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      if (!db.profile || db.profile.id !== userId) throw new Error('Perfil não encontrado');
      db.profile = { ...db.profile, ...patch, updated_at: new Date().toISOString() };
      saveLocal(db);
      return db.profile;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async touchStreak(userId: string): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');
    const today = new Date().toISOString().slice(0, 10);
    if (profile.last_active_date === today) return profile;

    let streak = 1;
    if (profile.last_active_date) {
      const last = new Date(profile.last_active_date);
      const diff = Math.round((Date.now() - last.getTime()) / 86400000);
      streak = diff === 1 ? profile.streak_days + 1 : 1;
    }

    let next = applyXp(
      { ...profile, streak_days: streak, last_active_date: today },
      XP_REWARDS.openApp,
    );
    return this.updateProfile(userId, next);
  },

  async listSavings(userId: string): Promise<Saving[]> {
    if (!isSupabaseConfigured) {
      return loadLocal().savings.filter((s) => s.user_id === userId);
    }
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userId)
      .order('transferred_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Saving[];
  },

  async addSaving(userId: string, amount: number, note?: string): Promise<Saving> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      const saving: Saving = {
        id: uid(),
        user_id: userId,
        amount,
        transferred_at: new Date().toISOString(),
        note: note ?? null,
        created_at: new Date().toISOString(),
      };
      db.savings.unshift(saving);
      if (db.profile) {
        db.profile = applyXp(db.profile, XP_REWARDS.save);
        if (db.savings.length === 1) {
          const ach = db.achievements.find((a) => a.code === 'first_save');
          if (ach && !db.userAchievements.some((u) => u.achievement_id === ach.id)) {
            db.userAchievements.push({
              id: uid(),
              user_id: userId,
              achievement_id: ach.id,
              unlocked_at: new Date().toISOString(),
              achievement: ach,
            });
            db.profile = applyXp(db.profile, ach.xp_reward);
          }
        }
      }
      if (db.city) db.city = bumpCity(db.city, Math.min(40, amount / 50));
      // progress weekly save mission
      db.userMissions = db.userMissions.map((um) => {
        const mission = db.missions.find((m) => m.id === um.mission_id);
        if (mission?.title.includes('Economize') && um.status === 'active') {
          const progress = um.progress + amount;
          const completed = progress >= mission.target_value;
          return {
            ...um,
            progress,
            status: completed ? 'completed' : 'active',
            completed_at: completed ? new Date().toISOString() : null,
          };
        }
        return um;
      });
      saveLocal(db);
      return saving;
    }
    const { data, error } = await supabase
      .from('savings')
      .insert({ user_id: userId, amount, note })
      .select()
      .single();
    if (error) throw error;
    const profile = await this.getProfile(userId);
    if (profile) {
      await this.updateProfile(userId, applyXp(profile, XP_REWARDS.save));
    }
    return data as Saving;
  },

  async listPurchases(userId: string): Promise<Purchase[]> {
    if (!isSupabaseConfigured) {
      return loadLocal().purchases.filter((p) => p.user_id === userId);
    }
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Purchase[];
  },

  async createPurchase(
    userId: string,
    input: {
      amount: number;
      description: string;
      category: string;
      decision: PurchaseDecision;
    },
  ): Promise<Purchase> {
    const status: PurchaseStatus =
      input.decision === 'wait' ? 'waiting' : input.decision === 'impulse' ? 'bought' : 'bought';
    const wait_until =
      input.decision === 'wait'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null;

    if (!isSupabaseConfigured) {
      const db = loadLocal();
      const purchase: Purchase = {
        id: uid(),
        user_id: userId,
        amount: input.amount,
        description: input.description,
        category: input.category,
        decision: input.decision,
        status: input.decision === 'impulse' ? 'bought' : status,
        wait_until,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // If they mark as impulse awareness but chose wait we already handle; "impulse" bought still counts
      if (input.decision === 'wait') purchase.status = 'waiting';
      db.purchases.unshift(purchase);
      saveLocal(db);
      return purchase;
    }
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        amount: input.amount,
        description: input.description,
        category: input.category,
        decision: input.decision,
        status: input.decision === 'wait' ? 'waiting' : 'bought',
        wait_until,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Purchase;
  },

  async resolvePurchase(
    purchaseId: string,
    status: 'bought' | 'avoided',
    userId: string,
  ): Promise<Purchase> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      const idx = db.purchases.findIndex((p) => p.id === purchaseId);
      if (idx < 0) throw new Error('Compra não encontrada');
      db.purchases[idx] = {
        ...db.purchases[idx],
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'avoided' && db.profile) {
        db.profile = applyXp(db.profile, XP_REWARDS.avoidImpulse);
        if (db.city) db.city = bumpCity(db.city, 25);
        const avoidedCount = db.purchases.filter((p) => p.status === 'avoided').length;
        if (avoidedCount >= 10) {
          const ach = db.achievements.find((a) => a.code === 'impulse_blocker');
          if (ach && !db.userAchievements.some((u) => u.achievement_id === ach.id)) {
            db.userAchievements.push({
              id: uid(),
              user_id: userId,
              achievement_id: ach.id,
              unlocked_at: new Date().toISOString(),
              achievement: ach,
            });
            db.profile = applyXp(db.profile, ach.xp_reward);
          }
        }
      }
      if (status === 'avoided' || (db.purchases[idx].decision === 'wait' && status === 'bought')) {
        if (status !== 'bought' && db.profile) {
          db.profile = applyXp(db.profile, XP_REWARDS.waitComplete);
        }
      }
      saveLocal(db);
      return db.purchases[idx];
    }
    const { data, error } = await supabase
      .from('purchases')
      .update({ status })
      .eq('id', purchaseId)
      .select()
      .single();
    if (error) throw error;
    if (status === 'avoided') {
      const profile = await this.getProfile(userId);
      if (profile) await this.updateProfile(userId, applyXp(profile, XP_REWARDS.avoidImpulse));
    }
    return data as Purchase;
  },

  async getPurchase(id: string): Promise<Purchase | null> {
    if (!isSupabaseConfigured) {
      return loadLocal().purchases.find((p) => p.id === id) ?? null;
    }
    const { data, error } = await supabase.from('purchases').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Purchase | null;
  },

  async listCards(userId: string): Promise<CreditCard[]> {
    if (!isSupabaseConfigured) {
      return loadLocal().cards.filter((c) => c.user_id === userId);
    }
    const { data, error } = await supabase.from('credit_cards').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as CreditCard[];
  },

  async upsertCard(
    userId: string,
    input: { id?: string; label: string; limit_amount: number; current_bill: number },
  ): Promise<CreditCard> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      if (input.id) {
        const idx = db.cards.findIndex((c) => c.id === input.id);
        if (idx >= 0) {
          db.cards[idx] = {
            ...db.cards[idx],
            ...input,
            updated_at: new Date().toISOString(),
          };
          saveLocal(db);
          return db.cards[idx];
        }
      }
      const card: CreditCard = {
        id: uid(),
        user_id: userId,
        label: input.label,
        limit_amount: input.limit_amount,
        current_bill: input.current_bill,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.cards.push(card);
      saveLocal(db);
      return card;
    }
    if (input.id) {
      const { data, error } = await supabase
        .from('credit_cards')
        .update(input)
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data as CreditCard;
    }
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({ user_id: userId, ...input })
      .select()
      .single();
    if (error) throw error;
    return data as CreditCard;
  },

  async listUserMissions(userId: string): Promise<UserMission[]> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      return db.userMissions
        .filter((m) => m.user_id === userId)
        .map((um) => ({
          ...um,
          mission: db.missions.find((m) => m.id === um.mission_id),
        }));
    }
    const { data, error } = await supabase
      .from('user_missions')
      .select('*, mission:missions(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as UserMission[];
  },

  async completeMission(userMissionId: string, userId: string): Promise<UserMission> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      const idx = db.userMissions.findIndex((m) => m.id === userMissionId);
      if (idx < 0) throw new Error('Missão não encontrada');
      const mission = db.missions.find((m) => m.id === db.userMissions[idx].mission_id);
      db.userMissions[idx] = {
        ...db.userMissions[idx],
        progress: mission?.target_value ?? db.userMissions[idx].progress,
        status: 'completed',
        completed_at: new Date().toISOString(),
      };
      if (db.profile && mission) {
        db.profile = applyXp(db.profile, mission.xp_reward);
      }
      saveLocal(db);
      return { ...db.userMissions[idx], mission };
    }
    const { data, error } = await supabase
      .from('user_missions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', userMissionId)
      .select('*, mission:missions(*)')
      .single();
    if (error) throw error;
    return data as UserMission;
  },

  async listAchievements(userId: string) {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      return {
        all: db.achievements,
        unlocked: db.userAchievements.filter((u) => u.user_id === userId),
      };
    }
    const [{ data: all }, { data: unlocked }] = await Promise.all([
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', userId),
    ]);
    return {
      all: (all ?? []) as Achievement[],
      unlocked: (unlocked ?? []) as UserAchievement[],
    };
  },

  async getCity(userId: string): Promise<CityState | null> {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      return db.city?.user_id === userId ? db.city : null;
    }
    const { data, error } = await supabase
      .from('city_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as CityState | null;
  },

  async listFriendsRanking(userId: string) {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      const me = db.profile;
      if (!me) return [];
      const saved = db.savings.reduce((s, x) => s + Number(x.amount), 0);
      return [
        {
          id: me.id,
          name: me.name,
          saved,
          streak: me.streak_days,
          level: me.level,
          isMe: true,
        },
        { id: 'f1', name: 'Ana', saved: saved * 0.8, streak: Math.max(0, me.streak_days - 2), level: Math.max(1, me.level - 1), isMe: false },
        { id: 'f2', name: 'Bruno', saved: saved * 1.1, streak: me.streak_days + 3, level: me.level + 1, isMe: false },
        { id: 'f3', name: 'Carla', saved: saved * 0.6, streak: 5, level: 4, isMe: false },
      ].sort((a, b) => b.saved - a.saved);
    }
    const profile = await this.getProfile(userId);
    const savings = await this.listSavings(userId);
    const saved = savings.reduce((s, x) => s + Number(x.amount), 0);
    return [
      {
        id: userId,
        name: profile?.name ?? 'Você',
        saved,
        streak: profile?.streak_days ?? 0,
        level: profile?.level ?? 1,
        isMe: true,
      },
    ];
  },

  suggestedAmount(profile: Profile) {
    return suggestedSaveAmount(Number(profile.salary), profile.save_goal_pct);
  },

  exportAll(userId: string) {
    if (!isSupabaseConfigured) {
      const db = loadLocal();
      return JSON.stringify(
        {
          profile: db.profile,
          savings: db.savings.filter((s) => s.user_id === userId),
          purchases: db.purchases.filter((p) => p.user_id === userId),
          cards: db.cards.filter((c) => c.user_id === userId),
          city: db.city,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      );
    }
    return JSON.stringify({ note: 'Use backups do Supabase / export via app settings' });
  },
};
