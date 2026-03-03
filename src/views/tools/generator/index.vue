<template>
  <div class="generator-page art-full-height">
    <BasicCrud />
    <ImportTable ref="importTableRef" />
    <CodePreview ref="codePreviewRef" />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  import { $t } from '@/locales'
  import { useRouter } from 'vue-router'
  import ImportTable from './components/import-table.vue'
  import CodePreview from './components/code-preview.vue'
  import { GeneratorCodeService } from '@/api/tools/generator'
  import { downloadFile } from '@/utils/tool'
  const router = useRouter()
  const importTableRef = ref(null)
  const codePreviewRef = ref(null)

  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema(),
    // 左侧工具栏
    toolbarActions: [
      {
        label: '导入数据库',
        type: 'primary',
        icon: 'ri:upload-2-line',
        sort: 1010,
        auth: 'generate:code:import_table',
        dialogRef: importTableRef
      }
    ],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    tableActionColumn: [
      {
        minWidth: '400'
      }
    ],
    // 表格行操作
    tableActions: [
      {
        label: '编辑',
        type: 'primary',
        icon: 'ant-design:edit-outlined',
        sort: 1020,
        link: true,
        auth: 'dev:crontab:execute',
        onClick: async (e: Event, row: any) => {
          router.push({
            path: '/generator/code',
            query: {
              id: row.id
            }
          })
        }
      }
    ],
    // 表格行操作-下拉菜单
    dropDownActions: [
      {
        label: '预览',
        type: 'primary',
        sort: 1020,
        link: true,
        icon: 'ri:eye-line',
        auth: 'generate:code:preview',
        dialogRef: codePreviewRef,
        dialogParams: (record: any) => ({
          record
        })
      },
      {
        label: '部署',
        type: 'primary',
        sort: 1020,
        icon: 'ri:refresh-line',
        link: true,
        auth: 'generate:code:deploy',
        onClick: async (e: Event, row: any) => {
          await GeneratorCodeService.deploy(row.id)
          crudApi.refreshUpdate()
        }
      },
      {
        label: '下载代码',
        type: 'primary',
        sort: 1020,
        icon: 'ri:download-line',
        link: true,
        auth: 'generate:code:download',
        onClick: async (e: Event, row: any) => {
          download(row.id)
        }
      }
    ]
  })

  /**
   * 代码下载
   */
  const download = async (id: number | string) => {
    const response = await GeneratorCodeService.download(id)
    if (response) {
      downloadFile(response, 'codegen.zip')
      ElMessage.success('代码生成成功，开始下载')
    } else {
      ElMessage.error('文件下载失败')
    }
  }
</script>
<style lang="scss" scoped></style>
