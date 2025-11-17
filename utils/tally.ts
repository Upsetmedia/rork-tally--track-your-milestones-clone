import { MILESTONES } from '@/constants/tallies';

export function calculateTimeElapsed(startDate: number) {
  const now = Date.now();
  const diff = now - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalDays: days };
}

export function calculateMoneySaved(dailyCost: number, startDate: number) {
  const { totalDays } = calculateTimeElapsed(startDate);
  return dailyCost * totalDays;
}

export function getNextMilestone(totalDays: number) {
  const nextMilestone = MILESTONES.find(m => m.days > totalDays);
  return nextMilestone || null;
}

export function getAchievedMilestones(totalDays: number) {
  return MILESTONES.filter(m => m.days <= totalDays);
}

export function formatTime(days: number, hours: number, minutes: number, seconds?: number) {
  if (days === 0) {
    if (seconds !== undefined) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m`;
  }
  if (seconds !== undefined) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  return `${days}d ${hours}h ${minutes}m`;
}

export function calculateMonthsAndDays(startDate: number, currentTimestamp: number = Date.now()) {
  const start = new Date(startDate);
  const end = new Date(currentTimestamp);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() < start.getTime()) {
    return { months: 0, days: 0 };
  }

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  let anchor = new Date(start);
  anchor.setMonth(start.getMonth() + months);

  if (anchor.getTime() > end.getTime()) {
    months -= 1;
    anchor = new Date(start);
    anchor.setMonth(start.getMonth() + months);
  }

  if (months < 0) {
    months = 0;
    anchor = new Date(start);
  }

  const diffMs = end.getTime() - anchor.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  return { months, days };
}

export function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}
