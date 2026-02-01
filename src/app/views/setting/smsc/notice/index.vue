<template>
  <div class="notice-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  import { $t } from '@/locales'
  import NoticeService, { NoticeRow } from '@/app/api/network/notice'

  // 定义onActionClick函数
  const onActionClick = ({ code, row }: { code: string; row: any }) => {}

  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema(onActionClick),
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [],
    // 表格行操作-下拉菜单
    dropDownActions: [
      {
        label: $t('system.notice.list.table.columns.actions.publish.label'),
        type: 'primary',
        sort: 10,
        link: true,
        icon: 'ant-design:pushpin-outlined',
        auth: 'system:notice:publish',
        onClick(e: Event, row: NoticeRow) {
          handlePublish(row)
        }
      }
    ]
  })

  // 发布公告函数
  async function handlePublish(row: NoticeRow) {
    try {
      await ElMessageBox.confirm(
        $t('system.notice.list.table.columns.actions.publish.confirm'),
        $t('system.notice.list.table.columns.actions.publish.title'),
        {
          type: 'warning'
        }
      )
      await NoticeService.publish({ id: row.id })
      ElMessage.success($t('common.message.success'))
    } catch (error) {
      // 用户取消操作或其他错误
      if (error !== 'cancel') {
        ElMessage.error($t('common.message.error'))
      }
    }
  }
</script>
<style lang="scss" scoped></style>
