<script setup lang="ts">
import type { DeptRow } from '#/api/system/dept/types';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { ElInput, ElMessage, ElRadio, ElTree } from 'element-plus';

import { DeptService } from '#/api/system/dept';
import { $t } from '#/locales';

const props = withDefaults(
  defineProps<{
    checkStrictly?: boolean;
    filterIds?: string[];
    multiple?: boolean;
    rowKey?: string;
    value?: string[];
  }>(),
  {
    value: () => [],
    multiple: true,
    rowKey: 'id',
    checkStrictly: false,
    filterIds: () => [],
  },
);

const emit = defineEmits<{
  (e: 'select', selected: any[]): void;
}>();

const treeRef = ref();
const searchText = ref('');
const deptTree = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);

const defaultProps = {
  children: 'children',
  label: 'name',
};

const allSelected = computed(() => {
  const allKeys = getAllKeys();
  return selectedKeys.value.length === allKeys.length && allKeys.length > 0;
});

const getAllKeys = (): string[] => {
  const keys: string[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach((node: any) => {
      keys.push(String(node[props.rowKey as keyof DeptRow]));
      if (node.children?.length) traverse(node.children);
    });
  };
  traverse(deptTree.value);
  return keys;
};

const loadDeptTree = async () => {
  try {
    let tree = await DeptService.getTree();

    if (props.filterIds && props.filterIds.length > 0) {
      const filterSet = new Set(props.filterIds.map(String));
      tree = filterTreeByIds(tree, filterSet);
    }

    deptTree.value = tree;

    if (props.value && props.value.length > 0) {
      selectedKeys.value = props.value;
      nextTick(() => {
        treeRef.value?.setCheckedKeys(props.value, true);
      });
    }
  } catch (error) {
    console.error('加载部门树失败:', error);
    ElMessage.error('加载部门树失败');
  }
};

const filterTreeByIds = (nodes: any[], idSet: Set<string>): any[] => {
  const result: any[] = [];
  for (const node of nodes) {
    const nodeId = String(node[props.rowKey as keyof DeptRow]);
    const filteredChildren = node.children
      ? filterTreeByIds(node.children, idSet)
      : [];
    if (idSet.has(nodeId) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children:
          filteredChildren.length > 0 ? filteredChildren : node.children || [],
      });
    }
  }
  return result;
};

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name.includes(value);
};

const isSelected = (data: DeptRow) => {
  return selectedKeys.value.includes(
    String(data[props.rowKey as keyof DeptRow]),
  );
};

const handleCheck = (_checked: any, _node: any) => {
  if (props.multiple) {
    selectedKeys.value = treeRef.value?.getCheckedKeys() || [];
  }
  emitSelect();
};

const handleNodeClick = (_data: DeptRow) => {
  // 单选不在此处理，由 handleNodeLabelClick / handleRadioClick 处理
};

const handleNodeLabelClick = (data: DeptRow, _node: any) => {
  if (!props.multiple) {
    const key = String(data[props.rowKey as keyof DeptRow]);
    selectedKeys.value =
      selectedKeys.value.length > 0 && selectedKeys.value[0] === key
        ? []
        : [key];
    emitSelect();
  }
};

const handleRadioClick = (event: Event, data: DeptRow) => {
  event.preventDefault();
  event.stopPropagation();
  const key = String(data[props.rowKey as keyof DeptRow]);
  selectedKeys.value =
    selectedKeys.value.length > 0 && selectedKeys.value[0] === key ? [] : [key];
  emitSelect();
};

const handleExpandAll = () => {
  const allNodes = treeRef.value?.store?._getAllNodes?.() || [];
  allNodes.forEach((node: any) => {
    node.expand?.();
  });
};

const handleCollapseAll = () => {
  const allNodes = treeRef.value?.store?._getAllNodes?.() || [];
  allNodes.forEach((node: any) => {
    node.collapse?.();
  });
};

const handleSelectAll = () => {
  if (allSelected.value) {
    selectedKeys.value = [];
    treeRef.value?.setCheckedKeys([], true);
  } else {
    selectedKeys.value = getAllKeys();
    treeRef.value?.setCheckedKeys(selectedKeys.value, true);
  }
  emitSelect();
};

const emitSelect = () => {
  let selectedNodes: any[] = [];
  if (props.multiple) {
    selectedNodes = treeRef.value?.getCheckedNodes() || [];
  } else {
    // 单选模式下，根据selectedKeys查找对应的节点
    if (selectedKeys.value.length > 0) {
      const findNode = (nodes: any[], key: string): any | null => {
        for (const node of nodes) {
          if (String(node[props.rowKey as keyof DeptRow]) === key) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children, key);
            if (found) return found;
          }
        }
        return null;
      };
      const firstKey = selectedKeys.value[0];
      if (firstKey) {
        const node = findNode(deptTree.value, firstKey);
        if (node) {
          selectedNodes = [node];
        }
      }
    }
  }
  emit('select', selectedNodes as DeptRow[]);
};

const getSelected = (): any[] => {
  if (props.multiple) {
    return treeRef.value?.getCheckedNodes() || [];
  } else {
    let selectedNodes: any[] = [];
    if (selectedKeys.value.length > 0) {
      const findNode = (nodes: any[], key: string): any | null => {
        for (const node of nodes) {
          if (String(node[props.rowKey as keyof DeptRow]) === key) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children, key);
            if (found) return found;
          }
        }
        return null;
      };
      const firstKey = selectedKeys.value[0];
      if (firstKey) {
        const node = findNode(deptTree.value, firstKey);
        if (node) selectedNodes = [node];
      }
    }
    return selectedNodes;
  }
};

watch(
  () => props.value,
  (newValue) => {
    if (newValue) {
      selectedKeys.value = newValue;
      nextTick(() => {
        treeRef.value?.setCheckedKeys(newValue, true);
      });
    }
  },
  { deep: true },
);

onMounted(() => {
  loadDeptTree();
});

defineExpose({
  getSelected,
  handleExpandAll,
  handleCollapseAll,
  handleSelectAll,
  allSelected,
});
</script>

<template>
  <div class="dept-select-modal">
    <div class="header">
      <ElInput
        v-model="searchText"
        :placeholder="$t('components.form.select_dept.search_placeholder')"
        clearable
      />
    </div>
    <ElTree
      ref="treeRef"
      :data="deptTree"
      :props="defaultProps"
      :node-key="rowKey"
      :default-expand-all="true"
      :show-checkbox="multiple"
      :check-strictly="true"
      :check-on-click-node="multiple"
      :filter-node-method="filterNode"
      @check="handleCheck"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="tree-node-content">
          <!-- 单选：所有节点显示 radio -->
          <span v-if="!multiple" class="radio-wrapper">
            <ElRadio
              :model-value="selectedKeys.length > 0 ? selectedKeys[0] : ''"
              :value="String(data[rowKey])"
              @click.prevent.stop="handleRadioClick($event, data)"
            >
              <span class="radio-hidden-label"></span>
            </ElRadio>
          </span>
          <span
            :class="{ selected: isSelected(data) }"
            @click="handleNodeLabelClick(data, node)"
          >
            {{ data.name }}
          </span>
        </div>
      </template>
    </ElTree>
  </div>
</template>

<style lang="scss" scoped>
.dept-select-modal {
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 16px;

  .header {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;

    :deep(.el-input) {
      flex: 1;
      max-width: 300px;
    }
  }

  :deep(.el-tree) {
    flex: 1;
    padding: 8px;
    overflow: auto;
    border-radius: 4px;
    // border: 1px solid var(--el-border-color-lighter);

    .el-tree-node {
      .tree-node-content {
        display: flex;
        align-items: center;
        width: 100%;

        .radio-wrapper {
          display: flex;
          align-items: center;
          margin-right: 8px;

          :deep(.el-radio) {
            margin-right: 0;
          }

          :deep(.el-radio__label) {
            display: none;
          }
        }

        span:not(.radio-wrapper) {
          flex: 1;
          cursor: pointer;

          &:hover {
            color: #409eff;
          }
        }

        .selected {
          font-weight: 500;
          color: #409eff;
        }
      }
    }
  }
}
</style>
