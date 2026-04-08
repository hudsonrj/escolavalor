import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number | null): string {
  if (!value) return 'Gratuita';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

export function formatScore(score: string | number | null): string {
  if (!score) return 'N/A';

  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  return numScore.toFixed(2);
}

export function formatICB(icb: string | number | null): string {
  if (!icb) return 'N/A';

  const numICB = typeof icb === 'string' ? parseFloat(icb) : icb;

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numICB);
}

export function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    publica: 'Pública',
    privada: 'Privada',
    federal: 'Federal',
    tecnica: 'Técnica',
  };

  return labels[tipo] || tipo;
}

export function getTipoBadgeColor(tipo: string): string {
  const colors: Record<string, string> = {
    publica: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    privada: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    federal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    tecnica: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  return colors[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

export function getMedalIcon(nivel: string): string {
  const medals: Record<string, string> = {
    ouro: '🥇',
    prata: '🥈',
    bronze: '🥉',
    mencao: '🎖️',
  };

  return medals[nivel] || '🏅';
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-blue-600 dark:text-blue-400';
  if (score >= 4) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function getICBRating(icb: number): { label: string; color: string } {
  if (icb < 4000) return { label: 'Excelente', color: 'text-green-600 dark:text-green-400' };
  if (icb < 5000) return { label: 'Muito Bom', color: 'text-blue-600 dark:text-blue-400' };
  if (icb < 6000) return { label: 'Bom', color: 'text-yellow-600 dark:text-yellow-400' };
  if (icb < 7000) return { label: 'Regular', color: 'text-orange-600 dark:text-orange-400' };
  return { label: 'Alto', color: 'text-red-600 dark:text-red-400' };
}
