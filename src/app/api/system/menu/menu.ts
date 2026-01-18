import BaseService from '@/api/core/base';
import type { MenuRow } from './menu-model';
import request from '@/utils/http';

const baseUrl = '/system/menu';

export const BadgeVariants = [
  'default',
  'destructive',
  'primary',
  'success',
  'warning',
] as const;

export const BadgeTypes = [
  'dot',
  'normal',
] as const;

export const MenuTypes = [
  1, 2, 3, 4, 5, 6,
] as const;

export const MenuService = {
  ...BaseService<MenuRow>({ baseUrl }),

  batchStore(data: Record<string, any>) {
    return request.post({ url: `${baseUrl}/batch-store`, data });
  },
};

export default MenuService;
