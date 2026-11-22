import { defineI18n } from 'fumadocs-core/i18n';

/**
 * Dokümantasyon dilleri. İngilizce varsayılan dildir ve URL'de ön ek almaz;
 * Türkçe sayfalar `/tr/...` altında yayınlanır.
 */
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['tr', 'en'],
  hideLocale: 'default-locale',
});

/** Dile göre iç bağlantı üretir. */
export function localizedHref(lang: string, path: string): string {
  return lang === i18n.defaultLanguage ? path : `/${lang}${path}`;
}
