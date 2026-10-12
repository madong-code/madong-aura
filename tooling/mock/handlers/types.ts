import type { H3Event } from 'h3';

import type { AdminRow } from '../utils/admin/auth';

/** 处理器上下文 */
export interface Ctx {
  event: H3Event;
  /** 已解析 query */
  query: Record<string, any>;
  /** 已解析 body（GET/DELETE 也可能有） */
  body: Record<string, any>;
  /** 路径参数（按 :name 顺序捕获） */
  params: string[];
  /** 当前登录管理员（非 public 路由必有） */
  user: AdminRow;
}

export interface RouteDef {
  method: 'DELETE' | 'GET' | 'POST' | 'PUT';
  /** 以 / 开头的路径，:name 捕获一段参数 */
  pattern: string;
  /** 免登录访问 */
  public?: boolean;
  handler: (ctx: Ctx) => any;
}

/** 快速注册 CRUD 列表路由 */
export function route(
  method: RouteDef['method'],
  pattern: string,
  handler: RouteDef['handler'],
  isPublic = false,
): RouteDef {
  return { method, pattern, handler, public: isPublic };
}

/** 处理器已自行输出原始响应（SSE/blob 等），dispatcher 不再包装 */
export const RAW: unique symbol = Symbol('raw');
