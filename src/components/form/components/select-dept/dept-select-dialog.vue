<template>
  <div class="dept-select-modal">
    <div class="header">
      <ElInput
        v-model="searchText"
        :placeholder="$t('select-dept.search.placeholder')"
        :prefix-icon="Search"
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
            <el-radio
              :model-value="selectedKeys.length > 0 ? selectedKeys[0] : ''"
              :value="String(data[rowKey])"
              @click.prevent.stop="handleRadioClick($event, data)"
            >
              <span class="radio-hidden-label"></span>
            </el-radio>
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

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { ElInput, ElButton, ElTree, ElMessage, ElRadio } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { DeptService } from "@/api/setting/dept/dept";
import type { DeptRow } from "@/api/setting/dept/types";
import { $t } from "@/locales";

const props = withDefaults(
  defineProps<{
    value?: string[];
    multiple?: boolean;
    rowKey?: string;
    checkStrictly?: boolean;
    filterIds?: string[];
  }>(),
  {
    value: () => [],
    multiple: true,
    rowKey: "id",
    checkStrictly: false,
    filterIds: () => [],
  }
);

const emit = defineEmits<{
  (e: "select", selected: DeptRow[]): void;
}>();

const treeRef = ref();
const searchText = ref("");
const deptTree = ref<DeptRow[]>([]);
const selectedKeys = ref<string[]>([]);

const defaultProps = {
  children: "children",
  label: "name",
};

const allSelected = computed(() => {
  const allKeys = getAllKeys();
  return selectedKeys.value.length === allKeys.length && allKeys.length > 0;
});

const getAllKeys = (): string[] => {
  const keys: string[] = [];
  const traverse = (nodes: DeptRow[]) => {
    nodes.forEach((node) => {
      keys.push(String(node[props.rowKey as keyof DeptRow]));
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(deptTree.value);
  return keys;
};

const loadDeptTree = async () => {
  try {
    let tree = await DeptService.getTree();

    if (props.filterIds && props.filterIds.length > 0) {
      const filterSet = new Set(props.filterIds.map((id) => String(id)));
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
    console.error("加载部门树失败:", error);
    ElMessage.error("加载部门树失败");
  }
};

const filterTreeByIds = (nodes: DeptRow[], idSet: Set<string>): DeptRow[] => {
  return nodes.reduce<DeptRow[]>((acc, node) => {
    const nodeId = String(node[props.rowKey as keyof DeptRow]);
    const filteredChildren = node.children ? filterTreeByIds(node.children, idSet) : [];
    if (idSet.has(nodeId) || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children || [],
      });
    }
    return acc;
  }, []);
};

const filterNode = (value: string, data: DeptRow) => {
  if (!value) return true;
  return data.name.includes(value);
};

const isSelected = (data: DeptRow) => {
  return selectedKeys.value.includes(String(data[props.rowKey as keyof DeptRow]));
};

const handleCheck = (checked: any, node: any) => {
  if (props.multiple) {
    selectedKeys.value = treeRef.value?.getCheckedKeys() || [];
  }
  emitSelect();
};

const handleNodeClick = (data: DeptRow) => {
  // 单选不在此处理，由 handleNodeLabelClick / handleRadioClick 处理
};

const handleNodeLabelClick = (data: DeptRow, node: any) => {
  if (!props.multiple) {
    const key = String(data[props.rowKey as keyof DeptRow]);
    if (selectedKeys.value.length > 0 && selectedKeys.value[0] === key) {
      selectedKeys.value = [];
    } else {
      selectedKeys.value = [key];
    }
    emitSelect();
  }
};

const handleRadioClick = (event: Event, data: DeptRow) => {
  event.preventDefault();
  event.stopPropagation();
  const key = String(data[props.rowKey as keyof DeptRow]);
  if (selectedKeys.value.length > 0 && selectedKeys.value[0] === key) {
    selectedKeys.value = [];
  } else {
    selectedKeys.value = [key];
  }
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
  let selectedNodes: DeptRow[] = [];
  if (props.multiple) {
    selectedNodes = treeRef.value?.getCheckedNodes() || [];
  } else {
    // 单选模式下，根据selectedKeys查找对应的节点
    if (selectedKeys.value.length > 0) {
      const findNode = (nodes: DeptRow[], key: string): DeptRow | null => {
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
      const node = findNode(deptTree.value, selectedKeys.value[0]);
      if (node) {
        selectedNodes = [node];
      }
    }
  }
  emit("select", selectedNodes);
};

const getSelected = (): DeptRow[] => {
  if (props.multiple) {
    return treeRef.value?.getCheckedNodes() || [];
  } else {
    // 单选模式下，根据selectedKeys查找对应的节点
    let selectedNodes: DeptRow[] = [];
    if (selectedKeys.value.length > 0) {
      const findNode = (nodes: DeptRow[], key: string): DeptRow | null => {
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
      const node = findNode(deptTree.value, selectedKeys.value[0]);
      if (node) {
        selectedNodes = [node];
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
  { deep: true }
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

<style lang="scss" scoped>
.dept-select-modal {
  height: 400px;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    :deep(.el-input) {
      flex: 1;
      max-width: 300px;
    }
  }

  :deep(.el-tree) {
    flex: 1;
    overflow: auto;
    padding: 8px;
    border-radius: 4px;
    // border: 1px solid var(--el-border-color-lighter);

    .el-tree-node {
      .tree-node-content {
        display: flex;
        align-items: center;
        width: 100%;

        .radio-wrapper {
          margin-right: 8px;
          display: flex;
          align-items: center;

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
          color: #409eff;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
