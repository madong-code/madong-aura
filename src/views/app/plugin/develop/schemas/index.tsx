/** 插件开发 - CRUD 配置 */
import type { CrudSchema } from '#/components/crud/components/types';

import { ElTag } from 'element-plus';

import { z } from '#/adapter/form';
import { AppPluginDevelopService } from '#/api/app/plugin/develop';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: (params) => AppPluginDevelopService.getList(params) as any,
      add: (data) => AppPluginDevelopService.create(data),
      edit: (data) => AppPluginDevelopService.update(data.id, data),
      remove: (id) => AppPluginDevelopService.remove(id),
      batchRemove: ({ ids }) => AppPluginDevelopService.batchRemove(ids),
      view: (id) => AppPluginDevelopService.getDetail(id) as any,
    },
    hasAdd: true,
    hasEdit: true,
    hasRemove: true,
    hasView: true,
    permissions: {
      add: 'plugin:develop:create',
      edit: 'plugin:develop:update',
      remove: 'plugin:develop:delete',
      view: 'plugin:develop:read',
    },

    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'title',
        title: $t('app.plugin.develop.list.title'),
        align: 'left',
        minWidth: 200,
        /** 图标 + 名称 + 已安装标签 */
        cellRender: ({ row }: any) => {
          return (
            <div class="flex items-center gap-2">
              {row.icon ? (
                <img
                  alt=""
                  class="size-8 shrink-0 rounded-sm object-cover"
                  src={row.icon}
                />
              ) : (
                <span class="flex-center size-8 shrink-0 rounded-sm bg-gray-100 text-base dark:bg-gray-700">
                  📦
                </span>
              )}
              <span class="font-medium">{row.title}</span>
              {row.installed_at ? (
                <ElTag effect="dark" round size="small" type="success">
                  已安装
                </ElTag>
              ) : null}
            </div>
          );
        },
      },
      {
        field: 'key',
        title: $t('app.plugin.develop.list.key'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'type',
        title: $t('app.plugin.develop.list.type'),
        minWidth: 80,
      },
      {
        field: 'author',
        title: $t('app.plugin.develop.list.author'),
        minWidth: 100,
      },
      {
        field: 'version',
        title: $t('app.plugin.develop.list.version'),
        minWidth: 80,
      },
      {
        field: 'status',
        title: $t('app.plugin.develop.list.status'),
        width: 100,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'installed_at',
        title: $t('app.plugin.develop.list.install_status'),
        width: 140,
        slots: {
          default: ({ row }: any) => {
            const installed = !!row.installed_at;
            return (
              <div class="inline-flex items-center gap-1">
                <ElTag
                  effect={installed ? 'dark' : 'plain'}
                  type={installed ? 'success' : 'info'}
                >
                  {installed
                    ? $t('app.plugin.develop.list.installed')
                    : $t('app.plugin.develop.list.uninstalled')}
                </ElTag>
                {installed && (
                  <span class="text-xs text-gray-400">{row.installed_at}</span>
                )}
              </div>
            );
          },
        },
      },
      {
        field: 'created_at',
        title: $t('app.plugin.develop.list.created_at'),
        width: 180,
        show: false,
        formatter: 'formatDateTime',
        visible: false,
      },
      {
        field: 'updated_at',
        title: $t('app.plugin.develop.list.updated_at'),
        width: 180,
        formatter: 'formatDateTime',
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_desc',
          label: $t('app.plugin.develop.search.desc'),
          componentProps: {
            placeholder: $t('app.plugin.develop.search.desc'),
            clearable: true,
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_title',
          label: $t('app.plugin.develop.search.title'),
          componentProps: {
            placeholder: $t('app.plugin.develop.search.title'),
            clearable: true,
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_status',
          label: $t('app.plugin.develop.search.status'),
          componentProps: { code: 'sys_enabled_status', clearable: true },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('app.plugin.develop.title'),
      width: 'w-[60%]',
      dialogType: 'drawer',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 100, labelAlign: 'right' },
      schema: [
        // 图标（内置 Avatar 上传组件）
        {
          label: $t('app.plugin.develop.form.icon'),
          fieldName: 'icon',
          component: 'Avatar',
          formItemClass: 'col-span-2',
          componentProps: {},
        },
        // 封面
        {
          label: $t('app.plugin.develop.form.cover'),
          fieldName: 'cover',
          component: 'Avatar',
          formItemClass: 'col-span-2',
          componentProps: {},
        },
        // ID（隐藏，编辑时用于识别）
        {
          label: 'ID',
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: {
            triggerFields: ['id'],
            show: false,
          },
        },
        // 标题
        {
          label: $t('app.plugin.develop.form.title'),
          fieldName: 'title',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('app.plugin.develop.form.title_placeholder'),
          },
        },
        // 标识（新增时可编辑，编辑时禁用）
        {
          label: $t('app.plugin.develop.form.key'),
          fieldName: 'key',
          component: 'Input',
          rules: z
            .string()
            .min(1, $t('app.plugin.develop.form.key_required'))
            .regex(
              /^[a-z][a-z0-9_]*$/,
              $t('app.plugin.develop.form.key_pattern'),
            ),
          formItemClass: 'col-span-2',
          componentProps: (values: any) => ({
            placeholder: values?.id
              ? $t('app.plugin.develop.form.key_disabled')
              : $t('app.plugin.develop.form.key_placeholder'),
            disabled: !!values?.id,
          }),
        },
        // 作者
        {
          label: $t('app.plugin.develop.form.author'),
          fieldName: 'author',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('app.plugin.develop.form.author_placeholder'),
          },
        },
        // 版本
        {
          label: $t('app.plugin.develop.form.version'),
          fieldName: 'version',
          component: 'Input',
          defaultValue: '1.0.0',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('app.plugin.develop.form.version_placeholder'),
          },
        },
        // 类型
        {
          label: $t('app.plugin.develop.form.type'),
          fieldName: 'type',
          component: 'Select',
          defaultValue: 'madong:plugin',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('app.plugin.develop.form.type_placeholder'),
            options: [
              {
                label: $t('app.plugin.develop.form.type_options.app'),
                value: 'madong:app',
              },
              {
                label: $t('app.plugin.develop.form.type_options.module'),
                value: 'madong:plugin',
              },
            ],
          },
        },
        // 描述
        {
          label: $t('app.plugin.develop.form.desc'),
          fieldName: 'desc',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('app.plugin.develop.form.desc_placeholder'),
          },
        },
      ],
    },
  };
};
