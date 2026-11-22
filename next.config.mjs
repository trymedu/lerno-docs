import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@medu/lerno', '@medu/lerno-motion', '@medu/lerno-react', '@medu/lerno-three'],
  async redirects() {
    const moved = ['node', 'vector2', 'matrix3', 'property', 'shape', 'coordinate-plane'];
    const apiMembers = moved.map((name) => ({
      source: `/docs/api/${name}`,
      destination: `/docs/api/classes/${name}`,
      permanent: true,
    }));
    const apiMembersTr = moved.map((name) => ({
      source: `/tr/docs/api/${name}`,
      destination: `/tr/docs/api/classes/${name}`,
      permanent: true,
    }));
    return [
      { source: '/docs', destination: '/docs/getting-started', permanent: false },
      { source: '/tr/docs', destination: '/tr/docs/getting-started', permanent: false },
      { source: '/docs/react', destination: '/docs/react/getting-started', permanent: false },
      { source: '/tr/docs/react', destination: '/tr/docs/react/getting-started', permanent: false },
      // compatibility with the previous scheme, where English carried the /en prefix
      { source: '/en/docs/react', destination: '/docs/react/getting-started', permanent: false },
      { source: '/en/docs', destination: '/docs/getting-started', permanent: false },
      ...apiMembers,
      ...apiMembersTr,
    ];
  },
};

export default withMDX(config);
