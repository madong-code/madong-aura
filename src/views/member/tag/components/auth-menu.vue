<script setup lang="ts">
import type { ElTree as ElTreeType } from 'element-plus';

import type { CrudApiInstance } from '#/adapter/crud';

import { nextTick, ref } from 'vue';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElTree,
} from 'element-plus';

import { MemberAuthService } from '#/api/member/auth';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

interface TreeNode {
  id: number | string;
  title: string;
  name: string;
  category: 1 | 2; // 1=导航菜单, 2=会员菜单
  code?: string;
  children?: TreeNode[];
}

const categoryLabels: Record<number, string> = {
  1: $t('member.tag.auth.tag.nav_menu'),
  2: $t('member.tag.auth.tag.member_menu'),
};
const categoryColors: Record<number, string> = {
  1: '#409EFF',
  2: '#67C23A',
};

let menuTreeData: TreeNode[] = [];

const treeRef = ref<InstanceType<typeof ElTreeType>>();
const treeData = ref<TreeNode[]>([]);
const currentRow = ref<any>(null);
const crudApi = ref<CrudApiInstance>();
const treeLoaded = ref(false);

const buildTreeData = (nodes: TreeNode[]): TreeNode[] => {
  return nodes.map((node) => {
    const converted: TreeNode = { ...node };
    if (node.children) {
      converted.children = buildTreeData(node.children);
    }
    return converted;
  });
};

const initPermissionTree = async () => {
  if (treeLoaded.value) return;
  treeLoaded.value = true;
  try {
    const res = await MemberAuthService.getMemberAllPermission();
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

const getCheckedKeysWithParents = (): (number | string)[] => {
  const tree = treeRef.value;
  if (!tree) return [];
  const checked = tree.getCheckedKeys() as (number | string)[];
  const halfChecked = tree.getHalfCheckedKeys() as (number | string)[];
  return [...new Set([...checked, ...halfChecked])];
};

const loadData = async (tagId: number | string) => {
  try {
    const ids = await MemberAuthService.tagMenuIds({ tag_id: tagId });
    setCheckedKeys(ids || []);
  } catch {
    setCheckedKeys([]);
  }
};

// ===== Dialog =====
const [Dialog, dialogApi] = useDialog({
  title: $t('member.tag.auth.title'),
  width: '50%',
  dialogType: 'drawer',
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  async onConfirm() {
    const keys = getCheckedKeysWithParents();
    dialogApi.setState({ confirmLoading: true, loading: true });
    try {
      await MemberAuthService.saveTagMenu({
        tag_id: currentRow.value.id,
        menu_id: keys,
      });
      ElMessage.success($t('member.tag.auth.message.auth_success'));
      crudApi.value?.refreshCreate();
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
      title: $t('member.tag.auth.auth_manage', { name: data.name }),
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

// ===== 展开 / 折叠 =====
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
              :style="{ backgroundColor: categoryColors[data.category] }"
            >
              {{ categoryLabels[data.category] }}
            </span>
            <span class="gt-name">{{ data.title || data.name }}</span>
            <span v-if="data.code" class="gt-badge gt-badge-auth">
              {{ $t('member.tag.auth.tag.auth') }}
            </span>
            <span v-else class="gt-badge gt-badge-public">
              {{ $t('member.tag.auth.tag.public') }}
            </span>
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

.gt-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 400;
  color: #fff;
  border-radius: 2px;
}

.gt-badge-auth {
  background-color: #f56c6c;
}

.gt-badge-public {
  background-color: #909399;
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
