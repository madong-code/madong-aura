import type { Ctx, RouteDef } from './types';

import {
  MESSAGE_CATEGORIES,
  MESSAGE_DEFINITIONS,
  MESSAGE_TEMPLATES,
  NOTEPAD_DOCUMENTS,
  NOTEPAD_FOLDERS,
  NOTIFIES,
  REVIEW_LOGS,
  REVIEWS,
  REVIEW_TYPES,
  SUBSCRIBES,
} from '../utils/admin/datasets';
import { crud, nextId, now, toIds } from '../utils/admin/store';
import { failWith, paginate } from '../utils/admin/response';
import { crudRoutes } from './system';

// ==================== 本地运行时状态 ====================

/** 消息定义-模板关联（definition_id -> template ids） */
const MANAGE_TEMPLATES = new Map<number, (number | string)[]>([
  [1, [1]],
  [2, [2]],
  [3, []],
]);

/** 会员收件通知（复用 NOTIFIES，登录管理员视角） */

// ==================== 消息记录（/content/message） ====================

const messageRoutes: RouteDef[] = [
  {
    method: 'PUT',
    pattern: '/content/message/empty',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.id ?? body.ids)) {
        const n = crud.find(NOTIFIES, id);
        if (n) (n as any).status = 'deleted';
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/content/message/notify-on-first-login-to-all',
    handler: () => ({ count: NOTIFIES.length }),
  },
  {
    method: 'PUT',
    pattern: '/content/message/:id/update-read',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.id ?? body.ids)) {
        const n = crud.find(NOTIFIES, id);
        if (n) {
          (n as any).status = body.status ?? 'read';
          (n as any).isRead = (body.status ?? 'read') === 'read';
        }
      }
      return null;
    },
  },
  ...crudRoutes('/content/message', NOTIFIES, {
    searchFields: ['title'],
    filterFields: ['status', 'category_id'],
  }),
];

// ==================== 消息分类 ====================

const categoryRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/content/message/category/all',
    handler: () => MESSAGE_CATEGORIES,
  },
  {
    method: 'GET',
    pattern: '/content/message/category/:key/definitions',
    handler: ({ params }: Ctx) => {
      const cate = MESSAGE_CATEGORIES.find((c) => c.key === params[0]);
      return MESSAGE_DEFINITIONS.filter(
        (d) => d.category_id === (cate?.id ?? -1),
      );
    },
  },
  {
    method: 'GET',
    pattern: '/content/message/category/:key/modules',
    handler: ({ params }: Ctx) => {
      const cate = MESSAGE_CATEGORIES.find((c) => c.key === params[0]);
      return MESSAGE_DEFINITIONS.filter(
        (d) => d.category_id === (cate?.id ?? -1),
      );
    },
  },
  ...crudRoutes('/content/message/category', MESSAGE_CATEGORIES, {
    searchFields: ['name', 'key'],
    filterFields: ['is_enabled'],
  }),
];

// ==================== 消息定义/管理 ====================

const manageRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/content/message/manage/:id/templates',
    handler: ({ params }: Ctx) => MANAGE_TEMPLATES.get(Number(params[0])) ?? [],
  },
  {
    method: 'POST',
    pattern: '/content/message/manage/:id/templates',
    handler: ({ body, params }: Ctx) => {
      MANAGE_TEMPLATES.set(
        Number(params[0]),
        (body.template_ids ?? []).map(Number),
      );
      return null;
    },
  },
  ...crudRoutes('/content/message/manage', MESSAGE_DEFINITIONS, {
    searchFields: ['name', 'key'],
    filterFields: ['category_id', 'is_enabled'],
  }),
  ...crudRoutes('/content/message/template', MESSAGE_TEMPLATES, {
    searchFields: ['title', 'template_id'],
    filterFields: ['type', 'status'],
  }),
];

// ==================== 通知（收件箱，{list,total} 分页） ====================

const notifyRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/content/message/notify/unread-count',
    handler: () => ({
      total: NOTIFIES.filter((n) => n.status === 'unread').length,
    }),
  },
  {
    method: 'PUT',
    pattern: '/content/message/notify/read-all',
    handler: () => {
      for (const n of NOTIFIES) {
        n.status = 'read';
        n.isRead = true;
        n.read_at = now();
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/content/message/notify/batch-read',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids)) {
        const n = crud.find(NOTIFIES, id);
        if (n) {
          n.status = 'read';
          n.isRead = true;
          n.read_at = now();
        }
      }
      return null;
    },
  },
  {
    method: 'DELETE',
    pattern: '/content/message/notify/batch-delete',
    handler: ({ body }: Ctx) => crud.remove(NOTIFIES, toIds(body.ids)),
  },
  {
    method: 'PUT',
    pattern: '/content/message/notify/:id/read',
    handler: ({ params }: Ctx) => {
      const n = crud.find(NOTIFIES, params[0]);
      if (n) {
        n.status = 'read';
        n.isRead = true;
        n.read_at = now();
      }
      return n ?? null;
    },
  },
  {
    method: 'GET',
    pattern: '/content/message/notify',
    handler: ({ query }: Ctx) => {
      let list = NOTIFIES.filter((n) => n.status !== 'deleted');
      if (query.status) list = list.filter((n) => n.status === query.status);
      if (query.category_id) {
        list = list.filter(
          (n) => String(n.category_id) === String(query.category_id),
        );
      }
      if (query.keyword) {
        const kw = String(query.keyword);
        list = list.filter(
          (n) => String(n.title).includes(kw) || String(n.content).includes(kw),
        );
      }
      const page = Math.max(1, Number.parseInt(query.page) || 1);
      const limit = Math.max(1, Number.parseInt(query.limit) || 10);
      return {
        list: list.slice((page - 1) * limit, page * limit),
        total: list.length,
      };
    },
  },
  {
    method: 'GET',
    pattern: '/content/message/notify/:id',
    handler: ({ event, params }: Ctx) => {
      const n = crud.find(NOTIFIES, params[0]);
      return n ?? failWith(event, '通知不存在', -1);
    },
  },
  {
    method: 'DELETE',
    pattern: '/content/message/notify/:id',
    handler: ({ params }: Ctx) => crud.remove(NOTIFIES, [params[0]]),
  },
];

// ==================== 订阅 ====================

const subscribeRoutes: RouteDef[] = [
  {
    method: 'POST',
    pattern: '/content/message/subscribe/init',
    handler: () => SUBSCRIBES,
  },
  {
    method: 'POST',
    pattern: '/content/message/subscribe/batch-set',
    handler: ({ body }: Ctx) => {
      for (const s of body.settings ?? []) {
        const row = SUBSCRIBES.find(
          (x) => x.definition_id === Number(s.definition_id),
        );
        if (row) row.is_subscribed = Boolean(s.is_subscribed ?? s.value);
      }
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/content/message/subscribe',
    handler: ({ query }: Ctx) => {
      let list = SUBSCRIBES;
      if (query.category_key) {
        list = list.filter((s) => s.category_key === query.category_key);
      }
      return list;
    },
  },
];

// ==================== 记事本 ====================

function folderTree(): Record<string, any>[] {
  const build = (pid: number): any[] =>
    NOTEPAD_FOLDERS.filter((f) => f.pid === pid).map((f) => {
      const children = build(f.id);
      return children.length ? { ...f, children } : { ...f };
    });
  return build(0);
}

const notepadRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/content/notepad/folder/tree',
    handler: () => folderTree(),
  },
  {
    method: 'PUT',
    pattern: '/content/notepad/document/:id/move',
    handler: ({ body, params }: Ctx) => {
      const doc = crud.find(NOTEPAD_DOCUMENTS, params[0]);
      if (doc) doc.folder_id = Number(body.folder_id ?? 0);
      return doc ?? null;
    },
  },
  {
    method: 'GET',
    pattern: '/content/notepad/folder',
    handler: () => NOTEPAD_FOLDERS,
  },
  {
    method: 'POST',
    pattern: '/content/notepad/folder',
    handler: ({ body }: Ctx) => {
      const row = {
        id: nextId(),
        pid: Number(body.pid ?? 0),
        name: body.name ?? '',
        icon: body.icon ?? '',
        sort: Number(body.sort ?? 0),
        doc_count: 0,
        created_at: now(),
        updated_at: now(),
      };
      NOTEPAD_FOLDERS.push(row);
      return row;
    },
  },
  {
    method: 'PUT',
    pattern: '/content/notepad/folder/:id',
    handler: ({ body, params }: Ctx) =>
      crud.update(NOTEPAD_FOLDERS, params[0], body) ?? null,
  },
  {
    method: 'DELETE',
    pattern: '/content/notepad/folder/:id',
    handler: ({ event, params }: Ctx) => {
      if (NOTEPAD_DOCUMENTS.some((d) => String(d.folder_id) === params[0])) {
        return failWith(event, '文件夹下存在文档，无法删除', -1);
      }
      crud.remove(NOTEPAD_FOLDERS, [params[0]]);
      return null;
    },
  },
  {
    method: 'GET',
    pattern: '/content/notepad/document',
    handler: ({ query }: Ctx) => {
      let list = NOTEPAD_DOCUMENTS;
      if (query.folder_id) {
        list = list.filter(
          (d) => String(d.folder_id) === String(query.folder_id),
        );
      }
      if (query.keyword) {
        const kw = String(query.keyword);
        list = list.filter((d) => String(d.title).includes(kw));
      }
      return list;
    },
  },
  {
    method: 'POST',
    pattern: '/content/notepad/document',
    handler: ({ body }: Ctx) => {
      const row = {
        id: nextId(),
        folder_id: Number(body.folder_id ?? 0),
        title: body.title ?? '',
        content: body.content ?? '',
        content_html: body.content_html ?? '',
        created_at: now(),
        updated_at: now(),
      };
      NOTEPAD_DOCUMENTS.push(row);
      return row;
    },
  },
  {
    method: 'GET',
    pattern: '/content/notepad/document/:id',
    handler: ({ event, params }: Ctx) => {
      const doc = crud.find(NOTEPAD_DOCUMENTS, params[0]);
      return doc ?? failWith(event, '文档不存在', -1);
    },
  },
  {
    method: 'PUT',
    pattern: '/content/notepad/document/:id',
    handler: ({ body, params }: Ctx) =>
      crud.update(NOTEPAD_DOCUMENTS, params[0], body) ?? null,
  },
  {
    method: 'DELETE',
    pattern: '/content/notepad/document/:id',
    handler: ({ params }: Ctx) => crud.remove(NOTEPAD_DOCUMENTS, [params[0]]),
  },
];

// ==================== 审核管理 ====================

function reviewRow(id: string) {
  return crud.find(REVIEWS, id);
}

const reviewManageRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/content/review/manage/types',
    handler: () => REVIEW_TYPES,
  },
  {
    method: 'GET',
    pattern: '/content/review/manage/statistics',
    handler: () => ({
      total: REVIEWS.length,
      pending: REVIEWS.filter((r) => r.status === 0).length,
      approved: REVIEWS.filter((r) => r.status === 1).length,
      rejected: REVIEWS.filter((r) => r.status === 2).length,
      today: 2,
    }),
  },
  {
    method: 'GET',
    pattern: '/content/review/manage/archive',
    handler: ({ query }: Ctx) => {
      const list = REVIEWS.filter((r) => r.status !== 0);
      return paginate(list, query);
    },
  },
  {
    method: 'GET',
    pattern: '/content/review/manage/archive/:id',
    handler: ({ event, params }: Ctx) => {
      const row = reviewRow(params[0]);
      return row ?? failWith(event, '记录不存在', -1);
    },
  },
  {
    method: 'POST',
    pattern: '/content/review/manage/batch-approve',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids)) {
        const r = reviewRow(String(id));
        if (r && r.status === 0) {
          r.status = 1;
          r.status_text = '已通过';
          r.reviewer_id = 1;
          r.reviewer_name = '超级管理员';
          r.reviewed_at = now();
        }
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/content/review/manage/batch-reject',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids)) {
        const r = reviewRow(String(id));
        if (r && r.status === 0) {
          r.status = 2;
          r.status_text = '已驳回';
          r.reason = body.reason ?? '';
          r.reviewer_id = 1;
          r.reviewer_name = '超级管理员';
          r.reviewed_at = now();
        }
      }
      return null;
    },
  },
  {
    method: 'POST',
    pattern: '/content/review/manage/:id/approve',
    handler: ({ body, params }: Ctx) => {
      const r = reviewRow(params[0]);
      if (r) {
        r.status = 1;
        r.status_text = '已通过';
        r.reason = body.reason ?? '';
        r.reviewer_id = 1;
        r.reviewer_name = '超级管理员';
        r.reviewed_at = now();
        REVIEW_LOGS.unshift({
          id: nextId(),
          review_id: r.id,
          action: 'approve',
          action_text: '通过',
          operator_id: 1,
          reason: body.reason ?? '',
          created_at: now(),
        });
      }
      return r ?? null;
    },
  },
  {
    method: 'POST',
    pattern: '/content/review/manage/:id/reject',
    handler: ({ body, params }: Ctx) => {
      const r = reviewRow(params[0]);
      if (r) {
        r.status = 2;
        r.status_text = '已驳回';
        r.reason = body.reason ?? '';
        r.reviewer_id = 1;
        r.reviewer_name = '超级管理员';
        r.reviewed_at = now();
        REVIEW_LOGS.unshift({
          id: nextId(),
          review_id: r.id,
          action: 'reject',
          action_text: '驳回',
          operator_id: 1,
          reason: body.reason ?? '',
          created_at: now(),
        });
      }
      return r ?? null;
    },
  },
  {
    method: 'POST',
    pattern: '/content/review/manage/:id/cancel',
    handler: ({ body, params }: Ctx) => {
      const r = reviewRow(params[0]);
      if (r) {
        r.cancel_reason = body.reason ?? '';
        r.status = 0;
        r.status_text = '待审核';
      }
      return r ?? null;
    },
  },
  {
    method: 'GET',
    pattern: '/content/review/manage/:id/flow-progress',
    handler: ({ params }: Ctx) => {
      const r = reviewRow(params[0]);
      return [
        { step: 1, name: '提交申请', status: 2, time: r?.created_at ?? now() },
        {
          step: 2,
          name: '管理员审核',
          status: r && r.status === 0 ? 1 : 2,
          time: r?.reviewed_at ?? null,
        },
        {
          step: 3,
          name: '完成',
          status: r && r.status === 1 ? 2 : 0,
          time: null,
        },
      ];
    },
  },
  ...crudRoutes('/content/review/manage', REVIEWS, {
    searchFields: ['title', 'display_name', 'applicant'],
    filterFields: ['status', 'reviewable_type'],
  }),
];

// ==================== 审核记录（只读） ====================

const reviewRecordRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/content/review/record/types',
    handler: () => REVIEW_TYPES,
  },
  {
    method: 'GET',
    pattern: '/content/review/record/archive',
    handler: ({ query }: Ctx) => {
      const list = REVIEWS.filter((r) => r.status !== 0);
      return paginate(list, query);
    },
  },
  {
    method: 'GET',
    pattern: '/content/review/record/archive/:id',
    handler: ({ event, params }: Ctx) => {
      const row = reviewRow(params[0]);
      return row ?? failWith(event, '记录不存在', -1);
    },
  },
  ...crudRoutes('/content/review/record', REVIEWS, {
    searchFields: ['title', 'display_name', 'applicant'],
    filterFields: ['status', 'reviewable_type'],
  }),
];

// ==================== 审核日志 ====================

const reviewLogRoutes: RouteDef[] = [
  {
    method: 'POST',
    pattern: '/content/review/log/clean',
    handler: ({ body }: Ctx) => {
      const days = Number(body.days ?? 30);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const before = REVIEW_LOGS.length;
      for (let i = REVIEW_LOGS.length - 1; i >= 0; i--) {
        if (new Date(REVIEW_LOGS[i].created_at) < cutoff)
          REVIEW_LOGS.splice(i, 1);
      }
      return { removed: before - REVIEW_LOGS.length };
    },
  },
  ...crudRoutes('/content/review/log', REVIEW_LOGS, {
    searchFields: ['action_text'],
    filterFields: ['review_id', 'action'],
  }),
];

export default [
  ...messageRoutes,
  ...categoryRoutes,
  ...manageRoutes,
  ...notifyRoutes,
  ...subscribeRoutes,
  ...notepadRoutes,
  ...reviewManageRoutes,
  ...reviewRecordRoutes,
  ...reviewLogRoutes,
] as RouteDef[];
