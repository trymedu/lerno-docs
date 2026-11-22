import { ScenePlayer, type SceneName } from '@/components/react/ScenePlayer';

export interface MotionSampleProps {
  kicker: string;
  title: string;
  description: string;
  skillHref: string;
  scene: SceneName;
  exportPath: string;
  stats: { label: string; value: string }[];
  beats: { time: string; label: string; src: string }[];
  notes: { title: string; items: string[] };
  scenePath: string;
}

/**
 * Shared layout for the hidden motion samples: one video, its measured numbers,
 * the frames that were inspected, and the decisions the skill forced.
 */
export function MotionSample({
  kicker,
  title,
  description,
  skillHref,
  scene,
  exportPath,
  stats,
  beats,
  notes,
  scenePath,
}: MotionSampleProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <a
        href={skillHref}
        className="text-xs text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
      >
        ← lerno-motion skill
      </a>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">{kicker}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fd-foreground">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">{description}</p>

      <div className="mt-8">
        <ScenePlayer scene={scene} title={title} />
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fd-muted-foreground">
        {stats.map((stat) => (
          <div key={stat.label} className="flex gap-1.5">
            <dt>{stat.label}</dt>
            <dd className="text-fd-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-fd-foreground">İncelenen kareler</h2>
        <p className="mt-1 text-xs text-fd-muted-foreground">
          Her kare, storyboard’un adlandırdığı saniyede çıkarıldı; teslimden önce tek tek açıldı.
        </p>
        <div className={`mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 ${beats.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          {beats.map((beat) => (
            <figure key={beat.src} className="m-0 flex flex-col gap-1.5">
              <img src={beat.src} alt={beat.label} className="w-full rounded-lg border border-fd-border bg-[#FAF8F1]" />
              <figcaption className="text-[11px] leading-snug text-fd-muted-foreground">
                <span className="text-fd-foreground">{beat.time}</span> — {beat.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-2xl">
        <h2 className="text-sm font-semibold text-fd-foreground">{notes.title}</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-fd-muted-foreground">
          {notes.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-xs text-fd-muted-foreground">
        Skill:{' '}
        <a href={skillHref} className="text-fd-foreground underline-offset-4 hover:underline">
          lerno-motion
        </a>
        {' · '}
        Sahne: <code className="text-fd-foreground">{scenePath}</code>
        {' · '}
        <a href={exportPath} className="text-fd-foreground underline-offset-4 hover:underline">
          MP4
        </a>
      </p>
    </main>
  );
}
