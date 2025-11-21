<template>
  <div class="user-page art-full-height">
    <div class="tree-container">
      <div class="left-sidebar">
        <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
          <DeptTree v-model:value="deptIdList" @check="handleCheck" />
        </ElCard>
      </div>
      <div class="right-content art-full-height">
        <BasicCrud @reset="handleReset" />
      </div>
    </div>
    <GrantRole ref="grantRoleRef" />
  </div>
</template>
<script setup lang="tsx">
  import { useCrud } from '@/components/crud'
  import { crudSchema } from './schemas'
  import GrantRole from './grant-role.vue'
  import DeptTree from './dept-tree.vue'
  const grantRoleRef = ref()
  const deptIdList = ref([])

  const [BasicCrud, crudApi] = useCrud({
    ...crudSchema,
    beforeFetch: (params: any) => {
      return { ...params, m_IN_deptId: deptIdList.value }
    },
    // hasAdd: true,
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [],
    // 表格行操作-下拉菜单
    dropDownActions: [
      {
        label: '授权角色',
        icon: 'ant-design:team-outlined',
        type: 'primary',
        link: true,
        dialogRef: grantRoleRef,
        dialogParams() {
          return {
            getCrudApi: () => crudApi
          }
        }
      }
    ]
  })
  const handleCheck = () => {
    crudApi.reload()
  }
  const handleReset = () => {
    deptIdList.value = []
  }
</script>
<style lang="scss" scoped>
  .tree-container {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    // gap: 16px;
    .left-sidebar {
      flex-shrink: 0;
      width: 280px;
      height: 100%;
    }

    .right-content {
      flex-grow: 1;
      min-width: 0;
      height: 100%;
    }

    .art-table-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }

  @media screen and (max-width: 800px) {
    .tree-container {
      display: block;
      gap: 0;
      height: auto;

      .left-sidebar {
        width: 100%;
        height: auto;
        margin-bottom: 20px;
      }
    }
  }
</style>
