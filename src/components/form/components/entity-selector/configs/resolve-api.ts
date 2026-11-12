/**
 * fetcher / hydrate 双形态归一化：字符串 API 路径 → 标准取数函数。
 *
 * 字符串形态约定（推荐：标准 CRUD 契约下配置保持纯数据、可序列化、易复用）：
 * - fetcher 列表路径：GET path，参数 { page, limit, LIKE_<field>, IN_dept_id }，
 *   响应为 { items, total }（非分页接口返回数组亦可）；
 * - hydrate 详情路径模板：'/xxx/:id' 占位替换或 '/xxx' 末尾拼接 id，
 *   响应为实体行；请求失败返回 null（回显回退原 id，不抛错）。
 * 函数形态保留给非标准契约（参数组装 / 多接口聚合 / 自定义过滤）。
 * 归一化幂等：已是函数的原样返回。
 */
import type {
  EntityFetchContext,
  EntityPickerConfig,
  SelectorFetchParams,
  SelectorFetchResult,
} from '../core/selector-types';

import { requestClient } from '#/api/request';

/** 归一化后的配置：fetcher / hydrate 保证为函数形态（壳与查看器仅消费此形态） */
export type ResolvedEntityPickerConfig = Omit<
  EntityPickerConfig,
  'fetcher' | 'hydrate'
> & {
  fetcher: (
    params: SelectorFetchParams,
    ctx?: EntityFetchContext,
  ) => Promise<SelectorFetchResult>;
  hydrate?: (id: string) => Promise<any | null>;
};

function fetcherFromApi(path: string) {
  return async (
    params: SelectorFetchParams,
    ctx?: EntityFetchContext,
  ): Promise<SelectorFetchResult> => {
    const { page, limit, keyword, field, filters } = params;
    const query: Record<string, any> = { page, limit };
    // 多字段条件（searchMode: 'multi'）：非空条件逐字段 LIKE_ 下发（AND 语义）
    for (const [filterField, value] of Object.entries(filters ?? {})) {
      query[`LIKE_${filterField}`] = value;
    }
    // 单字段模式兼容：keyword 作用于活动字段（与 filters 同键时值一致，覆盖无害）
    if (keyword) query[`LIKE_${field}`] = keyword;
    // 部门联动：限定部门（含子部门）内可选；IN_ 需传数组（后端约定）
    const deptIds: string[] = ctx?.deptIds ?? [];
    if (deptIds.length > 0) query.IN_dept_id = deptIds;
    const res: any = await requestClient.get(path, { params: query });
    if (Array.isArray(res)) return { items: res, total: res.length };
    return { items: res?.items ?? [], total: Number(res?.total ?? 0) };
  };
}

function hydrateFromApi(path: string) {
  return async (id: string): Promise<any | null> => {
    try {
      const url = path.includes(':id')
        ? path.replace(':id', encodeURIComponent(id))
        : `${path.replace(/\/+$/, '')}/${encodeURIComponent(id)}`;
      return (await requestClient.get(url)) ?? null;
    } catch {
      // 反查失败回退：详情场景显示原 id，部门联动强校验保留原值
      return null;
    }
  };
}

/** 字符串形态归一化为函数；纯函数配置原样返回（幂等，可重复调用） */
export function resolveEntityApi(
  config: EntityPickerConfig,
): ResolvedEntityPickerConfig;
export function resolveEntityApi(
  config: EntityPickerConfig | undefined,
): ResolvedEntityPickerConfig | undefined;
export function resolveEntityApi(
  config?: EntityPickerConfig,
): ResolvedEntityPickerConfig | undefined {
  if (!config) return undefined;
  const needsResolve =
    typeof config.fetcher === 'string' || typeof config.hydrate === 'string';
  if (!needsResolve) return config as ResolvedEntityPickerConfig;
  return {
    ...config,
    ...(typeof config.fetcher === 'string'
      ? { fetcher: fetcherFromApi(config.fetcher) }
      : {}),
    ...(typeof config.hydrate === 'string'
      ? { hydrate: hydrateFromApi(config.hydrate) }
      : {}),
  } as ResolvedEntityPickerConfig;
}
