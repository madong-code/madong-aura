<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
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

  defineOptions({ name: 'UserMixedUsageExample' })

  const {
    tableData,
    columns,
    columnChecks,
    isLoading: loading,
    paginationState: pagination,
    refreshAll: refresh,
    onPageSizeChange: handleSizeChange,
    onCurrentPageChange: handleCurrentChange
  } = useTable<any>({
    core: {
      apiFn: UserService.getUserList,
      apiParams: {
        name: '',
        phone: '',
        address: undefined
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
