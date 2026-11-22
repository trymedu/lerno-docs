import type { Node } from '@medu/lerno';

/**
 * Renders a node tree as pretty JSON for the docs.
 *
 * `toRender()` attaches the owning node as `source` on input-enabled elements, which makes the
 * structure circular. That key is dropped here so the output stays serializable; everything else,
 * including the geometry a `Shape` carries, is kept as-is.
 *
 * @param node - Root of the scene graph to serialize.
 * @returns Pretty-printed JSON of the render tree.
 */
export function renderTreeJson(node: Node): string {
  return JSON.stringify(node.toRender(), (key, value) => (key === 'source' ? undefined : value), 2);
}
