'use client';

import { useState } from 'react';
import { Readout, Select, Slider, Switch } from '@medu/lerno-react';
import { useDocsLang } from './use-docs-lang';

function ExampleCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <header className="flex flex-col gap-0.5">
        <h3 className="m-0 text-sm font-semibold text-zinc-900">{title}</h3>
        <p className="m-0 text-[11px] text-zinc-500">{note}</p>
      </header>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

const labels = {
  en: {
    switchNote: 'boolean value; binds immediately.',
    selectNote: 'not a native menu; a custom listbox.',
    sliderNote: 'numeric range; mass selection.',
    bound: 'Bound variable',
    status: 'Status',
    model: 'Model',
    massEffect: 'Mass effect',
    massEffectValue: 'none in free fall',
    airResistance: 'Air resistance',
    gravity: 'Gravity',
    mass: 'Mass',
    on: 'On',
    off: 'Off',
    gravityOptions: [
      { value: '10', label: '10 m/s²' },
      { value: '9.8', label: '9.8 m/s²' },
    ],
  },
  tr: {
    switchNote: 'boolean değer; anında bağlanır.',
    selectNote: 'native menü değil; özel listbox.',
    sliderNote: 'sayısal aralık; kütle seçimi.',
    bound: 'Bağlı değişken',
    status: 'Durum',
    model: 'Model',
    massEffect: 'Kütle etkisi',
    massEffectValue: 'serbest düşmede yok',
    airResistance: 'Hava direnci',
    gravity: 'Yerçekimi',
    mass: 'Kütle',
    on: 'Açık',
    off: 'Kapalı',
    gravityOptions: [
      { value: '10', label: '10 m/s²' },
      { value: '9.8', label: '9,8 m/s²' },
    ],
  },
};

/** Three live component examples for the docs: switch, select, slider. */
export function ComponentExamples() {
  const t = labels[useDocsLang()];
  const [airOn, setAirOn] = useState(false);
  const [gravity, setGravity] = useState<'10' | '9.8'>('10');
  const [mass, setMass] = useState(500);

  return (
    <div className="not-prose grid gap-4 md:grid-cols-3">
      <ExampleCard title="01 · Switch" note={t.switchNote}>
        <Switch label={t.airResistance} value={airOn} onChange={(value) => setAirOn(value === true)} />
        <Readout
          title={t.bound}
          rows={[
            { label: 'airOn', value: airOn ? t.on : t.off },
            { label: t.status, value: airOn ? t.on : t.off },
          ]}
        />
      </ExampleCard>

      <ExampleCard title="02 · Select" note={t.selectNote}>
        <Select
          label={t.gravity}
          value={gravity}
          onChange={(value) => setGravity(value === '9.8' ? '9.8' : '10')}
          options={t.gravityOptions}
        />
        <Readout
          title={t.bound}
          rows={[
            { label: 'g', value: gravity },
            { label: t.model, value: 'h = ½ · g · t²' },
          ]}
        />
      </ExampleCard>

      <ExampleCard title="03 · Slider" note={t.sliderNote}>
        <Slider label={t.mass} min={5} max={5000} step={5} value={mass} onChange={(value) => setMass(typeof value === 'number' ? value : 500)} unit="g" />
        <Readout
          title={t.bound}
          rows={[
            { label: 'mass', value: `${mass} g` },
            { label: t.massEffect, value: t.massEffectValue },
          ]}
        />
      </ExampleCard>
    </div>
  );
}
