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
        <template #sexText="{ row }">
          <ElTag v-if="row.sex === 1" type="success">男</ElTag>
          <ElTag v-else-if="row.sex === 2" type="danger">女</ElTag>
          <ElTag v-else type="info">未知</ElTag>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import { ElTag } from 'element-plus'
  import ApiDict from '@/components/view/api-dict.vue'

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
          prop: 'sex',
          label: '性别',
          sortable: true,
          formatter: (row) => {
            // 用来格式化内容，可以返回文本，也可以返回组件
            return h(ApiDict, {
              value: row.sex,
              code: 'sex'
            })
          }
        },
        {
          prop: 'userPhone',
          label: '手机号'
        },
        {
          prop: 'sexText',
          label: '性别',
          useSlot: true
          // slotName: 'test'
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
            item.sexText = '男'
          } else if (item.sex == 2) {
            item.sexText = '女'
          } else {
            item.sexText = '未知'
          }
        })
        return data
      }
    }
  })
</script>
