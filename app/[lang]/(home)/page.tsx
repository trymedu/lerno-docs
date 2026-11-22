import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { localizedHref } from '@/lib/i18n';
import { repoUrl } from '@/lib/site';
import { HeroBackdrop } from '@/components/home/HeroBackdrop';
import { ScrollReveal } from '@/components/home/ScrollReveal';

type Copy = {
  nav: { docs: string; react: string };
  hero: {
    tagline: string;
    lede: string;
    primary: string;
    secondary: string;
  };
};

const copy: Record<'tr' | 'en', Copy> = {
  tr: {
    nav: { docs: 'Dokümantasyon', react: 'Lerno React' },
    hero: {
      tagline: 'Eğitim görselleştirmeleri için açık bir çalışma zamanı',
      lede: 'Tek bir deklaratif çekirdek yazılır; aynı sahne SVG, Canvas, WebGL ve headless hedeflere çizilir. İçerik tipleri bu çekirdeğin üstünde duran değiştirilebilir reçetelerdir.',
      primary: 'Dokümantasyona başla',
      secondary: '3B demoyu gör',
    },
  },
  en: {
    nav: { docs: 'Documentation', react: 'Lerno React' },
    hero: {
      tagline: 'An open runtime for educational visualization',
      lede: 'Write one declarative core and render the same scene to SVG, Canvas, WebGL and headless targets. Content types are replaceable recipes on top of that core.',
      primary: 'Start with the docs',
      secondary: 'Open the 3D demo',
    },
  },
};

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function Action({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <Link href={href} className={`l-btn l-btn-${variant}`}>
      {children}
    </Link>
  );
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = lang === 'tr' ? copy.tr : copy.en;
  const otherLang = lang === 'tr' ? 'en' : 'tr';
  const otherHref = otherLang === 'en' ? '/' : '/tr';

  return (
    <>
      <ScrollReveal />

      <div className="l-page">
        <header className="l-nav">
          <div className="l-nav-inner">
            <Link href={localizedHref(lang, '/')} className="l-brand">
              Lerno
            </Link>

            <nav className="l-nav-links">
              <Link href={localizedHref(lang, '/docs/getting-started')} className="l-nav-link">
                {t.nav.docs}
              </Link>
              <Link href={localizedHref(lang, '/docs/react/getting-started')} className="l-nav-link">
                {t.nav.react}
              </Link>
            </nav>

            <a
              href={repoUrl}
              className="l-nav-github"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <GitHubMark className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            <Link href={otherHref} className="l-nav-lang" hrefLang={otherLang}>
              {otherLang.toUpperCase()}
            </Link>
          </div>
        </header>

        <section className="l-hero">
          <HeroBackdrop />

          <div className="l-hero-copy">
            <h1 className="l-wordmark">Lerno</h1>
            <p className="l-tagline">{t.hero.tagline}</p>
            <p className="l-lede">{t.hero.lede}</p>

            <div className="l-actions">
              <Action href={localizedHref(lang, '/docs/getting-started')}>
                {t.hero.primary}
                <ArrowRight className="h-4 w-4" />
              </Action>
              <Action href={localizedHref(lang, '/docs/concepts/three')} variant="ghost">
                {t.hero.secondary}
              </Action>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
