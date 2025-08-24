<template>
  <div class="dept-tree-wrapper">
    <!-- 搜索框 -->
    <div class="search-box">
      <ElInput
        v-model="searchKeyword"
        placeholder="请输入部门名称关键字"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <Icon icon="ant-design:search-outlined" />
        </template>
      </ElInput>
    </div>

    <!-- 部门树 -->
    <ElTree
      ref="treeRef"
      :data="filteredTreeData"
      :props="{ label: 'name', children: 'children' }"
      node-key="id"
      show-checkbox
      :filter-node-method="filterNode"
      @check="handleTreeCheck"
    >
    </ElTree>
  </div>
</template>

<script setup lang="ts">
  import { DeptService } from '@/api/sys/dept'
  import { Icon } from '@/components/icon'

  const treeRef = ref()
  const treeData = ref([])
  const filteredTreeData = ref([])
  const searchKeyword = ref('')

  const props = defineProps<{
    value: string[]
  }>()

  const emit = defineEmits(['update:value'])

  const handleTreeCheck = (data: any, { checkedKeys }: any) => {
    emit('update:value', checkedKeys)
  }

  // 过滤节点的方法
  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.name.includes(value)
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    treeRef.value.filter(value)
  }

  watch(
    () => props.value,
    () => {
      treeRef.value.setCheckedKeys(props.value)
    }
  )

  onMounted(() => {
    DeptService.tree({}).then((res: any) => {
      treeData.value = res
      filteredTreeData.value = res
    })
  })
</script>

<style lang="scss" scoped>
  .dept-tree-wrapper {
    .search-box {
      margin-bottom: 12px;
    }

    :deep(.el-tree) {
      .el-tree-node.is-hidden {
        display: none;
      }
    }
  }
</style>
