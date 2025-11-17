import { SobrietyCategory, LifeEventCategory } from '@/types/tally';

export interface CategoryOption {
  value: SobrietyCategory | LifeEventCategory;
  label: string;
  emoji: string;
  icon: string;
  color: string;
}

export const SOBRIETY_OPTIONS: CategoryOption[] = [
  { value: 'alcohol', label: 'Alcohol', emoji: '🍺', icon: '🍺', color: '#FF6B6B' },
  { value: 'vaping', label: 'Vaping', emoji: '💨', icon: '💨', color: '#4ECDC4' },
  { value: 'marijuana', label: 'Marijuana', emoji: '🌿', icon: '🌿', color: '#95E1D3' },
  { value: 'nicotine', label: 'Nicotine', emoji: '🚬', icon: '🚬', color: '#FFB6B9' },
  { value: 'opioids', label: 'Opioids', emoji: '💊', icon: '💊', color: '#FFA07A' },
  { value: 'meth', label: 'Meth', emoji: '⚡', icon: '⚡', color: '#FF8C94' },
  { value: 'cocaine', label: 'Cocaine', emoji: '❄️', icon: '❄️', color: '#A8E6CF' },
  { value: 'pills', label: 'Pills', emoji: '💊', icon: '💊', color: '#FFD3B6' },
  { value: 'energy-drinks', label: 'Energy Drinks', emoji: '⚡', icon: '⚡', color: '#FFAAA5' },
  { value: 'other-sobriety', label: 'Other', emoji: '🎯', icon: '🎯', color: '#B4A7D6' },
];

export const LIFE_EVENT_OPTIONS: CategoryOption[] = [
  { value: 'breakup', label: 'Breakup', emoji: '💔', icon: '💔', color: '#FF6B9D' },
  { value: 'therapy', label: 'Starting Therapy', emoji: '🧠', icon: '🧠', color: '#6BCF7F' },
  { value: 'faith', label: 'Finding Faith', emoji: '✨', icon: '✨', color: '#FFD93D' },
  { value: 'no-porn', label: 'No Porn', emoji: '🚫', icon: '🚫', color: '#A8DADC' },
  { value: 'no-junk-food', label: 'No Junk Food', emoji: '🥗', icon: '🥗', color: '#90BE6D' },
  { value: 'no-social-media', label: 'No Social Media', emoji: '📵', icon: '📵', color: '#577590' },
  { value: 'working-out', label: 'Working Out', emoji: '💪', icon: '💪', color: '#F94144' },
  { value: 'business', label: 'Starting a Business', emoji: '🚀', icon: '🚀', color: '#F3722C' },
  { value: 'journaling', label: 'Journaling Daily', emoji: '📝', icon: '📝', color: '#F8961E' },
  { value: 'meditation', label: 'Meditation', emoji: '🧘', icon: '🧘', color: '#90E0EF' },
  { value: 'other-life', label: 'Custom', emoji: '⭐', icon: '⭐', color: '#C77DFF' },
];

export const MILESTONES = [
  { days: 1, label: '1 Day' },
  { days: 3, label: '3 Days' },
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '1 Month' },
  { days: 60, label: '2 Months' },
  { days: 90, label: '3 Months' },
  { days: 100, label: '100 Days' },
  { days: 180, label: '6 Months' },
  { days: 365, label: '1 Year' },
];

export function getCategoryOption(category: string, subcategory?: string): CategoryOption {
  const found = [...SOBRIETY_OPTIONS, ...LIFE_EVENT_OPTIONS].find(opt => opt.value === category);
  return found || { value: category as any, label: category, emoji: '🎯', icon: '🎯', color: '#B4A7D6' };
}
