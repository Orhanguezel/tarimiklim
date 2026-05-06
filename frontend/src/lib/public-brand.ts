import siteDefaults from '@/config/site-defaults.json';

function replaceAppName(template: string, app: string): string {
  return template.replace(/\{\{appName\}\}/g, app);
}

export function getPublicAppName(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_NAME?.trim();
  if (fromEnv) return fromEnv;
  const raw = String(siteDefaults.brand.appName || '').trim();
  return raw || 'App';
}

export function getPublicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    String(siteDefaults.site.originFallback || '').trim();
  return raw.replace(/\/+$/, '') || 'http://localhost:3088';
}

export function getCopyrightHolder(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_COPYRIGHT?.trim();
  if (fromEnv) return replaceAppName(fromEnv, getPublicAppName());
  const raw = String(siteDefaults.brand.copyrightHolder || '').trim();
  return raw ? replaceAppName(raw, getPublicAppName()) : getPublicAppName();
}

export function getDefaultLogoAlt(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LOGO_ALT?.trim();
  if (fromEnv) return fromEnv;
  const raw = String(siteDefaults.brand.defaultLogoAlt || '').trim();
  return raw ? replaceAppName(raw, getPublicAppName()) : getPublicAppName();
}

export function getOpenGraphSiteName(): string {
  return (
    process.env.NEXT_PUBLIC_OG_SITE_NAME?.trim() ||
    process.env.NEXT_PUBLIC_APP_NAME?.trim() ||
    getPublicAppName()
  );
}

export type OrganizationDefaults = typeof siteDefaults.organization;

export function getOrganizationDefaults(): OrganizationDefaults {
  return siteDefaults.organization;
}

export type ServiceDefaults = typeof siteDefaults.service;

export function getServiceDefaults(): ServiceDefaults {
  return siteDefaults.service;
}
