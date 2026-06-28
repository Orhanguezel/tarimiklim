import { API_URL } from '@/lib/site-settings';

export type HomeSectionDto = {
  id: string;
  slug: string;
  label: string;
  component_key: string;
  order_index: number;
  is_active: number;
  config: Record<string, unknown> | null;
};

export async function fetchHomeSections(): Promise<HomeSectionDto[]> {
  try {
    const res = await fetch(`${API_URL}/home/sections`, {
      next: { revalidate: 60, tags: ['home-sections'] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    const data = Array.isArray(payload) ? payload : payload?.data;
    if (!Array.isArray(data)) return [];
    return data as HomeSectionDto[];
  } catch {
    return [];
  }
}
