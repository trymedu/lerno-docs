import { z } from 'zod';
import { defineVisual, type Visual } from './types';

// ---------------------------------------------------------------------------
// morphology — Turkish suffix and stem analysis
// ---------------------------------------------------------------------------

export const MorphologyParamsSchema = z.object({
  word: z.string().min(1),
  parts: z
    .array(
      z.object({
        text: z.string().min(1),
        type: z.enum(['root', 'derivation', 'inflection']),
      }),
    )
    .min(1),
  meaning: z.string().optional(),
});

export type MorphologyParams = z.infer<typeof MorphologyParamsSchema>;

export const MorphologyStateSchema = z.object({
  word: z.string(),
  meaning: z.string().optional(),
  parts: z.array(z.object({ text: z.string(), type: z.enum(['root', 'derivation', 'inflection']) })),
});

export type MorphologyState = z.infer<typeof MorphologyStateSchema>;

export const morphologyVisual = defineVisual<MorphologyParams, MorphologyState>({
  id: 'morphology',
  paramsSchema: MorphologyParamsSchema,
  stateSchema: MorphologyStateSchema,
  state: (params) => ({ word: params.word, meaning: params.meaning, parts: params.parts }),
  presets: [
    {
      id: 'evlerimizden',
      label: 'evlerimizden',
      params: {
        word: 'evlerimizden',
        meaning: 'ev → çoğul → iyelik → ayrılma',
        parts: [
          { text: 'ev', type: 'root' },
          { text: 'ler', type: 'derivation' },
          { text: 'imiz', type: 'inflection' },
          { text: 'den', type: 'inflection' },
        ],
      },
    },
    {
      id: 'kitapci',
      label: 'kitapçı',
      params: {
        word: 'kitapçı',
        meaning: 'kitap → meslek adı türetimi',
        parts: [
          { text: 'kitap', type: 'root' },
          { text: 'çı', type: 'derivation' },
        ],
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// syntax-tree — sentence structure tree
// ---------------------------------------------------------------------------

export const SyntaxNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  parent: z.string().nullable(),
  role: z.string().optional(),
});

export const SyntaxTreeParamsSchema = z.object({
  sentence: z.string().min(1),
  nodes: z.array(SyntaxNodeSchema).min(2),
});

export type SyntaxTreeParams = z.infer<typeof SyntaxTreeParamsSchema>;

export const SyntaxTreeStateSchema = z.object({
  sentence: z.string(),
  nodes: z.array(z.object({ id: z.string(), label: z.string(), role: z.string().optional(), x: z.number(), y: z.number() })),
  edges: z.array(z.object({ from: z.string(), to: z.string() })),
  width: z.number(),
  height: z.number(),
});

export type SyntaxTreeState = z.infer<typeof SyntaxTreeStateSchema>;

const LEVEL_HEIGHT = 90;
const SIBLING_GAP = 120;

/**
 * Computes positions for every node of a sentence tree.
 * @param params - Nodes with their parent links and roles.
 * @returns Node positions sized for the drawing area.
 */
function layout(params: SyntaxTreeParams): SyntaxTreeState {
  const children = new Map<string, string[]>();
  for (const node of params.nodes) {
    if (node.parent === null) continue;
    children.set(node.parent, [...(children.get(node.parent) ?? []), node.id]);
  }

  const byId = new Map(params.nodes.map((node) => [node.id, node]));
  const positions = new Map<string, { x: number; y: number }>();
  let leafCursor = 0;

  function place(id: string, depth: number): number {
    const kids = children.get(id) ?? [];
    let x: number;
    if (kids.length === 0) {
      x = leafCursor * SIBLING_GAP;
      leafCursor += 1;
    } else {
      const xs = kids.map((kid) => place(kid, depth + 1));
      x = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    positions.set(id, { x, y: depth * LEVEL_HEIGHT });
    return x;
  }

  const roots = params.nodes.filter((node) => node.parent === null);
  roots.forEach((root) => place(root.id, 0));

  const laid = params.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    role: node.role,
    x: positions.get(node.id)?.x ?? 0,
    y: positions.get(node.id)?.y ?? 0,
  }));

  const maxX = Math.max(...laid.map((node) => node.x), 0);
  const maxY = Math.max(...laid.map((node) => node.y), 0);

  return {
    sentence: params.sentence,
    nodes: laid,
    edges: params.nodes
      .filter((node): node is typeof node & { parent: string } => node.parent !== null)
      .map((node) => ({ from: node.parent, to: node.id })),
    width: maxX + SIBLING_GAP,
    height: maxY + LEVEL_HEIGHT,
  };
}

export const syntaxTreeVisual = defineVisual<SyntaxTreeParams, SyntaxTreeState>({
  id: 'syntax-tree',
  paramsSchema: SyntaxTreeParamsSchema,
  stateSchema: SyntaxTreeStateSchema,
  state: (params) => layout(params),
  presets: [
    {
      id: 'simple',
      label: '“Ali kitabı okudu.”',
      params: {
        sentence: 'Ali kitabı okudu.',
        nodes: [
          { id: 's', label: 'Cümle', parent: null },
          { id: 'np', label: 'Özne', parent: 's', role: 'özne' },
          { id: 'ali', label: 'Ali', parent: 'np' },
          { id: 'vp', label: 'Yüklem grubu', parent: 's' },
          { id: 'obj', label: 'Nesne', parent: 'vp', role: 'belirtili nesne' },
          { id: 'kitab', label: 'kitabı', parent: 'obj' },
          { id: 'v', label: 'okudu', parent: 'vp', role: 'yüklem' },
        ],
      },
    },
  ],
});

export const languageVisuals: Visual[] = [morphologyVisual, syntaxTreeVisual];
