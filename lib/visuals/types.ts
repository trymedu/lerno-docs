import { z } from 'zod';

export interface VisualVariant {
  id: string;
  label?: string;
  params: unknown;
}

/**
 * Discipline visual: a pure, deterministic, and serializable simulation.
 * It depends on neither the DOM nor React nor the application; it returns plain
 * data for a given time. The same visual can run as an embedded visual, a media
 * anchor, a question, or a live session.
 */
export interface Visual {
  id: string;
  paramsSchema: z.ZodTypeAny;
  /** Üretilen durumun şeması; renderer ve doğrulama bunu kullanır. */
  stateSchema: z.ZodTypeAny;
  /**
   * Produces the view state of the visual at a point in time.
   * @param params - Visual parameters, validated by the visual's own schema.
   * @param timeMs - Position on the timeline in milliseconds.
   * @returns The state, passed to the visual's renderer.
   */
  state(params: unknown, timeMs: number): unknown;
  presets: VisualVariant[];
}

/**
 * Type-safe visual definition.
 * Incoming parameters are validated by schema, and state only works on narrowed
 * types, so no any is involved.
 */
export function defineVisual<P, S>(config: {
  id: string;
  paramsSchema: z.ZodType<P>;
  stateSchema: z.ZodType<S>;
  /**
   * Produces the typed view state of the visual at a point in time.
   * @param params - Visual parameters, typed by the visual's schema.
   * @param timeMs - Position on the timeline in milliseconds.
   * @returns The typed state, passed to the visual's renderer.
   */
  state(params: P, timeMs: number): S;
  presets?: { id: string; label?: string; params: P }[];
}): Visual {
  return {
    id: config.id,
    paramsSchema: config.paramsSchema,
    stateSchema: config.stateSchema,
    state: (params, timeMs) => config.state(config.paramsSchema.parse(params), timeMs),
    presets: (config.presets ?? []).map((preset) => ({ id: preset.id, label: preset.label, params: preset.params })),
  };
}
