import { useAccessStore } from '#/core/stores';
import { router } from '#/router';

/** 404 兜底路由名称（router/routes/core.ts） */
const FALLBACK_NOT_FOUND = 'FallbackNotFound';

/**
 * 从导航目标中剥离 hash/query，得到纯路径
 */
function extractPath(target: string): string {
  const noHash = (target.split('#')[0] ?? '').trim();
  return (noHash.split('?')[0] ?? '') || '/';
}

/**
 * 判断导航目标是否为外部链接
 */
export function isExternalLink(target: string): boolean {
  return /^https?:\/\//i.test(target);
}

/**
 * 判断当前用户是否可访问指定导航目标
 *
 * 规则：
 * - 外链（http/https）：始终可访问（新窗口打开，与菜单权限无关）
 * - 内部路径：先按用户菜单树精确匹配（accessStore.getMenuByPath）；
 *   再按 router.resolve 兜底（覆盖 hideInMenu、带动态参数的隐藏路由），
 *   排除 404 兜底路由 —— 未注册即视为当前用户菜单中不存在
 * - 非 / 开头且非外链：按路由 name（code）判断 router.hasRoute
 */
export function canAccessRoute(target: string): boolean {
  if (!target) return false;
  if (isExternalLink(target)) return true;

  const accessStore = useAccessStore();

  // 非路径格式：按路由 name（code）处理
  if (!target.startsWith('/')) {
    return router.hasRoute(target);
  }

  const path = extractPath(target);

  // 1. 菜单树精确匹配（父级路径 + 子级绝对路径均已覆盖）
  if (accessStore.getMenuByPath(path)) return true;

  // 2. 兜底：路由已注册（如 hideInMenu 详情页、动态参数路由），且不是 404 兜底
  try {
    const resolved = router.resolve(path);
    return (
      resolved.matched.length > 0 && resolved.name !== FALLBACK_NOT_FOUND
    );
  } catch {
    return false;
  }
}

/**
 * 消息中心跳转：校验通过才导航，否则无响应（静默模式）
 *
 * @param target 导航目标（内部路径 / 路由 name / 外链）
 * @param query  附加查询参数（来自消息 action_params）
 * @returns 是否发生了导航
 */
export function navigateToTarget(
  target: string,
  query?: Record<string, any>,
): boolean {
  if (!target) return false;

  if (isExternalLink(target)) {
    window.open(target, '_blank');
    return true;
  }

  // 权限校验：当前用户菜单中不存在 → 无响应
  if (!canAccessRoute(target)) return false;

  if (!target.startsWith('/')) {
    router.push({ name: target, query });
  } else {
    router.push({ path: extractPath(target), query });
  }
  return true;
}
