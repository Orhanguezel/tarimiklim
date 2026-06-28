import { ImageResponse } from 'next/og';
import { createElement } from 'react';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#84f04c',
          color: '#0a0e1a',
          fontSize: 280,
          fontWeight: 800,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        },
      },
      'H',
    ),
    { ...size },
  );
}

