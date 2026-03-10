import BaseService from '@/api/core/base';
import type { PluginDevelopRow } from './model';

const baseUrl = '/plugin/develop';

export const PluginDevelopService = {
  ...BaseService<PluginDevelopRow>({ baseUrl }),
};

export default PluginDevelopService;
