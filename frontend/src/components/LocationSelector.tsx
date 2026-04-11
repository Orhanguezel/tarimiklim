'use client';

export type LocationOption = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

type Props = {
  options: LocationOption[];
  valueId: string | null;
  onChange: (id: string) => void;
  label: string;
};

export function LocationSelector({ options, valueId, onChange, label }: Props) {
  if (options.length === 0) return null;
  return (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: 6, color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <select
        value={valueId ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minWidth: 220,
          padding: '0.5rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--color-border, #e4e4e7)',
          background: 'var(--color-surface, #fff)',
          color: 'var(--color-text)',
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
