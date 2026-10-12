// ──────────────────────────────────────────────
// 模块市场 - 分类 / 图标 / 标签 工具函数
// ──────────────────────────────────────────────
import { CircleCheck, Clock, LayoutGrid, PackageOpen, ShoppingCart } from 'lucide-vue-next';

import type { Component } from 'vue';

/** 分类 Tab 图标映射（与「我的应用」页 tab-label 风格一致） */
const CATEGORY_ICONS: Record<string, Component> = {
  all: LayoutGrid,
  installed: CircleCheck,
  un_installed: PackageOpen,
  purchased: ShoppingCart,
  updatable: Clock,
};

/** 分类 Tab key 与后端 PluginController@index type 参数对齐，label 由 $t('app.plugin.market.categories.{key}') 渲染 */
export const moduleCategories = [
  { key: 'all' },
  { key: 'installed' },
  { key: 'un_installed' },
  { key: 'purchased' },
  { key: 'updatable' },
];

/** 取分类 Tab 图标组件（未命中兜底 LayoutGrid） */
export const getCategoryIcon = (key: string): Component =>
  CATEGORY_ICONS[key] || LayoutGrid;

export const getModuleIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    all: 'ri:app-store-line',
    'full-app': 'ri:app-store-line',
    backend: 'ri:settings-3-line',
    infrastructure: 'ri:server-line',
    'single-page': 'ri:file-text-line',
    other: 'ri:more-fill',
  };
  return iconMap[category] || 'ri:app-store-line';
};

export const getCategoryLabel = (category: any) => {
  if (!category) return 'uncategorized';
  if (typeof category === 'object') return category.name;
  return category;
};
