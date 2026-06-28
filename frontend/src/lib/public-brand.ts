import siteDefaults from '@/config/site-defaults.json';
import {
  getPublicAppName as getPublicAppNameBase,
  getPublicSiteUrl as getPublicSiteUrlBase,
  getCopyrightHolder as getCopyrightHolderBase,
  getDefaultLogoAlt as getDefaultLogoAltBase,
  getOpenGraphSiteName as getOpenGraphSiteNameBase,
} from '@agro/shared-frontend/brand';

// Tarımİklim bu fonksiyonları project-local `site-defaults.json` ile override eder.
export function getPublicAppName(): string {
  return getPublicAppNameBase(process.env);
}

export function getPublicSiteUrl(): string {
  return getPublicSiteUrlBase(process.env);
}

export function getCopyrightHolder(): string {
  // shared-frontend default json'una değil; env varsa onu kullanır. Burada yerel json ile destekleyelim.
  const fromEnv = process.env.NEXT_PUBLIC_APP_COPYRIGHT?.trim();
  if (fromEnv) return getCopyrightHolderBase(process.env);
  const raw = String(siteDefaults.brand.copyrightHolder || '').trim();
  return raw.replace(/\{\{appName\}\}/g, getPublicAppName()) || getPublicAppName();
}

export function getDefaultLogoAlt(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LOGO_ALT?.trim();
  if (fromEnv) return getDefaultLogoAltBase(process.env);
  const raw = String(siteDefaults.brand.defaultLogoAlt || '').trim();
  return raw.replace(/\{\{appName\}\}/g, getPublicAppName()) || getPublicAppName();
}

export function getOpenGraphSiteName(): string {
  return getOpenGraphSiteNameBase(process.env);
}

export type OrganizationDefaults = typeof siteDefaults.organization;
export function getOrganizationDefaults(): OrganizationDefaults {
  return siteDefaults.organization;
}

export type ServiceDefaults = typeof siteDefaults.service;
export function getServiceDefaults(): ServiceDefaults {
  return siteDefaults.service;
}
