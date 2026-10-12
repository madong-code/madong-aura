<script setup lang="ts">
/**
 * 部门用户选择器（公共表单组件）
 *
 * 展示参考 paged-select：点击触发区（已选 tag / 占位符）打开弹窗，无额外按钮。
 * 弹窗：左侧部门树 + 右侧用户列表（支持搜索），多选/单选（默认单选）。
 *
 * 默认数据源为主框架接口（可配置覆盖）：
 * - deptApi: GET /system/dept/tree （部门树 [{ id, pid, name, children }]）
 * - userApi: GET /system/admin/options （支持 dept_id/keywords/ids/page/limit，返回 { items, total }）
 *
 * 用法（VbenForm schema）：
 * ```ts
 * {
 *   fieldName: 'surrogate',
 *   component: 'DeptUserPicker',
 *   componentProps: { multiple: false },
 * }
 * ```
 */
import { computed, ref, watch } from 'vue';

import { ElEmpty, ElIcon, ElInput, ElTree } from 'element-plus';
import { OfficeBuilding, Search, Select, User } from '@element-plus/icons-vue';

import { requestClient } from '#/api/request';
import { useDialog } from '#/components/dialog';

interface SelectedItem {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[] | null;
    /** 多选还是单选，默认单选 */
    multiple?: boolean;
    placeholder?: string;
    disabled?: boolean;
    /** 部门树接口（GET，返回树形数组：[{ id, name, children }]） */
    deptApi?: string;
    /** 用户接口（GET，支持 dept_id / keywords / ids / page / limit，返回数组或 { items, total }） */
    userApi?: string;
    /** 值字段名，默认 id */
    valueField?: string;
    /** 显示字段名，默认 label（缺失时回退 real_name/user_name） */
    labelField?: string;
    dialogWidth?: string;
  }>(),
  {
    modelValue: null,
    multiple: false,
    placeholder: '请选择用户',
    disabled: false,
    deptApi: '/system/dept/tree',
    userApi: '/system/admin/options',
    valueField: 'id',
    labelField: 'label',
    dialogWidth: '720px',
  },
);

const emit = defineEmits<{
  change: [value: string | string[] | null];
  'update:modelValue': [value: string | string[] | null];
}>();

// ========== 已选展示（回显） ==========
const selectedItems = ref<SelectedItem[]>([]);

/** 从响应中提取用户数组，兼容数组 / { items } / { rows } 等结构 */
function extractList(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  const candidates = [
    res.items,
    res.rows,
    res.records,
    res.list,
    res.data?.items,
    res.data?.rows,
    res.data?.list,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function userLabel(user: any): string {
  return (
    user?.[props.labelField] ||
    user?.real_name ||
    user?.user_name ||
    String(user?.[props.valueField] ?? '')
  );
}

function normalizeIds(val: any): string[] {
  if (val === undefined || val === null || val === '') return [];
  if (Array.isArray(val)) return val.map(String);
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 按 ids 回显已选 */
async function loadByIds(ids: string[]) {
  if (!props.userApi || ids.length === 0) return [];
  try {
    const res = await requestClient.get(props.userApi, {
      params: { ids: ids.join(','), page: 1, limit: 100 },
    });
    return extractList(res);
  } catch {
    return [];
  }
}

function syncSelected(ids: string[]) {
  loadByIds(ids).then((list) => {
    const map = new Map(list.map((u) => [String(u[props.valueField]), u]));
    selectedItems.value = ids.map((id) => {
      const found = map.get(id);
      return found
        ? { value: id, label: userLabel(found) }
        : { value: id, label: id };
    });
  });
}

watch(
  () => props.modelValue,
  (val) => syncSelected(normalizeIds(val)),
  { immediate: true, deep: true },
);

function emitValue() {
  const result = props.multiple
    ? pendingIds.value
    : pendingIds.value[0] || null;
  emit('update:modelValue', result);
  emit('change', result);
}

/** 移除已选（触发区 tag 的 ×） */
function removeTag(id: string) {
  const ids = normalizeIds(props.modelValue).filter((v) => v !== id);
  const result = props.multiple ? ids : ids[0] || null;
  emit('update:modelValue', result);
  emit('change', result);
  syncSelected(ids);
}

// ========== 弹窗状态 ==========
const deptTree = ref<any[]>([]);
const userList = ref<any[]>([]);
const selectedDeptId = ref<string | null>(null);
const searchKeyword = ref('');
const loadingUsers = ref(false);
const loadingDepts = ref(false);
const isSearching = ref(false);
/** 弹窗内暂存选中（确定才写回） */
const pendingIds = ref<string[]>([]);
/** 弹窗内暂存 label 映射（用于已选汇总条） */
const pendingLabelMap = ref<Record<string, string>>({});
const treeRef = ref<InstanceType<typeof ElTree>>();

const pendingItems = computed(() =>
  pendingIds.value.map((id) => ({
    value: id,
    label: pendingLabelMap.value[id] ?? id,
  })),
);

async function loadDepts() {
  if (!props.deptApi) return;
  loadingDepts.value = true;
  try {
    const res = await requestClient.get(props.deptApi);
    deptTree.value = Array.isArray(res) ? res : (res?.data ?? []);
  } catch {
    deptTree.value = [];
  } finally {
    loadingDepts.value = false;
  }
}

/** 按部门加载用户（含子部门） */
async function loadUsersByDept(deptId: string, keyword = '') {
  if (!props.userApi) return;
  loadingUsers.value = true;
  isSearching.value = false;
  try {
    const res = await requestClient.get(props.userApi, {
      params: { dept_id: deptId, keywords: keyword, page: 1, limit: 100 },
    });
    userList.value = extractList(res);
  } catch {
    userList.value = [];
  } finally {
    loadingUsers.value = false;
  }
}

/** 跨部门搜索用户 */
async function searchUsers(keyword: string) {
  if (!props.userApi) return;
  loadingUsers.value = true;
  isSearching.value = true;
  try {
    const res = await requestClient.get(props.userApi, {
      params: { keywords: keyword, page: 1, limit: 100 },
    });
    userList.value = extractList(res);
  } catch {
    userList.value = [];
  } finally {
    loadingUsers.value = false;
  }
}

function handleNodeClick(data: any) {
  selectedDeptId.value = String(data.id);
  pendingIds.value = [];
  if (searchKeyword.value.trim()) {
    searchUsers(searchKeyword.value.trim());
  } else {
    loadUsersByDept(String(data.id));
  }
}

function handleSearch() {
  const kw = searchKeyword.value.trim();
  if (!kw) {
    if (selectedDeptId.value) {
      loadUsersByDept(selectedDeptId.value);
    } else {
      userList.value = [];
    }
  } else {
    searchUsers(kw);
  }
}

function isPending(id: string) {
  return pendingIds.value.includes(String(id));
}

function handleRowClick(user: any) {
  const id = String(user[props.valueField]);
  const label = userLabel(user);
  if (props.multiple) {
    pendingIds.value = isPending(id)
      ? pendingIds.value.filter((v) => v !== id)
      : [...pendingIds.value, id];
  } else {
    pendingIds.value = [id];
  }
  pendingLabelMap.value = { ...pendingLabelMap.value, [id]: label };
}

function removePendingTag(id: string) {
  pendingIds.value = pendingIds.value.filter((v) => v !== id);
}

const [Dialog, dialogApi] = useDialog({
  dialogType: 'dialog',
  title: '选择用户',
  width: props.dialogWidth,
  onConfirm: async () => {
    if (pendingIds.value.length === 0) {
      return;
    }
    emitValue();
    // 同步已选标签回显
    syncSelected(pendingIds.value);
    dialogApi.close();
  },
});

function openDialog() {
  if (props.disabled) return;
  pendingIds.value = normalizeIds(props.modelValue);
  pendingLabelMap.value = {};
  selectedItems.value.forEach((it) => {
    pendingLabelMap.value[it.value] = it.label;
  });
  selectedDeptId.value = null;
  searchKeyword.value = '';
  userList.value = [];
  loadDepts();
  dialogApi.open();
}
</script>

<template>
  <div class="dept-user-picker">
    <!-- 触发区：显示已选 tag（多选）或单个值（单选），点击打开弹窗 -->
    <div
      class="dpu-trigger"
      :class="{ 'is-empty': selectedItems.length === 0 }"
      @click="openDialog"
    >
      <template v-if="multiple">
        <div
          v-for="item in selectedItems"
          :key="item.value"
          class="dpu-tag"
          @click.stop
        >
          <span class="dpu-tag-label">{{ item.label }}</span>
          <span class="dpu-tag-close" @click="removeTag(item.value)">×</span>
        </div>
        <span v-if="selectedItems.length === 0" class="dpu-placeholder">{{
          placeholder
        }}</span>
      </template>
      <template v-else>
        <div v-if="selectedItems[0]" class="dpu-tag" @click.stop>
          <span class="dpu-tag-label">{{ selectedItems[0].label }}</span>
          <span class="dpu-tag-close" @click="removeTag(selectedItems[0].value)"
            >×</span
          >
        </div>
        <span v-else class="dpu-placeholder">{{ placeholder }}</span>
      </template>
    </div>

    <Dialog>
      <div class="dpu-dialog">
        <!-- 已选汇总条 -->
        <div v-if="pendingItems.length" class="dpu-selected-bar">
          <span class="dpu-selected-label"
            >已选 ({{ pendingItems.length }})：</span
          >
          <div class="dpu-selected-tags">
            <div
              v-for="item in pendingItems"
              :key="item.value"
              class="dpu-tag dpu-tag-sm"
            >
              <span class="dpu-tag-label">{{ item.label }}</span>
              <span class="dpu-tag-close" @click="removePendingTag(item.value)"
                >×</span
              >
            </div>
          </div>
        </div>

        <div class="dpu-body">
          <!-- 左侧部门树 -->
          <div class="dpu-dept-panel">
            <div class="dpu-panel-title">
              <el-icon class="dpu-panel-icon"><OfficeBuilding /></el-icon>
              <span>组织结构</span>
            </div>
            <div v-loading="loadingDepts" class="dpu-tree-wrap">
              <ElTree
                ref="treeRef"
                :data="deptTree"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleNodeClick"
              >
                <template #default="{ data }">
                  <span class="dpu-tree-node">
                    <el-icon class="dpu-tree-icon"><OfficeBuilding /></el-icon>
                    <span class="dpu-tree-label">{{ data.name }}</span>
                  </span>
                </template>
              </ElTree>
              <ElEmpty
                v-if="!loadingDepts && deptTree.length === 0"
                description="暂无部门"
              />
            </div>
          </div>

          <!-- 右侧用户列表 -->
          <div class="dpu-user-panel">
            <div class="dpu-user-search">
              <ElInput
                v-model="searchKeyword"
                size="small"
                clearable
                placeholder="搜索人员"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              >
                <template #suffix>
                  <el-icon><Search /></el-icon>
                </template>
              </ElInput>
            </div>
            <div v-loading="loadingUsers" class="dpu-user-list">
              <div
                v-for="user in userList"
                :key="user[valueField]"
                class="dpu-user-item"
                :class="{ active: isPending(String(user[valueField])) }"
                @click="handleRowClick(user)"
              >
                <el-icon class="dpu-user-icon"><User /></el-icon>
                <span class="dpu-user-name">{{ userLabel(user) }}</span>
                <span v-if="user.dept_name" class="dpu-user-dept">{{
                  user.dept_name
                }}</span>
                <el-icon
                  v-if="isPending(String(user[valueField]))"
                  class="dpu-check-icon"
                  ><Select
                /></el-icon>
              </div>
              <ElEmpty
                v-if="!loadingUsers && userList.length === 0"
                :description="isSearching ? '未找到匹配人员' : '请选择左侧部门'"
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.dept-user-picker {
  width: 100%;
}

/* ========== 触发区（paged-select 风格） ========== */
.dpu-trigger {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 32px;
  padding: 2px 8px;
  cursor: pointer;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  transition: border-color 0.2s;
}

.dpu-trigger:hover {
  border-color: var(--el-color-primary);
}

.dpu-trigger.is-empty {
  color: var(--el-text-color-placeholder);
}

.dpu-placeholder {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.dpu-tag {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 22px;
  padding: 0 6px;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 4px;
}

.dpu-tag-sm {
  height: 20px;
}

.dpu-tag-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  line-height: 1;
  color: var(--el-color-primary);
  cursor: pointer;
  border-radius: 50%;
}

.dpu-tag-close:hover {
  color: #fff;
  background: var(--el-color-primary-light-5);
}

/* ========== 弹窗 ========== */
.dpu-dialog {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 4px;
}

.dpu-selected-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.dpu-selected-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.dpu-selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dpu-body {
  display: flex;
  gap: 16px;
  height: 400px;
}

.dpu-dept-panel {
  display: flex;
  flex-direction: column;
  width: 42%;
  min-width: 0;
  padding-right: 12px;
  border-right: 1px solid var(--el-border-color-lighter);
}

.dpu-panel-title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.dpu-panel-icon {
  flex-shrink: 0;
  color: var(--el-color-primary);
}

.dpu-tree-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.dpu-tree-node {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dpu-tree-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

.dpu-tree-label {
  font-size: 13px;
}

.dpu-user-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.dpu-user-search {
  margin-bottom: 12px;
}

.dpu-user-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.dpu-user-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background 0.2s;
}

.dpu-user-item:last-child {
  border-bottom: none;
}

.dpu-user-item:hover,
.dpu-user-item.active {
  background: var(--el-fill-color-light);
}

.dpu-user-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.dpu-user-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.dpu-user-dept {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dpu-check-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--el-color-primary);
}
</style>
