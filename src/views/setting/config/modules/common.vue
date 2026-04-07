<template>
  <div class="config-page art-full-height">
    <BasicCrud />
    <ConfigDialog ref="configDialogRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud, type CrudSchema } from "@/components/crud";
import ConfigService from '@/api/setting/config/config'
import ConfigDialog from './config-dialog.vue'
import { DictEnum } from '@/enums'
import { ElMessage, ElMessageBox } from 'element-plus'
import { $t } from '@/locales'
import { E } from "vue-router/dist/router-CWoNjPRp.mjs";


const configDialogRef = ref()

// 格式化JSON预览
const formatJsonPreview = (value: any) => {
  try {
    let parsedValue = value
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value)
      } catch {
        return value
      }
    }
    if (typeof parsedValue === 'object' && parsedValue !== null) {
      return JSON.stringify(parsedValue, null, 2)
    }
    return parsedValue
  } catch {
    return value
  }
}

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

// crud配置
const crudSchema = (): CrudSchema => {
  return {
    rowKey: 'code',
    api: ConfigService.getItems,
    requestMethod: 'post',
    afterFetch: (res: any) => {
      return {
        items: res?.items || [],
        total: res?.total || 0
      }
    },
    beforeFetch: (params: any) => ({
      ...params,
      groupCode: 'common'
    }),
    immediate: true,
    columns: [
      { prop: 'name', label: $t('setting.config.common.list.table.columns.name'), width: 180 },
      { prop: 'code', label: $t('setting.config.common.list.table.columns.code'), width: 200 },
      {
        prop: 'content',
        label: $t('setting.config.common.list.table.columns.content'),
        minWidth: 250,
        formatter: (row: any) => formatJsonPreview(row.content)
      },
      {
        prop: 'enabled',
        component: 'ApiDict',
        componentProps: {
          code: DictEnum.SYS_ENABLED_STATUS
        },
        label: $t('setting.config.common.list.table.columns.enabled'),
        width: 80
      },
      {
        prop: 'updated_at',
        label: $t('setting.config.common.list.table.columns.updated_at'),
        align: 'center',
        minWidth: 170,

        formatter: (row: any) => formatTime(row.updated_at)
      }
    ],
    searchFormSchema: {
      schema: [
        {
          component: 'Input',
          componentProps: {
            placeholder: $t('setting.config.common.list.query.keyword')
          },
          prop: 'keyword',
          label: ''
        }
      ]
    },
    crudApi: {
      add: (params: any) => {
        const { group_code, code, name, content, remark } = params
        return ConfigService.save({ group_code, code, name, content, remark })
      },
      edit: (params: any) => {
        const { group_code, code, name, content, remark, enabled } = params
        return ConfigService.update(code, { group_code, code, name, content, remark, enabled })
      },
      remove: (params: any) => {
        const codes = params.codes || params.code
        if (Array.isArray(codes)) {
          return Promise.all(codes.map((code: string) => ConfigService.delete(code)))
        }
        return ConfigService.delete(codes)
      }
    },
    dialogTitle: $t('setting.config.common.title')
  }
}

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  tableActionColumn: {
    width: 280,
  },
  toolbarActions: [
    {
      label: $t('setting.config.common.list.table.toolbar.create'),
      type: 'primary',
      icon: 'ant-design:plus-outlined',
      dialogRef: configDialogRef,
      dialogParams() {
        return {
          isEdit: false,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    }
  ],
  tableActions: [
        {
      label: $t('setting.config.common.list.table.actions.edit'),
      type: 'primary',
      sort: 10,
      link: true,
      icon: 'ant-design:edit-outlined',
      dialogRef: configDialogRef,
      dialogParams(record: any) {
        return {
          data: record,
          isEdit: true,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
    {
      label: $t('setting.config.common.list.table.actions.delete'),
      type: 'danger',
      sort: 50,
      link: true,
      icon: 'ant-design:delete-outlined',
      onClick: (event : Event,  record: any) => {
        const message = $t('setting.config.common.list.table.actions.delete_confirm', { name: record.name }) as string
        ElMessageBox.confirm(message, $t('common.prompt'), {
          type: 'warning'
        }).then(() => {
          ConfigService.delete(record.code).then(() => {
            ElMessage.success($t('setting.config.common.form.message.delete_success'))
            crudApi.refreshRemove()
          }).catch(() => {
            ElMessage.error($t('setting.config.common.form.message.delete_failed'))
          })
        }).catch(() => {})
      }
    }

  ],
  dropDownActions: [
  ],
})
</script>
<style lang="scss" scoped></style>
