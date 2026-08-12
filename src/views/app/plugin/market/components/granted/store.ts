// ──────────────────────────────────────────────
// 模块市场 - 分类 / 图标 / 标签 工具函数
// ──────────────────────────────────────────────

/** 分类 Tab key 与后端 PluginController@index type 参数对齐，label 由 $t('app.plugin.market.categories.{key}') 渲染 */
export const moduleCategories = [
  { key: 'all' },
  { key: 'installed' },
  { key: 'un_installed' },
  { key: 'purchased' },
  { key: 'updatable' },
];

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
