import { ImageResponse } from 'next/og';

export const alt = 'Lerno — an open runtime for educational visualisation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social card shared by every route; drawn with the default satori font. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0B0F19',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#3B82F6',
            }}
          />
          <div style={{ display: 'flex', fontSize: 30, color: '#94A3B8', letterSpacing: 4 }}>LERNO</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', fontSize: 82, color: '#F8FAFC', lineHeight: 1.1, maxWidth: 900 }}>
            An open runtime for educational visualisation
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#94A3B8' }}>
            scene graph · reactive model · renderer-free · MIT licensed
          </div>
        </div>

        <div style={{ display: 'flex', height: 6, width: 220, background: '#3B82F6', borderRadius: 3 }} />
      </div>
    ),
    size,
  );
}
