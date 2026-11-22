'use client';

import { useState } from 'react';
import { Button, Readout, Select, Slider, Switch } from '@medu/lerno-react';
import { useDocsLang } from './use-docs-lang';

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="not-prose flex max-w-sm flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4">{children}</div>;
}

const labels = {
  en: {
    variable: 'Variable',
    reset: 'Reset',
    confirm: 'Confirm',
    confirmed: 'Confirmed',
    gravity: 'Gravity',
    mass: 'Mass',
    airResistance: 'Air resistance',
    liveValues: 'Live values',
    air: 'Air',
    height: 'Height',
    on: 'On',
    off: 'Off',
    gravityOptions: [
      { value: '10', label: '10 m/s²' },
      { value: '9.8', label: '9.8 m/s²' },
    ],
    heightValue: '42.5 m',
  },
  tr: {
    variable: 'Değişken',
    reset: 'Sıfırla',
    confirm: 'Onayla',
    confirmed: 'Onaylandı',
    gravity: 'Yerçekimi',
    mass: 'Kütle',
    airResistance: 'Hava direnci',
    liveValues: 'Anlık değerler',
    air: 'Hava',
    height: 'Yükseklik',
    on: 'Açık',
    off: 'Kapalı',
    gravityOptions: [
      { value: '10', label: '10 m/s²' },
      { value: '9.8', label: '9,8 m/s²' },
    ],
    heightValue: '42,5 m',
  },
};

export function SwitchDemo() {
  const t = labels[useDocsLang()];
  const [airOn, setAirOn] = useState(false);
  return (
    <Frame>
      <Switch label={t.airResistance} value={airOn} onChange={(value) => setAirOn(value === true)} />
      <Readout title={t.variable} rows={[{ label: 'airOn', value: airOn ? t.on : t.off }]} />
    </Frame>
  );
}

export function ButtonDemo() {
  const t = labels[useDocsLang()];
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Frame>
      <Button label={confirmed ? t.confirmed : t.confirm} value={confirmed} onChange={(value) => setConfirmed(value === true)} />
      <Readout title={t.variable} rows={[{ label: 'confirmed', value: confirmed ? t.on : t.off }]} />
      <button type="button" onClick={() => setConfirmed(false)} className="self-start text-[11px] text-zinc-500 underline">
        {t.reset}
      </button>
    </Frame>
  );
}

export function SelectDemo() {
  const t = labels[useDocsLang()];
  const [gravity, setGravity] = useState<'10' | '9.8'>('10');
  return (
    <Frame>
      <Select
        label={t.gravity}
        value={gravity}
        onChange={(value) => setGravity(value === '9.8' ? '9.8' : '10')}
        options={t.gravityOptions}
      />
      <Readout title={t.variable} rows={[{ label: 'g', value: gravity }]} />
    </Frame>
  );
}

export function SliderDemo() {
  const t = labels[useDocsLang()];
  const [mass, setMass] = useState(500);
  return (
    <Frame>
      <Slider label={t.mass} min={5} max={5000} step={5} value={mass} onChange={(value) => setMass(typeof value === 'number' ? value : 500)} unit="g" />
      <Readout title={t.variable} rows={[{ label: 'mass', value: `${mass} g` }]} />
    </Frame>
  );
}

export function ReadoutDemo() {
  const t = labels[useDocsLang()];
  const [airOn, setAirOn] = useState(true);
  return (
    <Frame>
      <Switch label={t.airResistance} value={airOn} onChange={(value) => setAirOn(value === true)} />
      <Readout
        title={t.liveValues}
        rows={[
          { label: t.air, value: airOn ? t.on : t.off },
          { label: 'g', value: '10 m/s²' },
          { label: t.height, value: t.heightValue },
        ]}
      />
    </Frame>
  );
}
