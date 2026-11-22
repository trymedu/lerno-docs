import type { ReactNode } from 'react';
import { visualSpecs } from '@/lib/demos';
import { visualSources } from '@/lib/visual-sources';
import { VisualPreview } from './VisualPreview';
import { DocDemo } from './DocDemo';

export interface VisualDemoProps {
  /** Id of the visual to preview; ignored when `children` is provided. */
  id?: string;
  /** Custom preview for hand-built scenes such as 3D. */
  children?: ReactNode;
}

/**
 * Preview / Source panel for discipline visuals.
 *
 * Preview is the live output from the docs visual module; Source shows the same visual
 * built with `Node` and `Shape` at the low level.
 */
export function VisualDemo({ id, children }: VisualDemoProps) {
  if (children) return <>{children}</>;
  const spec = visualSpecs.find((entry) => entry.id === id);
  if (!spec) return null;
  return (
    <DocDemo source={visualSources[spec.id]}>
      <VisualPreview visualId={spec.id} params={spec.params} title={spec.label} />
    </DocDemo>
  );
}
