import type { RouteDef } from './types';

import authRoutes from './auth';
import businessRoutes from './business';
import codegenRoutes from './codegen';
import contentRoutes from './content';
import devtoolsRoutes from './devtools';
import pluginRoutes from './plugin';
import systemRoutes from './system';

/** 路径参数数量（:name 捕获段），用于稳定排序：静态路径优先于参数路径 */
function paramCount(pattern: string): number {
  return pattern.split(':').length - 1;
}

const all: RouteDef[] = [
  ...authRoutes,
  ...systemRoutes,
  ...businessRoutes,
  ...contentRoutes,
  ...devtoolsRoutes,
  ...codegenRoutes,
  ...pluginRoutes,
];

/**
 * 稳定排序（Array.prototype.sort 在现代引擎为稳定排序）：
 * 同段数时参数少的路由先匹配，保证 /xxx/counts 优先于 /xxx/:id。
 * 注意：需保持注册顺序（静态端点在各模块数组中先于 crudRoutes 展开）。
 */
const routes: RouteDef[] = all
  .map((r, i) => ({ r, i }))
  .sort(
    (a, b) => paramCount(a.r.pattern) - paramCount(b.r.pattern) || a.i - b.i,
  )
  .map(({ r }) => r);

export default routes;
