export const dict = {
  en: {
    top: 'Top', trending: 'Trending', controversial: 'Controversial',
    ask: 'Ask', signin: 'Sign in',
    ai_title: 'AI insights',
    for_summary: 'FOR (summary)', against_summary: 'AGAINST (summary)',
    missing: 'Missing angles', no_args: 'No arguments yet to summarize.',
    for_btn: 'For', against_btn: 'Against',
  },
  fr: {
    top: 'Top', trending: 'Tendances', controversial: 'Controversé',
    ask: 'Poser', signin: 'Se connecter',
    ai_title: 'Synthèse IA',
    for_summary: 'POUR (synthèse)', against_summary: 'CONTRE (synthèse)',
    missing: 'Angles non traités', no_args: 'Aucun argument à résumer.',
    for_btn: 'Pour', against_btn: 'Contre',
  },
  es: {
    top: 'Top', trending: 'Tendencias', controversial: 'Controvertido',
    ask: 'Preguntar', signin: 'Iniciar sesión',
    ai_title: 'Resumen IA',
    for_summary: 'A FAVOR (resumen)', against_summary: 'EN CONTRA (resumen)',
    missing: 'Ángulos faltantes', no_args: 'No hay argumentos para resumir.',
    for_btn: 'A favor', against_btn: 'En contra',
  },
  de: {
    top: 'Top', trending: 'Trends', controversial: 'Kontrovers',
    ask: 'Fragen', signin: 'Anmelden',
    ai_title: 'KI-Zusammenfassung',
    for_summary: 'Dafür (Kurz)', against_summary: 'Dagegen (Kurz)',
    missing: 'Fehlende Aspekte', no_args: 'Keine Argumente zum Zusammenfassen.',
    for_btn: 'Dafür', against_btn: 'Dagegen',
  }
} as const

export type Lang = keyof typeof dict

export function t(lang:Lang, key: keyof typeof dict['en']){
  // petit helper
  // @ts-ignore
  return dict[lang][key] || dict.en[key]
}
