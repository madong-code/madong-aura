import type { Ctx, RouteDef } from './types';

import { crud, now, toIds } from '../utils/admin/store';
import { failWith, paginate } from '../utils/admin/response';
import { RAW } from './types';
import { crudRoutes } from './system';

// ==================== 本地数据 ====================

/** 数据库表（table-list） */
const GEN_TABLES: Record<string, any>[] = [
  {
    name: 'member_user',
    comment: '会员用户表',
    engine: 'InnoDB',
    rows: 128,
    data_free: 0,
    data_length: 163840,
    updated_date: now(),
  },
  {
    name: 'member_level',
    comment: '会员等级表',
    engine: 'InnoDB',
    rows: 4,
    data_free: 0,
    data_length: 16384,
    updated_date: now(),
  },
  {
    name: 'system_admin',
    comment: '系统管理员表',
    engine: 'InnoDB',
    rows: 5,
    data_free: 0,
    data_length: 32768,
    updated_date: now(),
  },
  {
    name: 'content_review',
    comment: '内容审核表',
    engine: 'InnoDB',
    rows: 8,
    data_free: 4096,
    data_length: 32768,
    updated_date: now(),
  },
  {
    name: 'ops_crontab',
    comment: '定时任务表',
    engine: 'InnoDB',
    rows: 3,
    data_free: 0,
    data_length: 16384,
    updated_date: now(),
  },
];

/** 表回收站 */
const GEN_TABLE_RECYCLE: Record<string, any>[] = [
  { id: 1, name: 'tmp_demo', comment: '演示临时表', deleted_at: now() },
];

/** 代码生成配置（generator/code） */
const GEN_CODES: Record<string, any>[] = [
  {
    id: 1,
    plugin_name: 'admin',
    table_name: 'member_user',
    table_content: '会员用户表',
    module_name: 'member',
    class_name: 'MemberUser',
    edit_type: 'dialog',
    order_type: 'desc',
    parent_menu: 'member',
    is_delete: 1,
    delete_column_name: 'deleted_at',
    order_column_name: 'id',
    columns: [
      {
        column_name: 'id',
        column_comment: '主键',
        column_type: 'bigint',
        is_primary_key: 1,
        is_required: 0,
        is_insert: 0,
        is_update: 0,
        is_lists: 1,
        is_search: 0,
        is_query: 0,
        is_sort: 1,
        query_type: '=',
        form_type: 'input',
        view_type: 'input',
        dict_code: '',
      },
      {
        column_name: 'username',
        column_comment: '用户名',
        column_type: 'varchar',
        is_primary_key: 0,
        is_required: 1,
        is_insert: 1,
        is_update: 1,
        is_lists: 1,
        is_search: 1,
        is_query: 1,
        is_sort: 0,
        query_type: 'LIKE',
        form_type: 'input',
        view_type: 'input',
        dict_code: '',
      },
      {
        column_name: 'nickname',
        column_comment: '昵称',
        column_type: 'varchar',
        is_primary_key: 0,
        is_required: 0,
        is_insert: 1,
        is_update: 1,
        is_lists: 1,
        is_search: 1,
        is_query: 1,
        is_sort: 0,
        query_type: 'LIKE',
        form_type: 'input',
        view_type: 'input',
        dict_code: '',
      },
      {
        column_name: 'status',
        column_comment: '状态',
        column_type: 'tinyint',
        is_primary_key: 0,
        is_required: 1,
        is_insert: 1,
        is_update: 1,
        is_lists: 1,
        is_search: 0,
        is_query: 1,
        is_sort: 0,
        query_type: '=',
        form_type: 'radio',
        view_type: 'dict-tag',
        dict_code: 'common.EnabledStatus',
      },
      {
        column_name: 'created_at',
        column_comment: '创建时间',
        column_type: 'datetime',
        is_primary_key: 0,
        is_required: 0,
        is_insert: 0,
        is_update: 0,
        is_lists: 1,
        is_search: 0,
        is_query: 0,
        is_sort: 1,
        query_type: '=',
        form_type: 'datetime',
        view_type: 'datetime',
        dict_code: '',
      },
    ],
    relations: [],
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 2,
    plugin_name: 'admin',
    table_name: 'ops_crontab',
    table_content: '定时任务表',
    module_name: 'ops',
    class_name: 'OpsCrontab',
    edit_type: 'dialog',
    order_type: 'desc',
    parent_menu: 'ops',
    is_delete: 0,
    delete_column_name: '',
    order_column_name: 'id',
    columns: [
      {
        column_name: 'id',
        column_comment: '主键',
        column_type: 'bigint',
        is_primary_key: 1,
        is_required: 0,
        is_insert: 0,
        is_update: 0,
        is_lists: 1,
        is_search: 0,
        is_query: 0,
        is_sort: 1,
        query_type: '=',
        form_type: 'input',
        view_type: 'input',
        dict_code: '',
      },
      {
        column_name: 'title',
        column_comment: '任务名称',
        column_type: 'varchar',
        is_primary_key: 0,
        is_required: 1,
        is_insert: 1,
        is_update: 1,
        is_lists: 1,
        is_search: 1,
        is_query: 1,
        is_sort: 0,
        query_type: 'LIKE',
        form_type: 'input',
        view_type: 'input',
        dict_code: '',
      },
    ],
    relations: [],
    created_at: now(),
    updated_at: now(),
  },
];

/** 字段配置（generate-column/generatecolumn） */
const GEN_COLUMNS: Record<string, any>[] = [
  {
    id: 1,
    generator_id: 1,
    table_name: 'member_user',
    column_name: 'username',
    column_comment: '用户名',
    column_type: 'varchar',
    is_required: 1,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 2,
    generator_id: 1,
    table_name: 'member_user',
    column_name: 'nickname',
    column_comment: '昵称',
    column_type: 'varchar',
    is_required: 0,
    created_at: now(),
    updated_at: now(),
  },
];

// ==================== 辅助 ====================

function mockStructure(name: string) {
  const cols = [
    {
      field: 'id',
      type: 'bigint unsigned',
      collation: null,
      nullable: 'NO',
      key: 'PRI',
      default: null,
      extra: 'auto_increment',
      comment: '主键',
    },
    {
      field: 'name',
      type: 'varchar(64)',
      collation: 'utf8mb4_unicode_ci',
      nullable: 'NO',
      key: '',
      default: '',
      extra: '',
      comment: '名称',
    },
    {
      field: 'status',
      type: 'tinyint',
      collation: null,
      nullable: 'YES',
      key: '',
      default: '1',
      extra: '',
      comment: '状态',
    },
    {
      field: 'created_at',
      type: 'datetime',
      collation: null,
      nullable: 'YES',
      key: '',
      default: null,
      extra: '',
      comment: '创建时间',
    },
  ];
  return {
    name,
    column_count: cols.length,
    columns: cols,
    create_sql: `CREATE TABLE \`${name}\` (\n  \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,\n  \`name\` varchar(64) NOT NULL DEFAULT '' COMMENT '名称',\n  \`status\` tinyint DEFAULT '1' COMMENT '状态',\n  \`created_at\` datetime DEFAULT NULL,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  };
}

function mockPreviewFiles(code: Record<string, any>) {
  const cls = code.class_name ?? 'Demo';
  const mod = code.module_name ?? 'demo';
  return [
    {
      file_dir: `app/adminapi/controller/${mod}/`,
      name: `${cls}Controller.php`,
      content: `<?php\n\ndeclare(strict_types=1);\n\nnamespace app\\adminapi\\controller\\${mod};\n\nclass ${cls}Controller\n{\n    // ${code.table_content}\n}`,
    },
    {
      file_dir: `app/adminapi/service/${mod}/`,
      name: `${cls}Service.php`,
      content: `<?php\n\ndeclare(strict_types=1);\n\nclass ${cls}Service\n{\n}`,
    },
    {
      file_dir: `app/adminapi/dao/${mod}/`,
      name: `${cls}Dao.php`,
      content: `<?php\n\ndeclare(strict_types=1);\n\nclass ${cls}Dao\n{\n}`,
    },
    {
      file_dir: `app/model/${mod}/`,
      name: `${cls}.php`,
      content: `<?php\n\ndeclare(strict_types=1);\n\nclass ${cls} extends Model\n{\n    protected $table = '${code.table_name}';\n}`,
    },
    {
      file_dir: `template/admin/src/api/${mod}/`,
      name: 'index.ts',
      content: `import BaseService from '#/api/core/base';\n\nconst baseUrl = '/${mod}/${code.table_name}';\n\nexport const ${cls}Service = {\n  ...BaseService({ baseUrl }),\n};`,
    },
    {
      file_dir: `template/admin/src/views/${mod}/`,
      name: 'index.vue',
      content: `<template>\n  <Page> ${code.table_content} </Page>\n</template>`,
    },
  ];
}

// ==================== 路由 ====================

const generatorRoutes: RouteDef[] = [
  // 插件开发列表（basic-settings 下拉）
  {
    method: 'GET',
    pattern: '/plugin/select',
    handler: ({ query }: Ctx) => {
      if (query.format === 'select') {
        return [
          { label: 'admin（主框架）', value: 'admin' },
          { label: 'workflow（工作流）', value: 'workflow' },
        ];
      }
      return { items: [], total: 0 };
    },
  },
  {
    method: 'GET',
    pattern: '/codegen/generator/code',
    handler: ({ query }: Ctx) => {
      let list = GEN_CODES;
      const kw = query.LIKE_table_name ?? query.keyword;
      if (kw) {
        list = list.filter((c) => String(c.table_name).includes(String(kw)));
      }
      return paginate(list, query);
    },
  },
  {
    method: 'POST',
    pattern: '/codegen/generator/code',
    handler: ({ body }: Ctx) => {
      // import-table：{ table: [names] }
      const tables = Array.isArray(body.table)
        ? body.table
        : [body.table ?? body.table_name];
      const created: Record<string, any>[] = [];
      for (const name of tables) {
        const t = GEN_TABLES.find((x) => x.name === name);
        const row = {
          id: GEN_CODES.length + 1 + created.length,
          plugin_name: 'admin',
          table_name: name,
          table_content: t?.comment ?? name,
          module_name: String(name).split('_')[0] ?? 'demo',
          class_name: '',
          edit_type: 'dialog',
          order_type: 'desc',
          parent_menu: '',
          is_delete: 1,
          delete_column_name: 'deleted_at',
          order_column_name: 'id',
          columns: [],
          relations: [],
          created_at: now(),
          updated_at: now(),
        };
        GEN_CODES.unshift(row);
        created.push(row);
      }
      return created.length === 1 ? created[0] : created;
    },
  },
  {
    method: 'DELETE',
    pattern: '/codegen/generator/code',
    handler: ({ body }: Ctx) => crud.remove(GEN_CODES, toIds(body.ids)),
  },
  {
    method: 'GET',
    pattern: '/codegen/generator/code/:id/preview',
    handler: ({ event, params }: Ctx) => {
      const code = crud.find(GEN_CODES, params[0]);
      return code ? mockPreviewFiles(code) : failWith(event, '配置不存在', -1);
    },
  },
  {
    method: 'GET',
    pattern: '/codegen/generator/code/:id/download',
    handler: ({ event }: Ctx) => {
      event.node.res.setHeader('Content-Type', 'application/zip');
      event.node.res.setHeader(
        'Content-Disposition',
        'attachment; filename="codegen.zip"',
      );
      event.node.res.end(Buffer.from('mock codegen zip', 'utf-8'));
      return RAW;
    },
  },
  {
    method: 'PUT',
    pattern: '/codegen/generator/code/:id/deploy',
    handler: ({ body, params }: Ctx) => {
      const code = crud.update(GEN_CODES, params[0], body);
      return {
        success: Boolean(code),
        message: code ? '部署完成（mock）' : '配置不存在',
        files: code ? mockPreviewFiles(code).length : 0,
      };
    },
  },
  {
    method: 'GET',
    pattern: '/codegen/generator/code/:id',
    handler: ({ event, params }: Ctx) => {
      const code = crud.find(GEN_CODES, params[0]);
      return code ?? failWith(event, '配置不存在', -1);
    },
  },
  {
    method: 'PUT',
    pattern: '/codegen/generator/code/:id',
    handler: ({ body, params }: Ctx) => {
      const code = crud.update(GEN_CODES, params[0], body);
      return code ?? null;
    },
  },
  {
    method: 'DELETE',
    pattern: '/codegen/generator/code/:id',
    handler: ({ params }: Ctx) => crud.remove(GEN_CODES, [params[0]]),
  },
];

const tableRoutes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/codegen/generator/table/table-list',
    handler: ({ query }: Ctx) => {
      let list = GEN_TABLES;
      const kw = query.LIKE_name ?? query.keyword;
      if (kw) {
        list = list.filter((t) => String(t.name).includes(String(kw)));
      }
      return paginate(list, query);
    },
  },
  {
    method: 'GET',
    pattern: '/codegen/generator/table/recycle-list',
    handler: ({ query }: Ctx) => paginate(GEN_TABLE_RECYCLE, query),
  },
  {
    method: 'GET',
    pattern: '/codegen/generator/table/:name/structure',
    handler: ({ params }: Ctx) => mockStructure(params[0]),
  },
  {
    method: 'POST',
    pattern: '/codegen/generator/table/optimize',
    handler: ({ body }: Ctx) => ({
      data: GEN_TABLES.map((t) => ({ name: t.name, success: true })),
    }),
  },
  {
    method: 'POST',
    pattern: '/codegen/generator/table/cleanup',
    handler: ({ body }: Ctx) => ({
      data: GEN_TABLES.map((t) => ({ name: t.name, success: true })),
    }),
  },
  {
    method: 'POST',
    pattern: '/codegen/generator/table/create',
    handler: ({ body }: Ctx) => {
      const row = {
        name: body.name ?? 'new_table',
        comment: body.comment ?? '',
        engine: 'InnoDB',
        rows: 0,
        data_free: 0,
        data_length: 16384,
        updated_date: now(),
      };
      GEN_TABLES.unshift(row);
      return row;
    },
  },
  {
    method: 'POST',
    pattern: '/codegen/generator/table/recycle',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids)) {
        const idx = GEN_TABLES.findIndex((t) => String(t.name) === String(id));
        if (idx >= 0) {
          const [t] = GEN_TABLES.splice(idx, 1);
          GEN_TABLE_RECYCLE.unshift({
            id: GEN_TABLE_RECYCLE.length + 1,
            name: t.name,
            comment: t.comment,
            deleted_at: now(),
          });
        }
      }
      return null;
    },
  },
  {
    method: 'PUT',
    pattern: '/codegen/generator/table/recycle/restore',
    handler: ({ body }: Ctx) => {
      for (const id of toIds(body.ids)) {
        const idx = GEN_TABLE_RECYCLE.findIndex(
          (t) => String(t.id) === String(id),
        );
        if (idx >= 0) {
          const [t] = GEN_TABLE_RECYCLE.splice(idx, 1);
          GEN_TABLES.unshift({
            name: t.name,
            comment: t.comment,
            engine: 'InnoDB',
            rows: 0,
            data_free: 0,
            data_length: 16384,
            updated_date: now(),
          });
        }
      }
      return null;
    },
  },
  {
    method: 'DELETE',
    pattern: '/codegen/generator/table/recycle',
    handler: ({ body }: Ctx) => crud.remove(GEN_TABLE_RECYCLE, toIds(body.ids)),
  },
];

export default [
  ...generatorRoutes,
  ...tableRoutes,
  ...crudRoutes('/generate-column/generatecolumn', GEN_COLUMNS, {
    searchFields: ['column_name'],
    filterFields: ['generator_id'],
  }),
] as RouteDef[];
