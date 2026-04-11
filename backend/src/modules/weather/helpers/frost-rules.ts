export interface FrostRiskInput {
  tempMin: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
}

export type FrostSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface FrostRiskResult {
  score: number;
  severity: FrostSeverity;
  label: string;
  color: string;
}

export function calculateFrostRisk(input: FrostRiskInput): FrostRiskResult {
  let score = 0;

  // Sicaklik — %60 agirlik (en kritik faktor)
  if (input.tempMin <= -5) score += 60;
  else if (input.tempMin <= -2) score += 50;
  else if (input.tempMin <= 0) score += 40;
  else if (input.tempMin <= 2) score += 30;
  else if (input.tempMin <= 4) score += 15;

  // Nem — %15 agirlik (yuksek nem + dusuk sicaklik = don riski artar)
  if (input.humidity > 80) score += 15;
  else if (input.humidity > 60) score += 10;
  else score += 5;

  // Ruzgar — %15 agirlik (dusuk ruzgar = radyasyon donu riski)
  if (input.windSpeed < 5) score += 15;
  else if (input.windSpeed < 10) score += 8;

  // Bulut orani — %10 agirlik (acik gokyuzu = radyasyon kaybi = don riski)
  if (input.cloudCover < 20) score += 10;
  else if (input.cloudCover < 50) score += 5;

  score = Math.min(100, score);

  const severity = getSeverity(score);
  return { score, severity, ...getSeverityMeta(severity) };
}

function getSeverity(score: number): FrostSeverity {
  if (score <= 10) return 'none';
  if (score <= 30) return 'low';
  if (score <= 55) return 'medium';
  if (score <= 80) return 'high';
  return 'critical';
}

function getSeverityMeta(s: FrostSeverity): { label: string; color: string } {
  const map: Record<FrostSeverity, { label: string; color: string }> = {
    none: { label: 'Don Riski Yok', color: '#22c55e' },
    low: { label: 'Dusuk Don Riski', color: '#84cc16' },
    medium: { label: 'Orta Don Riski', color: '#eab308' },
    high: { label: 'Yuksek Don Riski', color: '#f97316' },
    critical: { label: 'Kritik Don Riski', color: '#ef4444' },
  };
  return map[s];
}
