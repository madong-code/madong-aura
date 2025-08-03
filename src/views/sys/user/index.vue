<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
    <ArtSearchBar
      v-model:filter="searchFormState"
      :items="formItems"
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
        <template #__ACTION__="{ row }">
          <TableAction
            :actions="[
              {
                label: '编辑',
                type: 'primary',
                link: true,
                size: 'small',
                auth: 'sys:user:update',
                onClick: handleEdit.bind(null, row)
              }
            ]"
            :drop-down-actions="[
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
            ]"
          />
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { TableAction } from '@/components/table-action/index'

  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import { SearchFormItem } from '@/types'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'UserMixedUsageExample' })
  const searchFormState = ref({})
  // --- 表单配置项 ---
  const formItems: SearchFormItem[] = [
    {
      label: '用户名',
      prop: 'name',
      type: 'input',
      config: {
        clearable: true
      },
      elColSpan: 6
    },
    {
      label: '性别',
      prop: 'sex',
      type: 'dict',

      config: {
        clearable: true,
        code: 'sex',
        // 多选
        multiple: true
      },
      elColSpan: 4
    },
    {
      label: '是否锁定',
      prop: 'isLocked',
      type: 'dict',
      config: {
        clearable: true,
        multiple: true,
        code: 'yes_no',
        renderType: 'CheckboxGroup',
        isBtn: true
      },
      elColSpan: 4
    },
    {
      label: '注册时间',
      prop: 'createTime',
      type: 'daterange',
      config: {
        clearable: true
      },
      elColSpan: 6
    }
  ]
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
        // ...searchFormState.value
      },
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        {
          type: 'selection'
        },
        {
          prop: 'nickName',
          label: '昵称'
        },
        {
          prop: 'adminType',
          label: '管理员类型',
          component: 'ApiDict',
          componentProps: {
            code: 'sys_user_admin_type'
          }
        },
        {
          prop: 'sex',
          label: '性别',
          component: 'ApiDict',
          componentProps: {
            code: 'sex'
          }
        },
        {
          prop: 'mobilePhone',
          label: '手机号码'
        },
        {
          prop: '__ACTION__',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          useSlot: true
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
