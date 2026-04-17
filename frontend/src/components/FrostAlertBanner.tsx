'use client';

type Level = 'high' | 'medium' | 'none';

interface Props {
  level: Level;
  message: string;
}

export function FrostAlertBanner({ level, message }: Props) {
  if (level === 'none') return null;
  return (
    <div role="status" className="frost-banner" data-level={level}>
      <span>{message}</span>
    </div>
  );
}
