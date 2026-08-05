import { XP_PER_LEVEL, pigStages, type PigStage } from '@/src/theme/tokens';
import type { TemptationResult } from '@/src/types';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseCurrencyInput(text: string): number {
  const cleaned = text.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function suggestedSaveAmount(salary: number, pct: number): number {
  return Math.round((salary * pct) / 100);
}

export function calculateTemptation(
  productValue: number,
  salary: number,
  monthlyGoal: number,
  monthlySaveRate: number,
): TemptationResult {
  const hourly = salary > 0 ? salary / 160 : 0;
  const hoursWorked = hourly > 0 ? Math.round(productValue / hourly) : 0;
  const goalPercent = monthlyGoal > 0 ? Math.round((productValue / monthlyGoal) * 100) : 0;
  const daysDelay =
    monthlySaveRate > 0 ? Math.round((productValue / monthlySaveRate) * 30) : 0;
  const carDownPaymentPercent = Math.round((productValue / 15000) * 100);

  return {
    hoursWorked,
    goalPercent,
    daysDelay,
    carDownPaymentPercent: Math.min(carDownPaymentPercent, 100),
  };
}

export function xpProgress(xp: number, level: number) {
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const intoLevel = xp - currentLevelXp;
  return {
    intoLevel: Math.max(0, intoLevel),
    needed: XP_PER_LEVEL,
    percent: Math.min(100, Math.round((Math.max(0, intoLevel) / XP_PER_LEVEL) * 100)),
  };
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function pigStageFromLevel(level: number): PigStage {
  let stage: PigStage = 'baby';
  for (const s of pigStages) {
    if (level >= s.minLevel) stage = s.id;
  }
  return stage;
}

export function cardUsagePercent(bill: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((bill / limit) * 100));
}

export function cardStatus(percent: number): {
  label: string;
  color: string;
  tone: 'success' | 'warning' | 'error';
} {
  if (percent >= 80) return { label: 'Atenção', color: '#EF4444', tone: 'error' };
  if (percent >= 50) return { label: 'Moderado', color: '#F59E0B', tone: 'warning' };
  return { label: 'Controlado', color: '#16A34A', tone: 'success' };
}

export function isPayday(payday: number, date = new Date()): boolean {
  return date.getDate() === payday;
}
