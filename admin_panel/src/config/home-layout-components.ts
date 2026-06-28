export const HOME_LAYOUT_COMPONENT_OPTIONS = [
  { key: 'TarimHero', label: 'Hero / üst vitrin' },
  { key: 'TarimTicker', label: 'Canlı ticker bandı' },
  { key: 'TarimDashboard', label: 'Don uyarısı paneli' },
  { key: 'TarimPillars', label: 'Modül kartları' },
  { key: 'TarimApi', label: 'API ve widget alanı' },
  { key: 'TarimStats', label: 'İstatistik bandı' },
  { key: 'TarimEcosystem', label: 'Ekosistem ızgarası' },
  { key: 'TarimFinalCta', label: 'Final CTA' },
] as const;

export const HOME_LAYOUT_COMPONENT_KEYS = HOME_LAYOUT_COMPONENT_OPTIONS.map((o) => o.key);
