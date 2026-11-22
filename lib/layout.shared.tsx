import { i18n } from './i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';
import { docsRepoUrl } from './site';

/**
 * Arayüz çevirileri. İngilizce varsayılan olarak `uiTranslations()` içinde gelir;
 * Türkçe etiketler burada tanımlanır.
 */
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    tr: {
      displayName: 'Türkçe',
      'Ask AI(AI chat button)': 'Yapay zekâya sor',
      'Choose a language(language switcher)': 'Dil seç',
      'Close Banner(banner)(aria-label)': 'Duyuruyu kapat',
      'Close Search(search dialog)(aria-label)': 'Aramayı kapat',
      'Close Sidebar(aria-label)': 'Kenar çubuğunu kapat',
      'Close Sidebar(sidebar)(aria-label)': 'Kenar çubuğunu kapat',
      'Collapse Sidebar(sidebar)(aria-label)': 'Kenar çubuğunu daralt',
      'Copied Text(code block)(aria-label)': 'Kopyalandı',
      'Copy Anchor Link(heading anchor)(aria-label)': 'Bağlantıyı kopyala',
      'Copy Link(accordion)(aria-label)': 'Bağlantıyı kopyala',
      'Copy Markdown(page actions)': 'Markdown olarak kopyala',
      'Copy Text(code block)(aria-label)': 'Metni kopyala',
      'Dark(theme switcher)(aria-label)': 'Koyu',
      'Default(type table)': 'Varsayılan',
      'Edit on GitHub(edit page)': 'GitHub’da düzenle',
      'Hide Sidebar(sidebar)': 'Kenar çubuğunu gizle',
      'Last updated on(page footer)': 'Son güncelleme',
      'Layout Tab(layout tab trigger)': 'Sekme',
      'Light(theme switcher)(aria-label)': 'Açık',
      'Next Page(pagination)': 'Sonraki sayfa',
      'No Headings(table of contents)': 'Başlık yok',
      'No results found(search dialog)': 'Sonuç bulunamadı',
      'On this page(table of contents)': 'Bu sayfada',
      'Open Search(search trigger)(aria-label)': 'Aramayı aç',
      'Open Sidebar(sidebar)(aria-label)': 'Kenar çubuğunu aç',
      'Open in ChatGPT(page actions)': 'ChatGPT’de aç',
      'Open in Claude(page actions)': 'Claude’da aç',
      'Open in Cursor(page actions)': 'Cursor’da aç',
      'Open in GitHub(page actions)': 'GitHub’da aç',
      'Open in Scira AI(page actions)': 'Scira AI’da aç',
      'Open(page actions)': 'Aç',
      'Parameters(type table)': 'Parametreler',
      'Previous Page(pagination)': 'Önceki sayfa',
      'Prop(type table)': 'Özellik',
      'Read {url}, I want to ask questions about it.(page actions)':
        '{url} adresini oku, bununla ilgili soru sormak istiyorum.',
      'Returns(type table)': 'Döndürür',
      'Search(search dialog)': 'Ara',
      'Search(search trigger)': 'Ara',
      'Show Sidebar(sidebar)': 'Kenar çubuğunu göster',
      'System(theme switcher)(aria-label)': 'Sistem',
      'Table of Contents(inline table of contents)': 'İçindekiler',
      'Toggle Menu(mobile menu)(aria-label)': 'Menüyü aç/kapat',
      'Toggle Theme(theme switcher)(aria-label)': 'Temayı değiştir',
      'Type(type table)': 'Tip',
      'View as Markdown(page actions)': 'Markdown olarak görüntüle',
    } as Record<string, string>,
    en: {
      displayName: 'English',
    },
  });

export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    githubUrl: docsRepoUrl,
    nav: {
      title: appName,
    },
  };
}
