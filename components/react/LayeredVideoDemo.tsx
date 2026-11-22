'use client';

import { useMemo } from 'react';
import { defineDocument } from '@medu/lerno';
import {
  InteractiveVideo,
  componentVersionErrors,
  createComponentMap,
  missingComponentTypes,
  useLessonStage,
} from '@medu/lerno-react';

const MANIFEST = {
  components: [
    { type: 'ui.switch', version: 1 },
    { type: 'ui.select', version: 1 },
    { type: 'lab.readout', version: 1 },
  ],
  variables: {
    airOn: { type: 'boolean', initial: false },
    g: { type: 'number', initial: 10, enum: [9.8, 10] },
  },
} as const;

/**
 * Pilot: manifest-driven layers on a MEB free-fall clip.
 * The document carries only component type ids; the import map lives on this page.
 */
export function LayeredVideoDemo() {
  const document = useMemo(
    () =>
      defineDocument({
        schemaVersion: 1,
        id: 'serbest-dusme-layers',
        type: 'lesson',
        metadata: {
          title: 'Serbest Düşme · Bileşen Katmanı',
          subject: 'Fizik',
          grade: 11,
        },
        assets: [
          {
            id: 'clip',
            kind: 'video',
            src: '/media/serbest-dusme-klip.mp4',
            mimeType: 'video/mp4',
          },
        ],
        components: [...MANIFEST.components],
        variables: {
          airOn: { type: 'boolean', initial: false },
          g: { type: 'number', initial: 10, enum: [9.8, 10] },
        },
        nodes: [
          {
            id: 'clip',
            type: 'media',
            assetId: 'clip',
            layers: [
              {
                id: 'air-switch',
                component: 'ui.switch',
                fromMs: 0,
                placement: { x: 0.03, y: 0.75, w: 0.27, h: 0.11 },
                props: { label: 'Hava direnci' },
                bind: { value: 'airOn' },
              },
              {
                id: 'g-select',
                component: 'ui.select',
                fromMs: 0,
                placement: { x: 0.32, y: 0.75, w: 0.2, h: 0.11 },
                props: {
                  label: 'Yerçekimi',
                  options: [
                    { value: 9.8, label: '9,8 m/s²' },
                    { value: 10, label: '10 m/s²' },
                  ],
                },
                bind: { value: 'g' },
              },
              {
                id: 'readout',
                component: 'lab.readout',
                fromMs: 0,
                placement: { x: 0.55, y: 0.66, w: 0.28, h: 0.2 },
                props: {
                  title: 'Anlık değerler',
                  rows: [
                    { label: 'Hava direnci', value: { $var: 'airOn' } },
                    { label: 'g', value: { $var: 'g' } },
                    { label: 'Model', value: 'h = ½ · g · t²' },
                  ],
                },
              },
            ],
          },
        ],
      }),
    [],
  );

  const { stage, sessionState: state, setVariable, answer } = useLessonStage(document);
  const components = useMemo(() => createComponentMap(), []);
  const missing = missingComponentTypes(document, components);
  const versionErrors = componentVersionErrors(document);
  const media = document.nodes[0];
  const asset = document.assets[0];
  if (media.type !== 'media' || !asset) return null;

  return (
    <div className="light min-h-screen w-full" style={{ background: '#faf8f1', color: '#18181b', colorScheme: 'light' }}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Fizik · 11. Sınıf · Pilot
          </span>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-zinc-900">
            Serbest düşme, bileşen katmanıyla
          </h1>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
          manifest · 3 component
        </span>
      </header>

      {missing.length > 0 || versionErrors.length > 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {missing.length > 0 ? <p className="m-0">Kayıtlı olmayan component: {missing.join(', ')}</p> : null}
          {versionErrors.length > 0 ? <p className="m-0">Sürüm uyuşmazlığı: {versionErrors.join(' · ')}</p> : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <InteractiveVideo
          node={media}
          src={asset.src}
          stage={stage}
          poster="/media/serbest-dusme-poster.jpg"
          variables={state.variables}
          onVariableChange={setVariable}
          components={components}
          answerFor={(anchorId) => state.answers[anchorId]?.outcome}
          onAnswer={(anchorId, response) => answer(anchorId, response)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="m-0 text-sm font-semibold text-zinc-900">Ne oluyor?</p>
          <p className="m-0 text-xs leading-relaxed text-zinc-600">
            Video oynarken alttaki katmanlar manifestten gelir. Anahtarı çevir, seçimi değiştir; okuma kartı
            aynı değişkenden beslendiği için anında güncellenir. Video pikseli değişmez — değişen şey
            üstündeki veri katmanıdır.
          </p>
          <p className="m-0 text-xs leading-relaxed text-zinc-500">
            Klip, MEB serbest düşme videosunun 1:40–2:10 aralığından alınmıştır.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Canlı değişkenler
          </p>
          <span className="text-sm tabular-nums text-zinc-900">airOn = {String(state.variables.airOn)}</span>
          <span className="text-sm tabular-nums text-zinc-900">g = {String(state.variables.g)}</span>
          <span className="text-[11px] leading-relaxed text-zinc-500">
            Değerler oturum state'inde; sayfayı yenilemeden katmanlar arasında paylaşılır.
          </span>
        </div>
      </div>

      <details className="group rounded-2xl border border-zinc-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-900 marker:text-zinc-400">
          Belgenin başındaki manifest
        </summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-600" style={{ fontFamily: 'inherit' }}>
          {JSON.stringify(MANIFEST, null, 2)}
        </pre>
        <p className="m-0 mt-2 text-[11px] leading-relaxed text-zinc-500">
          Veri modül yolu taşımaz. <span className="text-zinc-900">ui.switch</span> gibi tip id'leri,
          uygulamadaki loader eşlemesine çözülür; kayıtlı olmayan tip videoyu çökertmez.
        </p>
      </details>
      </div>
    </div>
  );
}
