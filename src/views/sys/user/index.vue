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
          <ElButton v-ripple>新增用户</ElButton>
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
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import { SearchFormItem } from '@/types'

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
      label: '字典',
      prop: 'sex',
      type: 'dict',
      config: {
        clearable: true,
        code: 'sex'
      },
      elColSpan: 4
    },
    {
      label: '是否锁定',
      prop: 'isLocked',
      type: 'radio',
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ],
      config: {
        clearable: true,
        multiple: true
      },
      elColSpan: 3
    },
    {
      label: '性别',
      prop: 'sex',
      type: 'select',
      options: [
        {
          label: '男',
          value: 1
        },
        {
          label: '女',
          value: 2
        },
        {
          label: '未知',
          value: 3
        }
      ],
      config: {
        clearable: true,
        multiple: true
      },
      elColSpan: 3
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
          prop: 'id',
          label: 'ID'
        },
        {
          prop: 'nickName',
          label: '昵称'
        },
        {
          prop: 'adminType',
          label: '管理员类型',
          sortable: true,
          component: 'Select',
          componentProps: {
            options: [
              { label: '超级管理员', value: 1 },
              { label: '管理员', value: 2 },
              { label: '普通用户', value: 3 }
            ]
          }
        },
        {
          prop: 'sex',
          label: '性别',
          sortable: true,
          component: 'ApiDict',
          componentProps: {
            code: 'sex'
          }
        },
        {
          prop: 'userPhone',
          label: '手机号'
        },
        {
          prop: 'sexList',
          label: '性别',
          component: 'ApiDict',
          componentProps: {
            code: 'sex',
            typeMap: {
              1: 'success',
              2: 'danger',
              3: 'info'
            },
            useColorList: false
          }
        }
      ]
    },
    transform: {
      // responseAdapter(response) {
      //   // 响应数据适配器
      //   // console.log(response)
      //   return {
      //     records: response.rows,
      //     total: response.recordCount,
      //     current: response.pageNum,
      //     size: response.pageSize
      //   }
      // }
      dataTransformer(data: any) {
        // data==>上面的records
        data?.forEach((item: any) => {
          if (item.sex == 1) {
            item.sexList = [1]
          } else if (item.sex == 2) {
            item.sexList = [2]
          } else {
            item.sexList = [1, 2, 3]
          }
        })
        return data
      }
    }
  })
</script>
