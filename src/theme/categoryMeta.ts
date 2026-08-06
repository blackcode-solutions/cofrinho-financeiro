import {
  Utensils,
  Bike,
  Car,
  Shirt,
  Gamepad2,
  Smartphone,
  Home,
  HeartPulse,
  Package,
  type LucideIcon,
} from 'lucide-react-native';
import { categories } from './tokens';

export type Category = (typeof categories)[number];

export const CATEGORY_META: Record<Category, { icon: LucideIcon; color: string; bg: string }> = {
  Alimentação: { icon: Utensils, color: '#EA580C', bg: '#FFF7ED' },
  Delivery: { icon: Bike, color: '#DC2626', bg: '#FEF2F2' },
  Transporte: { icon: Car, color: '#2563EB', bg: '#EFF6FF' },
  Roupas: { icon: Shirt, color: '#DB2777', bg: '#FDF2F8' },
  Lazer: { icon: Gamepad2, color: '#DB2777', bg: '#FDF2F8' },
  Eletrônicos: { icon: Smartphone, color: '#7C3AED', bg: '#F5F3FF' },
  Casa: { icon: Home, color: '#0D9488', bg: '#F0FDFA' },
  Saúde: { icon: HeartPulse, color: '#E11D48', bg: '#FFF1F2' },
  Outros: { icon: Package, color: '#6B7280', bg: '#F3F4F6' },
};

export function getCategoryMeta(category: string) {
  if (category in CATEGORY_META) {
    return CATEGORY_META[category as Category];
  }
  return CATEGORY_META.Outros;
}
