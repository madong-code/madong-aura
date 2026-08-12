<script setup lang="ts">
import type { ElTree as ElTreeType } from 'element-plus';

import type { CrudApiInstance } from '#/adapter/crud';

import { computed, nextTick, ref } from 'vue';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElTree,
} from 'element-plus';

import { AuthService } from '#/api/system';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

interface TreeNode {
  id: number | string;
  title: string;
  name: string;
  type: 1 | 2 | 3 | 4;
  children?: TreeNode[];
}

const emit = defineEmits<{ success: [] }>();
const typeLabels = computed<Record<number, string>>(() => ({
  1: $t('system.role.auth_menu.type_labels.dir'),
  2: $t('system.role.auth_menu.type_labels.menu'),
  3: $t('system.role.auth_menu.type_labels.button'),
  4: $t('system.role.auth_menu.type_labels.api'),
}));
const typeColors: Record<number, string> = {
  1: '#4080ff',
  2: '#00b42a',
  3: '#e6a23c',
  4: '#722ed1',
};

let menuTreeData: TreeNode[] = [];

const treeRef = ref<InstanceType<typeof ElTreeType>>();
const treeData = ref<TreeNode[]>([]);
const currentRow = ref<any>(null);
const crudApi = ref<CrudApiInstance>();
const treeLoaded = ref(false);

// ===== 构建树数据 =====
const buildTreeData = (nodes: TreeNode[]): TreeNode[] => {
  return nodes.map((node) => {
    const converted: TreeNode = { ...node };
    if (node.children) {
      converted.children = buildTreeData(node.children);
    }
    return converted;
  });
};

// ===== 只首次加载一次权限树 =====
const initPermissionTree = async () => {
  if (treeLoaded.value) return;
  treeLoaded.value = true;
  try {
    const res = await AuthService.getUserPermission();
    menuTreeData = (res || []) as TreeNode[];
  } catch {
    treeLoaded.value = false;
    menuTreeData = [];
  }
  treeData.value = buildTreeData(menuTreeData);
};

// ===== 选中状态管理 =====
const setCheckedKeys = (keys: (number | string)[]) => {
  const tree = treeRef.value;
  if (!tree) return;
  tree.setCheckedKeys([]);
  nextTick(() => {
    keys.forEach((k) => tree.setChecked(k, true, false));
  });
};

/**
 * 获取选中的全部菜单ID（含父级目录）
 *
 * 说明：Element Plus Tree 的 getCheckedKeys(true) 只返回叶子节点，
 * 导致父级目录 ID 不包含在保存数据中。当后端用这些 ID 做角色菜单关联时，
 * 只会存叶子 ID，下次加载时 Tree 无法还原完整的层级结构。
 *
 * 修复方案：合并 getCheckedKeys() + getHalfCheckedKeys()，
 * 同时包含完全选中和半选中的节点（即所有关联的父级目录），
 * 确保后端 sys_role_menu 表中存有完整的父子关系链。
 */
const getCheckedKeysWithParents = (): (number | string)[] => {
  const tree = treeRef.value;
  if (!tree) return [];
  const checked = tree.getCheckedKeys() as (number | string)[];
  const halfChecked = tree.getHalfCheckedKeys() as (number | string)[];
  return [...new Set([...checked, ...halfChecked])];
};

// ===== 回显已授权菜单 =====
const loadData = async (roleId: number | string) => {
  try {
    const ids = await AuthService.getRoleMenuIds({ role_id: roleId });
    setCheckedKeys(ids || []);
  } catch {
    setCheckedKeys([]);
  }
};

// ===== Dialog =====
const [Dialog, dialogApi] = useDialog({
  title: $t('system.role.auth_menu.title'),
  width: '50%',
  dialogType: 'drawer',
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  async onConfirm() {
    const keys = getCheckedKeysWithParents();
    dialogApi.setState({ confirmLoading: true, loading: true });
    try {
      await AuthService.saveRoleMenu({
        role_id: currentRow.value.id,
        menu_id: keys as (number | string)[],
      });
      ElMessage.success($t('system.role.auth_menu.success'));
      crudApi.value?.refreshCreate();
      emit('success');
      dialogApi.close();
    } catch {
      // error handled by service
    } finally {
      dialogApi.setState({ confirmLoading: false, loading: false });
    }
  },
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudApiInstance }) {
    currentRow.value = data;
    crudApi.value = getCrudApi();
    dialogApi.setState({
      title: $t('system.role.auth_menu.title_template', { name: data.name }),
    });
    dialogApi.open();
    nextTick(() => {
      setCheckedKeys([]);
      initPermissionTree().then(() => {
        if (currentRow.value?.id) loadData(currentRow.value.id);
      });
    });
  },
});

// ===== 展开 / 折叠 / 选择 工具 =====
const traverse = (nodes: TreeNode[], fn: (n: TreeNode) => void) => {
  nodes.forEach((n) => {
    fn(n);
    if (n.children) traverse(n.children, fn);
  });
};

const expandNode = (key: number | string) => {
  const n = treeRef.value?.getNode(key);
  if (n) n.expanded = true;
};

const collapseNode = (key: number | string) => {
  const n = treeRef.value?.getNode(key);
  if (n) n.expanded = false;
};

const expandAll = () => traverse(treeData.value, (n) => expandNode(n.id));
const collapseAll = () => traverse(treeData.value, (n) => collapseNode(n.id));

const expandToLevel = (level: number) => {
  collapseAll();
  const fn = (nodes: TreeNode[], cur: number) => {
    nodes.forEach((n) => {
      if (cur <= level) expandNode(n.id);
      if (n.children && cur < level) fn(n.children, cur + 1);
    });
  };
  fn(treeData.value, 1);
};

const selectAll = () =>
  traverse(treeData.value, (n) => treeRef.value?.setChecked(n.id, true, false));
const selectNone = () =>
  traverse(treeData.value, (n) =>
    treeRef.value?.setChecked(n.id, false, false),
  );

const selectInverse = () => {
  const leafKeys: (number | string)[] = [];
  const collect = (nodes: TreeNode[]) => {
    nodes.forEach((n) => {
      if (!n.children || n.children.length === 0) {
        leafKeys.push(n.id);
      } else {
        collect(n.children);
      }
    });
  };
  collect(treeData.value);

  const checkedKeys = getCheckedKeysWithParents();
  const toCheck = leafKeys.filter((k) => !checkedKeys.includes(k));

  treeRef.value?.setCheckedKeys([]);
  nextTick(() => {
    toCheck.forEach((k) => treeRef.value?.setChecked(k, true, false));
  });
};

const handleToolCommand = (command: string) => {
  switch (command) {
    case 'collapse-all': {
      collapseAll();
      break;
    }
    case 'expand-all': {
      expandAll();
      break;
    }
    case 'expand-level-1': {
      expandToLevel(1);
      break;
    }
    case 'expand-level-2': {
      expandToLevel(2);
      break;
    }
    case 'select-all': {
      selectAll();
      break;
    }
    case 'select-inverse': {
      selectInverse();
      break;
    }
    case 'select-none': {
      selectNone();
      break;
    }
  }
};
</script>

<template>
  <Dialog>
    <div class="auth-tree">
      <ElTree
        ref="treeRef"
        :data="treeData"
        show-checkbox
        node-key="id"
        :props="{ label: 'title', children: 'children' }"
      >
        <template #default="{ data }">
          <span class="gt-row">
            <span
              class="gt-tag"
              :style="{ backgroundColor: typeColors[data.type] }"
            >
              {{ typeLabels[data.type] }}
            </span>
            <span class="gt-name">{{ data.title || data.name }}</span>
          </span>
        </template>
      </ElTree>
    </div>
    <template #prepend-footer>
      <div class="footer-tools">
        <ElDropdown @command="handleToolCommand">
          <ElButton size="small" text>
            {{ $t('system.role.auth_menu.toolbar.operation') }}
            <ElIcon>
              <svg
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="expand-all">
                {{ $t('system.role.auth_menu.toolbar.expand_all') }}
              </ElDropdownItem>
              <ElDropdownItem command="expand-level-1">
                {{ $t('system.role.auth_menu.toolbar.expand_level_1') }}
              </ElDropdownItem>
              <ElDropdownItem command="expand-level-2">
                {{ $t('system.role.auth_menu.toolbar.expand_level_2') }}
              </ElDropdownItem>
              <ElDropdownItem command="collapse-all">
                {{ $t('system.role.auth_menu.toolbar.collapse_all') }}
              </ElDropdownItem>
              <ElDropdownItem divided command="select-all">
                {{ $t('system.role.auth_menu.toolbar.select_all') }}
              </ElDropdownItem>
              <ElDropdownItem command="select-none">
                {{ $t('system.role.auth_menu.toolbar.select_none') }}
              </ElDropdownItem>
              <ElDropdownItem command="select-inverse">
                {{ $t('system.role.auth_menu.toolbar.select_inverse') }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.auth-tree {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
}

.auth-tree :deep(.el-tree-node__content) {
  min-height: 32px;
  padding: 4px 0 !important;
}

.auth-tree :deep(.el-tree-node__children) {
  padding-left: 20px !important;
}

.auth-tree :deep(.el-tree-node.is-leaf > .el-tree-node__expand-icon) {
  visibility: hidden;
}

.gt-row {
  display: flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
}

.gt-tag {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  border-radius: 3px;
}

.gt-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.footer-tools {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.footer-tools :deep(.el-button) {
  padding: 8px 12px;
  font-size: 14px;
}

.footer-tools :deep(.el-dropdown-menu) {
  text-align: left;
}

.footer-tools :deep(.el-dropdown-item) {
  justify-content: flex-start;
  text-align: left;
}
</style>
