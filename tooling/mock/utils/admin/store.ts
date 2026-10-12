/**
 * mock 内存存储工具：自增 ID、时间串、通用 CRUD 辅助。
 * 所有数据集重启后重置（内存态，与真实后端行为等价的演示语义）。
 */

let idSeq = 100;

export function nextId(): number {
  return ++idSeq;
}

export function now(): string {
  return formatTime(new Date());
}

export function formatTime(d: Date): string {
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function daysAgo(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 7) % 60, (days * 13) % 60, 0);
  return formatTime(d);
}

export function randomToken(len = 16): string {
  const chars = 'abcdef0123456789';
  let s = '';
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/** 把 ids 参数（数组或逗号字符串）归一为 id 数组 */
export function toIds(v: unknown): Array<number | string> {
  if (Array.isArray(v)) return v as Array<number | string>;
  if (v === undefined || v === null || v === '') return [];
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 按字段从集合中查找/增删改的通用助手 */
export const crud = {
  find<T extends { id: number | string }>(
    list: T[],
    id: number | string,
  ): T | undefined {
    return list.find((row) => String(row.id) === String(id));
  },
  insert<T extends Record<string, any>>(list: T[], row: T): T {
    list.unshift(row);
    return row;
  },
  update<T extends { id: number | string }>(
    list: T[],
    id: number | string,
    patch: Partial<T>,
  ): T | undefined {
    const row = crud.find(list, id);
    if (row) Object.assign(row, patch, { updated_at: now() });
    return row;
  },
  remove<T extends { id: number | string }>(
    list: T[],
    ids: Array<number | string>,
  ): number {
    const set = new Set(ids.map(String));
    const before = list.length;
    for (let i = list.length - 1; i >= 0; i--) {
      if (set.has(String(list[i].id))) list.splice(i, 1);
    }
    return before - list.length;
  },
};
