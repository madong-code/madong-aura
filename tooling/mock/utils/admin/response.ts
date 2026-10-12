import type { H3Event } from 'h3';

import { setResponseStatus } from 'h3';

/**
 * 与后端 core/foundation/tool/Json.php 完全一致的信封：
 * 成功 {code:0, msg, data} / 失败 {code, msg, data:[]}
 * 数值 code 在 100~599（除 200）时同步设置 HTTP 状态码。
 */
export function ok(data: unknown = null, msg = 'ok') {
  return { code: 0, msg, data };
}

export function fail(msg: string, code = -1, data: unknown = []) {
  return { code, msg, data };
}

export function failWith(
  event: H3Event,
  msg: string,
  code = -1,
  data: unknown = [],
) {
  if (code >= 100 && code <= 599 && code !== 200) {
    setResponseStatus(event, code);
  }
  return { code, msg, data };
}

export function unauthorized(event: H3Event, msg = '登录失效，请重新登录') {
  return failWith(event, msg, 401);
}

/** 复刻 Crud::formatNormal 分页：{items, total}，入参 page/limit（默认 10） */
export function paginate<T extends Record<string, any>>(
  list: T[],
  query: Record<string, any> = {},
): { items: T[]; total: number } {
  const page = Math.max(1, Number.parseInt(query.page) || 1);
  const limit = Math.max(1, Number.parseInt(query.limit) || 10);
  return {
    items: list.slice((page - 1) * limit, page * limit),
    total: list.length,
  };
}

/** 字段过滤：兼容裸字段（精确）、EQ_ 前缀（精确）、LIKE_ 前缀（模糊，忽略大小写） */
export function filterBy<T extends Record<string, any>>(
  list: T[],
  query: Record<string, any> = {},
  fields: string[],
): T[] {
  const conditions: { field: string; op: 'eq' | 'like'; value: any }[] = [];
  for (const [key, val] of Object.entries(query)) {
    if (
      val === undefined ||
      val === null ||
      val === '' ||
      val === 'undefined' ||
      val === 'null'
    ) {
      continue;
    }
    let field = key;
    let op: 'eq' | 'like' = 'eq';
    if (key.startsWith('EQ_')) {
      field = key.slice(3);
      op = 'eq';
    } else if (key.startsWith('LIKE_')) {
      field = key.slice(5);
      op = 'like';
    }
    // 仅处理声明过的字段，避免误伤分页/排序等参数
    if (!fields.includes(field)) continue;
    conditions.push({ field, op, value: val });
  }
  if (conditions.length === 0) return list;
  return list.filter((row) =>
    conditions.every(({ field, op, value }) => {
      const v = row[field];
      if (op === 'like') {
        return String(v ?? '')
          .toLowerCase()
          .includes(String(value).toLowerCase());
      }
      if (Array.isArray(value)) return value.map(String).includes(String(v));
      return (
        String(v) === String(value) ||
        String(v).split(',').includes(String(value))
      );
    }),
  );
}

/** 关键字模糊过滤（对给定字段做 includes） */
export function filterByKeyword<T extends Record<string, any>>(
  list: T[],
  keyword: string | undefined,
  fields: string[],
): T[] {
  const kw = (keyword ?? '').trim();
  if (!kw) return list;
  return list.filter((row) =>
    fields.some((f) => String(row[f] ?? '').includes(kw)),
  );
}
