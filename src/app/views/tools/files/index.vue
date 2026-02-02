<template>
  <div class="sys-post-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  import { $t } from '@/locales'
  import { FilesService } from '@/app/api/tools/files'

  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema(),
    // 左侧工具栏
    toolbarActions: [
      {
        label: $t('tools.files.list.table.columns.actions.delete.label'),
        type: 'danger',
        icon: 'ant-design:delete-outlined',
        auth: 'system:files:delete',
        ifShow: () => crudApi.getReadonlyState().selection.length > 0,
        confirm: {
          title: $t('tools.files.list.table.columns.actions.delete.title'),
          content: $t('tools.files.list.table.columns.actions.delete.confirm'),
          ok() {
            crudApi.removeByApi({})
          }
        }
      }
    ],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [
      {
        label: $t('tools.files.list.table.columns.actions.download'),
        type: 'primary',
        sort: 1020,
        link: true,
        icon: 'ant-design:download-outlined',
        auth: 'system:files:download',
        onClick: (e: Event, record: any) => {
          handleDownload(record)
        }
      },
      {
        label: $t('tools.files.list.table.columns.actions.delete.label'),
        type: 'primary',
        sort: 1020,
        link: true,
        icon: 'ant-design:delete-outlined',
        auth: 'upload:files:delete',
        confirm: {
          title: $t('tools.files.list.table.columns.actions.delete.title'),
          content: $t('tools.files.list.table.columns.actions.delete.confirm'),
          ok(record: any) {
            crudApi.removeByApi(record)
          }
        }
      }
    ],
    // 表格行操作-下拉菜单
    dropDownActions: []
  })

  /**
   * 文件下载
   * @param record
   */
  const handleDownload = (record: any) => {
    FilesService.downloadById(record.id)
      .then((result) => {
        const blob = new Blob([result]) // 确保 result 是 Blob 数据
        const blobURL = window.URL.createObjectURL(blob)
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = blobURL
        // 从 record 中获取文件名，提供一个默认值
        const filename = record.filename || 'downloaded-file'
        tempLink.setAttribute('download', filename)
        document.body.appendChild(tempLink)
        tempLink.click()
        tempLink.remove()
        window.URL.revokeObjectURL(blobURL)
      })
      .catch((err) => {
        console.error('下载失败:', err)
      })
  }
</script>
<style lang="scss" scoped></style>
