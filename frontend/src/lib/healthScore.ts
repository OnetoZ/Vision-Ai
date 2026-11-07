export interface HealthScoreFactors {
  seo?: number;
  content?: number;
  pricing?: number;
  stability?: number;
  [key: string]: number | undefined;
}

export function calculateHealthScore(factors: HealthScoreFactors): number {
  const values = Object.values(factors).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return 80;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / values.length);
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-rose-500';
}

export function getHealthLabel(score: number): string {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Moderate';
  return 'At Risk';
}

