// =============================================================
// FILE: src/navigation/sidebar/sidebar-items.ts
// Sidebar items — labels from site_settings.ui_admin, locale JSON (admin.sidebar.groups / admin.dashboard.items), then neutral fallbacks.
// - Dashboard base: /admin/dashboard
// - Admin pages: /admin/...  (route group "(admin)" URL'e dahil olmaz)
// =============================================================

import {
  BarChart,
  Bell,
  Bot,
  Calendar,
  Image as ImageIcon,
  Tag,
  CreditCard,
  Database,
  FileSearch,
  HardDrive,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Package,
  Receipt,
  Send,
  Settings,
  Trash2,
  ThermometerSun,
  UserCheck,
  Users,
  Menu as MenuIcon,
  type LucideIcon,
} from 'lucide-react';
import type { TranslateFn } from '@/i18n';

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  /** Optional dynamic badge (e.g. unread count) */
  badgeKey?: string;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export type AdminNavItemKey =
  | 'dashboard'
  | 'site_settings'
  | 'reviews'
  | 'mail'
  | 'users'
  | 'email_templates'
  | 'notifications'
  | 'storage'
  | 'db'
  | 'audit'
  | 'support'
  | 'chat'
  | 'wallet'
  | 'orders'
  | 'payment_settings'
  | 'announcements'
  | 'subscriptions'
  | 'subscription_plans'
  | 'cache'
  | 'llm_prompts'
  | 'banners'
  | 'campaigns'
  | 'navigation'
  | 'home_layout'
  | 'user_roles'
  | 'reports'
  | 'availability'
  | 'tarimiklim_hub'
  | 'tarimiklim_locations'
  | 'tarimiklim_alerts'
  | 'tarimiklim_alert_rules'
  | 'tarimiklim_alert_subscriptions'
  | 'telegram';

export type AdminNavGroupKey =
  | 'general'
  | 'content'
  | 'marketing'
  | 'communication'
  | 'system'
  | 'tarimiklim';

export type AdminNavConfigItem = {
  key: AdminNavItemKey;
  url: string;
  icon?: LucideIcon;
  badgeKey?: string;
};

export type AdminNavConfigGroup = {
  id: number;
  key: AdminNavGroupKey;
  items: AdminNavConfigItem[];
};

export const adminNavConfig: AdminNavConfigGroup[] = [
  {
    id: 1,
    key: 'general',
    items: [
      { key: 'dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
      { key: 'users', url: '/admin/users', icon: Users },
      { key: 'user_roles', url: '/admin/user-roles', icon: UserCheck },
      { key: 'orders', url: '/admin/orders', icon: Package },
      { key: 'subscriptions', url: '/admin/subscriptions', icon: CreditCard },
      { key: 'subscription_plans', url: '/admin/subscription-plans', icon: Receipt },
    ],
  },
  {
    id: 2,
    key: 'communication',
    items: [
      { key: 'reviews', url: '/admin/reviews', icon: MessageSquare },
      { key: 'support', url: '/admin/support', icon: MessageCircle },
      { key: 'announcements', url: '/admin/announcements', icon: Megaphone },
      { key: 'notifications', url: '/admin/notifications', icon: Bell, badgeKey: 'notifications_unread' },
      { key: 'email_templates', url: '/admin/email-templates', icon: Mail },
      { key: 'chat', url: '/admin/chat', icon: Bot },
      { key: 'telegram', url: '/admin/telegram', icon: Send },
    ],
  },
  {
    id: 3,
    key: 'marketing',
    items: [
      { key: 'banners', url: '/admin/banners', icon: ImageIcon },
      { key: 'campaigns', url: '/admin/campaigns', icon: Tag },
    ],
  },
  {
    id: 4,
    key: 'system',
    items: [
      { key: 'site_settings', url: '/admin/site-settings', icon: Settings },
      { key: 'navigation', url: '/admin/navigation', icon: MenuIcon },
      { key: 'home_layout', url: '/admin/home-layout', icon: LayoutDashboard },
      { key: 'cache', url: '/admin/cache', icon: Trash2 },
      { key: 'wallet', url: '/admin/wallet', icon: Receipt },
      { key: 'payment_settings', url: '/admin/payment-settings', icon: CreditCard },
      { key: 'mail', url: '/admin/mail', icon: Send },
      { key: 'storage', url: '/admin/storage', icon: HardDrive },
      { key: 'db', url: '/admin/db', icon: Database },
      { key: 'audit', url: '/admin/audit', icon: FileSearch },
      { key: 'reports', url: '/admin/reports', icon: BarChart },
      { key: 'llm_prompts', url: '/admin/llm-prompts', icon: Bot },
    ],
  },
  {
    id: 5,
    key: 'tarimiklim',
    items: [
      { key: 'tarimiklim_hub', url: '/admin/tarimiklim', icon: ThermometerSun },
      { key: 'tarimiklim_locations', url: '/admin/tarimiklim/locations', icon: MapPin },
      { key: 'tarimiklim_alerts', url: '/admin/tarimiklim/alerts', icon: Bell },
      { key: 'tarimiklim_alert_rules', url: '/admin/tarimiklim/alert-rules', icon: ListChecks },
      { key: 'tarimiklim_alert_subscriptions', url: '/admin/tarimiklim/alert-subscriptions', icon: UserCheck },
    ],
  },
];

export type AdminNavCopy = {
  labels: Record<AdminNavGroupKey, string>;
  items: Record<AdminNavItemKey, string>;
};

// Fallback titles for when translations are missing
const FALLBACK_TITLES: Record<AdminNavItemKey, string> = {
  dashboard: 'Panel',
  site_settings: 'Ayarlar',
  reviews: 'Yorumlar',
  mail: 'E-Posta',
  users: 'Kullanıcılar',
  email_templates: 'E-posta Şablonları',
  notifications: 'Bildirimler',
  storage: 'Dosya Yöneticisi',
  db: 'Veritabanı',
  audit: 'Denetim Kayıtları',
  support: 'Destek',
  chat: 'Chat & AI',
  orders: 'Siparişler',
  wallet: 'Cüzdan',
  payment_settings: 'Ödeme Ayarları',
  announcements: 'Duyurular',
  subscriptions: 'Abonelikler',
  subscription_plans: 'Abonelik Planları',
  cache: 'Cache Yönetimi',
  llm_prompts: 'AI Promptları',
  banners: 'Banner Yönetimi',
  campaigns: 'Kampanyalar',
  navigation: 'Menü & Footer',
  home_layout: 'Anasayfa Düzeni',
  user_roles: 'Roller',
  reports: 'Raporlar',
  availability: 'Müsaitlik',
  telegram: 'Telegram',
  tarimiklim_hub: 'Özet',
  tarimiklim_locations: 'Konumlar',
  tarimiklim_alerts: 'Uyarı geçmişi',
  tarimiklim_alert_rules: 'Uyarı kuralları',
  tarimiklim_alert_subscriptions: 'Aboneliklerim',
};

export function buildAdminSidebarItems(
  copy?: Partial<AdminNavCopy> | null,
  t?: TranslateFn,
): NavGroup[] {
  const labels = copy?.labels ?? ({} as AdminNavCopy['labels']);
  const items = copy?.items ?? ({} as AdminNavCopy['items']);

  return adminNavConfig.map((group) => {
    // 1. Try copy.labels[group.key]
    // 2. Try t(`admin.sidebar.groups.${group.key}`)
    // 3. Fallback to empty (or key)
    const tGroup = t ? t(`admin.sidebar.groups.${group.key}` as any) : '';
    const label =
      labels[group.key] || (tGroup && !tGroup.includes('admin.sidebar') ? tGroup : '') || '';

    return {
      id: group.id,
      label,
      items: group.items.map((item) => {
        // 1. Try copy.items[item.key]
        // 2. Try t(`admin.dashboard.items.${item.key}`)
        // 3. Fallback to FALLBACK_TITLES
        // 4. Fallback to key
        const tItem = t ? t(`admin.dashboard.items.${item.key}` as any) : '';
        const title =
          items[item.key] ||
          (tItem && !tItem.includes('admin.dashboard') ? tItem : '') ||
          FALLBACK_TITLES[item.key] ||
          item.key;

        return {
          title,
          url: item.url,
          icon: item.icon,
          badgeKey: item.badgeKey,
        };
      }),
    };
  });
}
