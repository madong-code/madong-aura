<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
    <ArtSearchBar
      v-model:filter="searchFormState"
      :items="searchSchemas"
      @reset="handleReset"
      @search="handleSearch"
    />
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refresh">
        <template #left>
          <TableAction
            :actions="[
              {
                label: '新增',
                type: 'primary',
                icon: '&#xe83e;',
                auth: 'sys:user:save'
              }
            ]"
          />
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        rowKey="id"
        :loading="loading"
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="tsx">
  import { ActionItem, TableAction } from '@/components/table-action/index'

  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import { ElMessage } from 'element-plus'
  import { searchSchemas, tableSchemas } from './schemas'
  defineOptions({ name: 'sys:user' })
  const searchFormState = ref({})

  const handleReset = () => {
    searchFormState.value = {}
    searchData()
  }
  const handleSearch = () => {
    searchData(searchFormState.value)
  }
  const {
    tableData,
    columns,
    columnChecks,
    isLoading: loading,
    paginationState: pagination,
    refreshAll: refresh,
    searchData,
    onPageSizeChange: handleSizeChange,
    onCurrentPageChange: handleCurrentChange
  } = useTable<any>({
    core: {
      apiFn: UserService.getUserList,
      apiParams: {
        // 其他搜索参数
      },
      columnsFactory: () => [
        ...tableSchemas,
        {
          prop: '__ACTION__',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row: unknown) => {
            const actions: ActionItem[] = [
              {
                label: '编辑',
                type: 'primary',
                link: true,
                size: 'small',
                auth: 'sys:user:update',
                onClick: handleEdit.bind(null, row)
              }
            ]
            const dropDownActions: ActionItem[] = [
              {
                label: '删除',
                type: 'danger',
                icon: '&#xe783;',
                size: 'small',
                auth: 'sys:user:remove',
                confirm: {
                  title: '提示',
                  content: '确定删除吗？',
                  ok: handleDelete.bind(null, row)
                }
              }
            ]
            return <TableAction actions={actions} dropDownActions={dropDownActions} />
          }
        }
      ]
    }
  })
  const handleEdit = (row: any) => {
    console.log(row)
    ElMessage.info(`编辑用户 ${row.nickName} 成功}`)
  }
  const handleDelete = (row: any) => {
    ElMessage.info(`删除用户 ${row.nickName}`)
  }
  const multipleSelection = ref([])
  const handleSelectionChange = (val: any) => {
    multipleSelection.value = val
  }
</script>
