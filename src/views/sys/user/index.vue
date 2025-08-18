<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
    <SearchBar @reset="handleReset" @submit="handleSearch" />
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <TableAction
            :actions="[
              {
                label: '新增',
                type: 'primary',
                icon: '&#xe83e;',
                auth: 'sys:user:save',
                onClick: handleAdd.bind(null)
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
    <UserForm ref="userFormRef" />
    <UserDetail ref="userDetailRef" />
  </div>
</template>

<script setup lang="tsx">
  import { ActionItem, TableAction } from '@/components/table-action/index'

  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import { ElMessage } from 'element-plus'
  import { searchSchemas, tableSchemas } from './schemas'
  import { useSearchBar } from '@/components/search-bar'
  import UserForm from './form.vue'
  import UserDetail from './detail.vue'
  defineOptions({ name: 'sys:user' })
  const userFormRef = ref()
  const userDetailRef = ref()

  const handleReset = () => {
    Object.assign(searchParams, {})
    getData()
  }
  const handleSearch = (param: any) => {
    Object.assign(searchParams, param)
    // 搜索参数赋值
    getData()
    console.log(searchBarApi.getFormRef())
  }
  const [SearchBar, searchBarApi] = useSearchBar(searchSchemas)
  const {
    data: tableData,
    columns,
    columnChecks,
    loading,
    pagination,
    refreshData,
    searchParams,
    getData,
    handleSizeChange,
    handleCurrentChange
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
                label: '详情',
                type: 'primary',
                link: true,
                size: 'small',
                auth: 'sys:user:detail',
                onClick: handleDetail.bind(null, row)
              },
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
  const handleAdd = () => {
    userFormRef.value.show({
      isUpdate: false
    })
  }
  const handleEdit = (row: any) => {
    userFormRef.value.show({
      data: row,
      isUpdate: true
    })
  }
  const handleDetail = (row: any) => {
    userDetailRef.value.show({
      data: row
    })
  }
  const handleDelete = (row: any) => {
    ElMessage.info(`删除用户 ${row.nickName}`)
  }
  const multipleSelection = ref([])
  const handleSelectionChange = (val: any) => {
    multipleSelection.value = val
  }
</script>
