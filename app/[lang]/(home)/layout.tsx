import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

/**
 * The landing page carries its own header: the shared docs header assumes the
 * light page background and would be unreadable over the dark hero.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout nav={{ enabled: false }}>{children}</HomeLayout>;
}
