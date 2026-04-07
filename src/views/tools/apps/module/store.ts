// 导入接口类型
import { Category } from '@/api/tools/apps/module/types';

// 模块分类数据
export const moduleCategories = [
  { key: 'all', label: '全部' },
  { key: 'un_installed', label: '未安装' },
  { key: 'installed', label: '已安装' },
  { key: 'purchased', label: '已购买' },
  { key: 'updatable', label: '可更新' },
]

// 工具函数
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

export const getCategoryLabel = (category: string | Category | null) => {
  if (!category) return '未分类';
  
  if (typeof category === 'object') {
    return category.name;
  }
  
  const categoryObj = moduleCategories.find((cat) => cat.key === category);
  return categoryObj ? categoryObj.label : category;
};