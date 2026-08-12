<script setup lang="ts">
import type { PostRow } from '#/api/system/post/types';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import {
  ElCheckbox,
  ElInput,
  ElMessage,
  ElRadio,
  ElTag,
  ElTree,
} from 'element-plus';

import { DeptService } from '#/api/system/dept';
import { PostService } from '#/api/system/post';
import { $t } from '#/locales';

const props = withDefaults(
  defineProps<{
    deptIds?: string[];
    multiple?: boolean;
    rowKey?: string;
    value?: string[];
  }>(),
  {
    value: () => [],
    multiple: true,
    rowKey: 'id',
    deptIds: () => [],
  },
);

const emit = defineEmits<{
  (e: 'select', selected: PostRow[]): void;
}>();

const treeRef = ref();
const searchText = ref('');
const positions = ref<PostRow[]>([]);
const deptTree = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);
const isUpdating = ref(false);

const treeProps = {
  children: 'children',
  label: 'name',
};

const deptPostTree = computed(() => {
  // 构建部门-职位树形结构
  const buildTree = (depts: any[]): any[] => {
    return depts.map((dept: any) => {
      // 找到该部门的职位（确保类型匹配）
      const deptIdStr = String(dept.id);
      const deptPosts = positions.value.filter(
        (post) => String(post.dept_id) === deptIdStr,
      );

      // 构建职位节点
      const postNodes = deptPosts.map((post) => ({
        id: post[props.rowKey as keyof PostRow],
        key: post[props.rowKey as keyof PostRow],
        name: post.name,
        code: post.code,
        enabled: post.enabled,
        disabled: !post.enabled, // 禁用状态：当 enabled 为 false 时，节点被禁用
        sort: post.sort,
        dept_id: post.dept_id,
        isPost: true, // 标记为职位节点
      }));

      // 递归处理子部门
      const children: any[] = dept.children?.length
        ? buildTree(dept.children)
        : [];

      // 合并子部门和职位
      return {
        ...dept,
        key: dept.id,
        children: [...children, ...postNodes],
        isPost: false, // 标记为部门节点
      };
    });
  };

  return buildTree(deptTree.value);
});

const selectedPositions = computed(() => {
  return positions.value.filter((pos) =>
    selectedKeys.value.includes(String(pos[props.rowKey as keyof PostRow])),
  );
});

const loadData = async () => {
  try {
    // 构建部门树参数
    const deptParams =
      props.deptIds && props.deptIds.length > 0
        ? { ids: props.deptIds.join(',') }
        : {}; // 当没有传 deptIds 时，不传递参数，加载全部部门

    // 并行加载部门树和职位列表
    const [depts, posts] = await Promise.all([
      DeptService.getTree(deptParams),
      PostService.list({}),
    ]);

    // 确保部门树是数组
    if (Array.isArray(depts)) {
      deptTree.value = depts;
    } else {
      console.warn('部门树数据格式错误，期望数组:', depts);
      deptTree.value = [];
    }

    // 确保职位列表是数组
    let filteredPosts = [];

    // 处理不同格式的职位数据
    if (Array.isArray(posts)) {
      filteredPosts = posts;
    } else if (posts && typeof posts === 'object') {
      // 处理分页数据格式 {items: [...], total: number}
      if (posts.items && Array.isArray(posts.items)) {
        filteredPosts = posts.items;
      } else if (posts.list && Array.isArray(posts.list)) {
        // 处理 {list: [...]} 格式
        filteredPosts = posts.list;
      } else {
        filteredPosts = [];
      }
    } else {
      filteredPosts = [];
    }

    // 根据 deptIds 过滤职位
    if (props.deptIds && props.deptIds.length > 0) {
      const deptIdSet = new Set(props.deptIds.map(String));
      filteredPosts = filteredPosts.filter((post: any) =>
        deptIdSet.has(String(post.dept_id)),
      );
    }

    positions.value = filteredPosts;

    const valueArray = Array.isArray(props.value)
      ? props.value
      : props.value
        ? [String(props.value)]
        : [];

    if (valueArray.length > 0) {
      const validPositionIds = new Set(
        positions.value.map((pos) =>
          String(pos[props.rowKey as keyof PostRow]),
        ),
      );
      selectedKeys.value = [
        ...valueArray.filter((key) => validPositionIds.has(String(key))),
      ];
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
    // 确保数据是数组，避免后续操作出错
    deptTree.value = [];
    positions.value = [];
    selectedKeys.value = [];
  }
};

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  // 搜索职位名称
  return data.name.includes(value);
};

const isSelected = (data: any) => {
  return selectedKeys.value.includes(String(data.id));
};

const handleSearch = () => {
  if (treeRef.value) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    treeRef.value.filter(searchText.value);
  }
};

const handleCheck = (checked: any, node: any) => {
  // 检查是否正在更新选中状态，如果是则直接返回
  if (isUpdating.value) {
    return;
  }

  // 检查 node.data 是否存在
  if (!node || !node.data) {
    return;
  }

  // 检查节点是否被禁用
  if (node.disabled) {
    return;
  }

  // 只处理职位节点的选择
  if (!node.data.isPost) {
    // 阻止部门节点的选择，但不要在这里修改 node.checked
    // 因为 setCheckedKeys 会自动处理部门节点
    return;
  }

  const nodeId = String(node.data.id);

  if (props.multiple) {
    // 多选模式
    if (checked) {
      // 添加到选中列表
      if (!selectedKeys.value.includes(nodeId)) {
        selectedKeys.value = [...selectedKeys.value, nodeId];
      }
    } else {
      // 从选中列表中移除
      selectedKeys.value = [
        ...selectedKeys.value.filter((key) => key !== nodeId),
      ];
    }
  } else {
    // 单选模式
    selectedKeys.value = checked ? [nodeId] : [];
  }

  emitSelect();
};

const handleNodeClick = (_data: any, _node: any) => {
  // noop
};

const handleNodeLabelClick = (data: any, node: any) => {
  if (node && node.disabled) {
    return;
  }

  if (!props.multiple && data.isPost) {
    const key = String(data.id);
    if (selectedKeys.value.length > 0 && selectedKeys.value[0] === key) {
      selectedKeys.value = [];
      emitSelect();
    } else {
      selectedKeys.value = [key];
      emitSelect();
    }
  }
};

const handleRadioClick = (event: Event, data: any) => {
  event.preventDefault();
  event.stopPropagation();
  const key = String(data.id);
  selectedKeys.value =
    selectedKeys.value.length > 0 && selectedKeys.value[0] === key ? [] : [key];
  emitSelect();
};

const handleRemove = (id: string) => {
  selectedKeys.value = [...selectedKeys.value.filter((key) => key !== id)];
  nextTick(() => {
    emitSelect();
  });
};

const emitSelect = () => {
  const selected = positions.value.filter((pos) =>
    selectedKeys.value.includes(String(pos[props.rowKey as keyof PostRow])),
  );
  emit('select', selected);
};

const getSelected = (): PostRow[] => {
  // 如果 positions.value 为空，直接返回空数组
  if (!positions.value || positions.value.length === 0) {
    return [];
  }

  const selected = positions.value.filter((pos) =>
    selectedKeys.value.includes(String(pos[props.rowKey as keyof PostRow])),
  );
  return selected;
};

watch(
  () => props.value,
  (newValue) => {
    isUpdating.value = true;
    try {
      if (newValue) {
        const valueArray = Array.isArray(newValue)
          ? newValue.map(String)
          : [String(newValue)];
        selectedKeys.value = [...valueArray];
      } else {
        selectedKeys.value = [];
      }
      nextTick(() => {
        isUpdating.value = false;
      });
    } catch {
      isUpdating.value = false;
    }
  },
  { deep: true },
);

// 监听部门IDs变化，重新加载数据
watch(
  () => props.deptIds,
  () => {
    loadData();
  },
  { deep: true },
);

onMounted(() => {
  loadData();
});

const allSelected = computed(() => {
  const allPostKeys = positions.value.map((pos) =>
    String(pos[props.rowKey as keyof PostRow]),
  );
  return (
    selectedKeys.value.length === allPostKeys.length && allPostKeys.length > 0
  );
});

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
  selectedKeys.value = allSelected.value
    ? []
    : positions.value.map((pos) => String(pos[props.rowKey as keyof PostRow]));
  emitSelect();
};

defineExpose({
  getSelected,
  selectedKeys,
  positions,
  handleExpandAll,
  handleCollapseAll,
  handleSelectAll,
  allSelected,
});
</script>

<template>
  <div class="position-select-modal">
    <div class="header">
      <ElInput
        v-model="searchText"
        :placeholder="$t('components.form.select_position.search_placeholder')"
        clearable
        @input="handleSearch"
      />
    </div>
    <div class="selected-list" v-if="multiple && selectedPositions.length > 0">
      <ElTag
        v-for="pos in selectedPositions"
        :key="pos.id"
        closable
        @close="handleRemove(String(pos.id))"
      >
        {{ pos.name }}
      </ElTag>
    </div>
    <div class="tree-container">
      <ElTree
        ref="treeRef"
        :data="deptPostTree"
        :props="treeProps"
        node-key="id"
        :default-expand-all="true"
        :show-checkbox="false"
        :check-strictly="true"
        :check-on-click-node="multiple"
        :filter-node-method="filterNode"
        @check="handleCheck"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content" :data-is-post="data.isPost">
            <!-- 多选模式：职位节点显示复选框 -->
            <span v-if="data.isPost && multiple" class="checkbox-wrapper">
              <ElCheckbox
                :model-value="isSelected(data)"
                :disabled="node.disabled"
                @update:model-value="
                  (checked: any) => handleCheck(checked, node)
                "
              />
            </span>
            <!-- 单选模式：职位节点显示单选框 -->
            <span v-else-if="data.isPost && !multiple" class="radio-wrapper">
              <ElRadio
                :model-value="selectedKeys.length > 0 ? selectedKeys[0] : ''"
                :value="String(data.id)"
                :disabled="node.disabled"
                @click.prevent.stop="handleRadioClick($event, data)"
              >
                <span class="radio-hidden-label"></span>
              </ElRadio>
            </span>
            <!-- 部门节点占位符 -->
            <span v-else-if="!multiple" class="radio-wrapper is-empty"></span>
            <span v-else class="checkbox-placeholder"></span>
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
  </div>
</template>

<style lang="scss" scoped>
.position-select-modal {
  padding: 16px;

  .header {
    margin-bottom: 16px;
    border: 1px solid var(--el-border-color-lighter);

    :deep(.el-input) {
      max-width: 300px;
    }
  }

  .selected-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    margin-bottom: 16px;
    background-color: #f9fafc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  .tree-container {
    height: 400px;
    padding: 8px;
    overflow: auto;
    border-radius: 4px;
    // border: 1px solid var(--el-border-color-lighter);

    :deep(.el-tree) {
      .el-tree-node {
        .tree-node-content {
          display: flex;
          align-items: center;
          width: 100%;

          .checkbox-wrapper {
            display: flex;
            align-items: center;
            margin-right: 8px;
          }

          .radio-wrapper {
            display: flex;
            align-items: center;
            min-width: 14px;
            margin-right: 8px;

            &.is-empty {
              min-width: 14px;
            }

            :deep(.el-radio) {
              margin-right: 0;
            }

            :deep(.el-radio__label) {
              display: none;
            }
          }

          .checkbox-placeholder {
            display: inline-block;
            width: 20px;
            margin-right: 8px;
          }

          span:not(.checkbox-wrapper):not(.checkbox-placeholder):not(
              .radio-wrapper
            ) {
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

        // 为职位节点添加特殊样式
        .tree-node-content[data-is-post='true'] {
          padding-left: 16px;
        }
      }
    }
  }
}
</style>
