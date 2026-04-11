'use client';

type Level = 'high' | 'medium' | 'none';

type Props = {
  level: Level;
  message: string;
};

const bg: Record<Level, string> = {
  high: '#7f1d1d',
  medium: '#9a3412',
  none: 'transparent',
};

export function FrostAlertBanner({ level, message }: Props) {
  if (level === 'none') return null;
  return (
    <div
      role="status"
      style={{
        marginTop: '1.25rem',
        padding: '0.75rem 1rem',
        borderRadius: 10,
        background: bg[level],
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.95rem',
      }}
    >
      {message}
    </div>
  );
}
