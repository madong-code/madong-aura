import type { RouteRecordRaw } from 'vue-router';

import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '#/core/shared/types/base';

import { mapTree } from '#/core/shared/utils';

/**
 * 判断路由是否在菜单中显示但访问时展示 403（让用户知悉功能并申请权限）
 */
function menuHasVisibleWithForbidden(route: RouteRecordRaw): boolean {
  return !!route.meta?.menuVisibleWithForbidden;
}

/**
 * 动态生成路由 - 后端方式
 * 对 meta.menuVisibleWithForbidden 为 true 的项直接替换为 403 组件，让用户知悉功能并申请权限。
 */
async function generateRoutesByBackend(
  options: GenerateMenuAndRoutesOptions,
): Promise<RouteRecordRaw[]> {
  const {
    fetchMenuListAsync,
    layoutMap = {},
    pageMap = {},
    forbiddenComponent,
    routes: frontendRoutes = [],
  } = options;

  try {
    const menuRoutes = (await fetchMenuListAsync?.()) || [];

    // 规范化页面组件映射表
    const normalizedPageMap = Object.fromEntries(
      Object.entries(pageMap).map(([key, value]) => [
        normalizeViewPath(key),
        value,
      ]),
    );

    // 转换后端菜单路由
    let routes = convertRoutes(menuRoutes, layoutMap, normalizedPageMap);

    // 处理前端定义的后端模式路由（component为字符串的路由）
    const frontendBackendRoutes = frontendRoutes.filter(
      (route) => typeof route.component === 'string',
    );

    if (frontendBackendRoutes.length > 0) {
      const convertedFrontendRoutes = convertRoutes(
        frontendBackendRoutes,
        layoutMap,
        normalizedPageMap,
      );
      routes = mergeRoutesByPath(routes, convertedFrontendRoutes);
    }

    // 处理可见但禁止访问的路由
    if (forbiddenComponent) {
      routes = mapTree(routes, (route) => {
        if (menuHasVisibleWithForbidden(route)) {
          route.component = forbiddenComponent;
        }
        return route;
      });
    }

    return routes;
  } catch (error) {
    console.error('[RouteGenerator] Error:', error);
    throw error;
  }
}

/**
 * 根据路径合并路由
 */
function mergeRoutesByPath(
  baseRoutes: RouteRecordRaw[],
  extraRoutes: RouteRecordRaw[],
): RouteRecordRaw[] {
  const result = [...baseRoutes];
  const pathMap = new Map<string, RouteRecordRaw>();

  // 构建路径映射
  result.forEach((route) => {
    if (route.path) {
      pathMap.set(route.path, route);
    }
  });

  // 合并额外路由
  extraRoutes.forEach((route) => {
    if (route.path) {
      const existing = pathMap.get(route.path);
      if (existing) {
        // 合并meta
        existing.meta = {
          ...existing.meta,
          ...route.meta,
        } as RouteRecordRaw['meta'];
        // 合并子路由
        if (route.children && existing.children) {
          existing.children = mergeRoutesByPath(
            existing.children,
            route.children,
          );
        } else if (route.children) {
          existing.children = route.children;
        }
      } else {
        result.push(route);
        pathMap.set(route.path, route);
      }
    }
  });

  return result;
}

/**
 * 将后端菜单转换为前端路由
 */
function convertRoutes(
  routes: RouteRecordStringComponent[],
  layoutMap: ComponentRecordType,
  pageMap: ComponentRecordType,
): RouteRecordRaw[] {
  return mapTree(routes, (node) => {
    const route = node as unknown as RouteRecordRaw;
    const { component, name } = node;

    if (!name) {
      console.error('[RouteGenerator] Route name is required', route);
    }

    // 无component但有子路由：自动使用 RouterView 作为容器
    if (!component && route.children && route.children.length > 0) {
      route.component = layoutMap.RouteView;
    }
    // 布局组件转换
    else if (component && layoutMap[component]) {
      route.component = layoutMap[component];
    }
    // 页面组件转换（仅处理字符串类型的 component）
    else if (component && typeof component === 'string') {
      const matchedPath = findMatchingComponent(component, route.meta, pageMap);

      if (matchedPath) {
        route.component = pageMap[matchedPath];
        if (route.meta) {
          (route.meta as any)._resolvedPath = matchedPath;
        }
      } else {
        console.warn(`[RouteGenerator] Component not found: ${component}`, {
          route: route.path,
          meta: route.meta,
        });
        route.component =
          pageMap['/_core/fallback/not-found.vue'] || Object.values(pageMap)[0];
      }
    }

    return route;
  });
}

/**
 * 查找匹配的组件路径
 */
function findMatchingComponent(
  component: string,
  meta: any = {},
  pageMap: ComponentRecordType,
): string | undefined {
  const result = resolveComponentPath(component, meta);

  // 精确匹配
  const exactPath = result.path.endsWith('.vue')
    ? result.path
    : `${result.path}.vue`;
  if (pageMap[exactPath]) {
    return exactPath;
  }

  // 模块级模糊匹配
  if (result.module) {
    const moduleFiles = Object.keys(pageMap).filter((key) =>
      key.includes(`/plugins/${result.module}/`),
    );

    if (moduleFiles.length > 0) {
      if (result.template) {
        const { template } = result;
        const matchedFile = moduleFiles.find((file) => file.includes(template));
        if (matchedFile) {
          return matchedFile;
        }
      }
      return moduleFiles[0];
    }
  }

  // 路径后缀模糊匹配
  const pathParts = result.path.replace('.vue', '').split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const searchParts = pathParts.slice(-3).join('/');
    const partialMatch = Object.keys(pageMap).find((key) =>
      key.includes(searchParts),
    );
    if (partialMatch) {
      return partialMatch;
    }
  }

  return undefined;
}

/**
 * 解析组件路径（支持多种格式）
 *
 * 优先级:
 * 1. 最简写法: about/test + meta.module → /plugins/{module}/views/about/test
 * 2. 冒号简写: demo:about/test → /plugins/demo/views/about/test
 * 3. 插件路径: plugin/demo/views/about/test → /plugins/demo/views/about/test
 * 4. 模板路径: template/crud/list → /templates/crud/list
 * 5. 视图路径: views/about/test → /about/test 或 /plugins/{module}/views/about/test
 * 6. 直接路径: /dashboard/workspace
 */
function resolveComponentPath(
  component: string,
  meta?: any,
): { module?: string; path: string; template?: string } {
  // 类型保护：处理非字符串的 component 值（如路由合并过程中产生的异常数据）
  if (typeof component !== 'string') {
    return { path: `/${String(component)}` };
  }

  const { module } = meta || {};

  // ⭐ 最简写法：通过 meta.module 定位插件
  if (module && isSimplePath(component)) {
    return {
      path: `/plugins/${module}/views/${component}`,
      module,
      template: component,
    };
  }

  // 模板路径
  if (component.startsWith('template/')) {
    const templatePath = component.replace('template/', '');
    return {
      path: `/templates/${templatePath}`,
      module: module || 'template',
      template: templatePath,
    };
  }

  // 冒号简写
  if (component.includes(':')) {
    const [mod, templatePath] = component.split(':', 2);
    return {
      path: `/plugins/${mod}/views/${templatePath}`,
      module: mod,
      template: templatePath,
    };
  }

  // 插件路径
  if (component.startsWith('plugin/')) {
    const parts = component.split('/');
    const mod = parts[1] || module || 'unknown';
    return {
      path: `/plugins/${parts.slice(1).join('/')}`,
      module: mod,
      template: parts.slice(3).join('/'),
    };
  }

  // views/plugins 路径
  if (component.startsWith('views/plugins/')) {
    const modMatch = component.match(/views\/plugins\/([^/]+)/);
    return {
      path: component.replace(/^views/, ''),
      module: modMatch ? modMatch[1] : module,
      template: component,
    };
  }

  // views 路径
  if (component.startsWith('views/')) {
    const cleanPath = component.replace(/^views\//, '');
    if (module) {
      return {
        path: `/plugins/${module}/views/${cleanPath}`,
        module,
        template: cleanPath,
      };
    }
    return { path: `/${cleanPath}`, module, template: cleanPath };
  }

  // 根路径
  if (component.startsWith('/')) {
    const cleanPath = component.replace(/^\//, '');
    if (module) {
      return {
        path: `/plugins/${module}/views/${cleanPath}`,
        module,
        template: cleanPath,
      };
    }
    return { path: component, module, template: component };
  }

  // 兜底处理
  return {
    path: normalizeViewPath(component),
    module,
    template: component,
  };
}

/**
 * 判断是否为最简路径格式
 */
function isSimplePath(path: string): boolean {
  // 类型保护，确保 path 是字符串
  if (typeof path !== 'string' || !path) return false;

  return (
    !path.startsWith('/') &&
    !path.startsWith('plugin/') &&
    !path.startsWith('views/') &&
    !path.startsWith('template/') &&
    !path.includes(':')
  );
}

/**
 * 规范化视图路径
 */
function normalizeViewPath(path: string): string {
  const normalizedPath = path.replace(/^(\.\/|\.\.\/)+/, '');
  const viewPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`;
  return viewPath.replace(/^\/views/, '');
}

export { generateRoutesByBackend };
