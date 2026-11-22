import { z } from 'zod';
import { defineVisual, type Visual } from './types';

const ELEMENTS: Record<number, { symbol: string; name: string }> = {
  1: { symbol: 'H', name: 'Hidrojen' },
  2: { symbol: 'He', name: 'Helyum' },
  3: { symbol: 'Li', name: 'Lityum' },
  4: { symbol: 'Be', name: 'Berilyum' },
  5: { symbol: 'B', name: 'Bor' },
  6: { symbol: 'C', name: 'Karbon' },
  7: { symbol: 'N', name: 'Azot' },
  8: { symbol: 'O', name: 'Oksijen' },
  9: { symbol: 'F', name: 'Flor' },
  10: { symbol: 'Ne', name: 'Neon' },
  11: { symbol: 'Na', name: 'Sodyum' },
  12: { symbol: 'Mg', name: 'Magnezyum' },
  13: { symbol: 'Al', name: 'Alüminyum' },
  14: { symbol: 'Si', name: 'Silisyum' },
  15: { symbol: 'P', name: 'Fosfor' },
  16: { symbol: 'S', name: 'Kükürt' },
  17: { symbol: 'Cl', name: 'Klor' },
  18: { symbol: 'Ar', name: 'Argon' },
  19: { symbol: 'K', name: 'Potasyum' },
  20: { symbol: 'Ca', name: 'Kalsiyum' },
};

const SHELL_CAPS = [2, 8, 8, 2];

export const BohrParamsSchema = z.object({
  atomicNumber: z.number().int().min(1).max(20),
});

export type BohrParams = z.infer<typeof BohrParamsSchema>;

export const BohrStateSchema = z.object({
  atomicNumber: z.number().int(),
  symbol: z.string(),
  name: z.string(),
  shells: z.array(z.number().int()),
});

export type BohrState = z.infer<typeof BohrStateSchema>;

/**
 * Distributes electrons across shells following the two-eight-eight rule.
 * @param electrons - Atomic number of the element.
 * @returns Electron count per shell, in order from the innermost.
 */
function fillShells(electrons: number): number[] {
  const shells: number[] = [];
  let remaining = electrons;
  for (const cap of SHELL_CAPS) {
    if (remaining <= 0) break;
    const count = Math.min(cap, remaining);
    shells.push(count);
    remaining -= count;
  }
  return shells;
}

/** Bohr atom modeli — elektron katmanları. */
export const bohrAtomVisual = defineVisual<BohrParams, BohrState>({
  id: 'bohr-atom',
  paramsSchema: BohrParamsSchema,
  stateSchema: BohrStateSchema,
  state: (params) => {
    const element = ELEMENTS[params.atomicNumber] ?? { symbol: '?', name: 'Bilinmeyen' };
    return {
      atomicNumber: params.atomicNumber,
      symbol: element.symbol,
      name: element.name,
      shells: fillShells(params.atomicNumber),
    };
  },
  presets: [
    { id: 'h', label: 'Hidrojen', params: { atomicNumber: 1 } },
    { id: 'c', label: 'Karbon', params: { atomicNumber: 6 } },
    { id: 'o', label: 'Oksijen', params: { atomicNumber: 8 } },
    { id: 'na', label: 'Sodyum', params: { atomicNumber: 11 } },
    { id: 'ca', label: 'Kalsiyum', params: { atomicNumber: 20 } },
  ],
});

export const chemistryVisuals: Visual[] = [bohrAtomVisual];
