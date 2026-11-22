export * from './types';
export * from './builtins';
export * from './biology';
export * from './geometry';
export * from './stats';
export * from './physics';
export * from './cs';
export * from './geography';
export * from './language';
export * from './astronomy';
export * from './chemistry';
export * from './solid';
export * from './chart';

import { astronomyVisuals } from './astronomy';
import { biologyVisuals } from './biology';
import { coreVisuals } from './builtins';
import { chartVisuals } from './chart';
import { chemistryVisuals } from './chemistry';
import { csVisuals } from './cs';
import { geographyVisuals } from './geography';
import { geometryVisuals } from './geometry';
import type { Visual } from './types';
import { languageVisuals } from './language';
import { physicsVisuals } from './physics';
import { solidVisuals } from './solid';
import { statsVisuals } from './stats';

/** Çekirdekle birlikte gelen tüm disiplin visual'leri. */
export const visuals: Visual[] = [
  ...coreVisuals,
  ...biologyVisuals,
  ...chemistryVisuals,
  ...geometryVisuals,
  ...statsVisuals,
  ...physicsVisuals,
  ...csVisuals,
  ...geographyVisuals,
  ...languageVisuals,
  ...astronomyVisuals,
  ...solidVisuals,
  ...chartVisuals,
];
