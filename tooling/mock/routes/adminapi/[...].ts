import { defineEventHandler, getQuery, readBody } from 'h3';

import { currentUser } from '~/utils/admin/auth';
import { failWith, ok } from '~/utils/admin/response';
import routes from '~/handlers';
import { RAW } from '~/handlers/types';

const PREFIX = '/adminapi';

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0] ?? '';
  if (!path.startsWith(`${PREFIX}/`)) return;

  const method = event.method;
  const cleanPath = path.slice(PREFIX.length) || '/';
  const segments = cleanPath.split('/').filter(Boolean);
  const query = getQuery(event) as Record<string, any>;

  // multipart 请求不能 readBody（会破坏流），body 置空由处理器自行解析
  const contentType = event.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');
  let body: Record<string, any> = {};
  if (!isMultipart && method !== 'GET') {
    try {
      const raw = await readBody(event);
      body = raw ?? {};
    } catch {
      body = {};
    }
  }

  for (const def of routes) {
    if (def.method !== method) continue;
    const parts = def.pattern.split('/').filter(Boolean);
    if (parts.length !== segments.length) continue;

    const params: string[] = [];
    let matched = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) {
        params.push(decodeURIComponent(segments[i] ?? ''));
      } else if (parts[i] !== segments[i]) {
        matched = false;
        break;
      }
    }
    if (!matched) continue;

    const user = def.public
      ? (currentUser(event) ?? ({} as any))
      : currentUser(event);
    if (!def.public && !user) {
      return failWith(event, '登录失效，请重新登录', 401);
    }

    const result = await def.handler({
      event,
      query,
      body,
      params,
      user: user as any,
    });

    // 处理器已自行输出（SSE/文件流）
    if (result === RAW) return undefined;
    // 处理器已返回完整信封（{code, msg, data} 三字段齐全；
    // 不能只判断 code —— 业务数据本身可能含 code 字段，如职位编码、插件标识）
    const isEnvelope =
      result &&
      typeof result === 'object' &&
      'code' in result &&
      'msg' in result &&
      'data' in result;
    if (isEnvelope) {
      return result;
    }
    return ok(result ?? null);
  }

  return failWith(event, `接口不存在: ${method} ${cleanPath}`, 404);
});
