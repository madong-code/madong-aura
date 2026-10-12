import type { Ctx, RouteDef } from './types';

import {
  LANG_FILES,
  LANG_ITEMS,
  LANG_SUPPORTED,
  TERMINAL_COMMANDS,
  TERMINAL_CONFIG,
} from '../utils/admin/datasets';
import { now } from '../utils/admin/store';
import { RAW } from './types';

// ==================== 多语言 ====================

const langRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/devtools/lang/supported',
    handler: () => LANG_SUPPORTED,
  },
  {
    method: 'GET',
    pattern: '/devtools/lang/files',
    handler: ({ query }: Ctx) => {
      if (query.language) {
        return LANG_FILES.filter((f) => f.name === query.language);
      }
      return LANG_FILES;
    },
  },
  {
    method: 'GET',
    pattern: '/devtools/lang/statistics',
    handler: () =>
      LANG_SUPPORTED.map((lang: string) => ({
        language: lang,
        entries: LANG_ITEMS.filter((i) => i.language === lang).length,
        files: LANG_FILES.filter((f) => f.name === lang).length,
        coverage: '100%',
      })),
  },
  {
    method: 'GET',
    pattern: '/devtools/lang/translate',
    handler: ({ query }: Ctx) => {
      const item = LANG_ITEMS.find(
        (i) =>
          i.language === query.language &&
          i.file === query.file &&
          i.key === query.key,
      );
      return {
        key: query.key,
        value: item?.value ?? '',
        language: query.language,
      };
    },
  },
  {
    method: 'GET',
    pattern: '/devtools/lang',
    handler: ({ query }: Ctx) => {
      let list = LANG_ITEMS;
      if (query.language) {
        list = list.filter((i) => i.language === query.language);
      }
      if (query.file) {
        list = list.filter((i) => i.file === query.file);
      }
      if (query.keyword) {
        const kw = String(query.keyword);
        list = list.filter(
          (i) => i.key.includes(kw) || String(i.value).includes(kw),
        );
      }
      return { items: list, total: list.length };
    },
  },
  {
    method: 'POST',
    pattern: '/devtools/lang',
    handler: ({ body }: Ctx) => {
      const row = {
        language: body.language ?? 'zh-CN',
        file: body.file ?? 'common',
        key: body.key ?? '',
        value: body.value ?? '',
        created_at: now(),
        updated_at: now(),
      };
      LANG_ITEMS.push(row);
      return row;
    },
  },
  {
    method: 'PUT',
    pattern: '/devtools/lang/:id',
    handler: ({ body }: Ctx) => {
      const idx = LANG_ITEMS.findIndex(
        (i) =>
          i.language === body.language &&
          i.file === body.file &&
          i.key === body.key,
      );
      if (idx >= 0) LANG_ITEMS[idx].value = body.value ?? LANG_ITEMS[idx].value;
      return idx >= 0 ? LANG_ITEMS[idx] : null;
    },
  },
  {
    method: 'DELETE',
    pattern: '/devtools/lang/:id',
    handler: ({ body }: Ctx) => {
      const idx = LANG_ITEMS.findIndex(
        (i) =>
          i.language === body.language &&
          i.file === body.file &&
          i.key === body.key,
      );
      if (idx >= 0) LANG_ITEMS.splice(idx, 1);
      return null;
    },
  },
];

// ==================== 终端 ====================

/** SSE 输出进度并完成（命名事件 progress/completed，结构与真实后端一致） */
function runCommandSse(ctx: Ctx) {
  const uuid = String(ctx.query.uuid ?? '');
  const command = String(ctx.query.command ?? 'help');
  const res = ctx.event.node.res;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const send = (event: string, payload: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const progress = (stage: string, message: string, pct: number) =>
    send('progress', {
      uuid,
      data: { status: 'running', message, progress: pct, data: { stage } },
    });

  progress('connected', `连接成功，开始执行 ${command}`, 0);
  void command;
  let step = 0;
  const timer = setInterval(() => {
    step += 1;
    if (step < 3) {
      progress('executing', `执行中 ${step}/3`, step * 30);
    } else {
      clearInterval(timer);
      progress('finishing', '执行完成', 100);
      send('completed', {
        uuid,
        data: {
          status: 'completed',
          message: '命令执行完成',
          progress: 100,
          data: { stage: 'completed', success: true },
        },
      });
      res.end();
    }
  }, 400);

  return RAW;
}

const terminalRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/terminal/commands',
    handler: () => TERMINAL_COMMANDS,
  },
  {
    method: 'PUT',
    pattern: '/terminal/config',
    handler: ({ body }: Ctx) => {
      Object.assign(TERMINAL_CONFIG, body);
      return TERMINAL_CONFIG;
    },
  },
  {
    method: 'GET',
    pattern: '/terminal/config',
    handler: () => TERMINAL_CONFIG,
  },
  {
    method: 'GET',
    pattern: '/terminal',
    handler: (ctx: Ctx) => runCommandSse(ctx),
  },
];

export default [...langRoutes, ...terminalRoutes] as RouteDef[];
