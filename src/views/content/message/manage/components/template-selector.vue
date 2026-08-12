<script setup lang="ts">
import { ref, watch } from 'vue';

import {
  ElButton,
  ElCheckbox,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTag,
} from 'element-plus';

import { ManageTemplateApi } from '#/api/content/message/manage';
import { TemplateService } from '#/api/content/message/template';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

interface TemplateItem {
  id: number | string;
  title?: string;
  name?: string;
  type?: string;
}

interface SelectedItem {
  id: string;
  name: string;
}

const TEMPLATE_TYPE_OPTIONS = [
  {
    label: $t('content.message.manage.table.typeOptions.system'),
    value: 'system',
  },
  { label: $t('content.message.manage.table.typeOptions.sms'), value: 'sms' },
  {
    label: $t('content.message.manage.table.typeOptions.email'),
    value: 'email',
  },
  {
    label: $t('content.message.manage.table.typeOptions.webhook'),
    value: 'webhook',
  },
];

// ---- 内部状态 ----
const definitionId = ref<number | string>('');
const definitionName = ref('');

// ---- 搜索 & 类型 & 分页 ----
const keyword = ref('');
const templateType = ref<string | undefined>(undefined);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const items = ref<TemplateItem[]>([]);
const loading = ref(false);

// ---- 已选 & 已关联 ----
/** 已选模板列表（唯一数据源，Tags 和勾选共用） */
const selectedItems = ref<SelectedItem[]>([]);
const assignedIds = ref<Set<string>>(new Set());
/** 选中版本号，勾选变化时递增，用于强制刷新 checkbox 实例避免缓存 */
const selectedVersion = ref(0);
watch(selectedItems, () => {
  selectedVersion.value++;
});

// ---- 弹窗 ----
const [Dialog, dialogApi] = useDialog({
  dialogType: 'drawer',
  direction: 'rtl',
  width: '50%',
  title: $t('content.message.manage.template_selector.title'),
  onConfirm: handleSave,
  onCancel: () => {
    dialogApi.close();
  },
});

// 按分页搜索加载模板
async function loadTemplates() {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      page: page.value,
      limit: pageSize.value,
    };
    if (keyword.value.trim()) {
      params.LIKE_title = keyword.value.trim();
    }
    if (templateType.value) {
      params.EQ_type = templateType.value;
    }
    const res = await TemplateService.list(params);
    items.value = (res?.items ?? []) as TemplateItem[];
    total.value = res?.total ?? 0;
  } catch {
    items.value = [];
    total.value = 0;
  }
  loading.value = false;
}

// 加载已关联的模板 ID
async function loadAssignedIds() {
  try {
    const ids = await ManageTemplateApi.getAssignedIds(definitionId.value);
    const arr = Array.isArray(ids) ? ids.map(String) : [];
    assignedIds.value = new Set(arr);

    // 默认把已关联的也勾上，获取名称用于 Tags 展示
    if (arr.length > 0) {
      const results = await Promise.allSettled(
        arr.map((id) => TemplateService.get(id)),
      );
      selectedItems.value = results
        .map((result, i) => {
          if (result.status === 'fulfilled') {
            const data = result.value;
            return { id: arr[i], name: data?.title || data?.name || arr[i] };
          }
          return { id: arr[i], name: arr[i] };
        })
        .filter(Boolean) as SelectedItem[];
    } else {
      selectedItems.value = [];
    }
  } catch {
    assignedIds.value = new Set();
    selectedItems.value = [];
  }
}

function handleSearch() {
  page.value = 1;
  loadTemplates();
}

function handleTypeChange() {
  page.value = 1;
  loadTemplates();
}

function handlePageChange(newPage: number) {
  page.value = newPage;
  loadTemplates();
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize;
  page.value = 1;
  loadTemplates();
}

// ---- 勾选逻辑 ----
function toggleItem(id: number | string) {
  const key = String(id);
  const idx = selectedItems.value.findIndex((item) => item.id === key);
  if (idx === -1) {
    const found = items.value.find((i) => String(i.id) === key);
    const name = found?.title || found?.name || key;
    selectedItems.value = [...selectedItems.value, { id: key, name }];
  } else {
    selectedItems.value = [
      ...selectedItems.value.slice(0, idx),
      ...selectedItems.value.slice(idx + 1),
    ];
  }
}

/** 点击 Tag × 移除 */
function removeSelected(id: string) {
  selectedItems.value = selectedItems.value.filter((item) => item.id !== id);
}

function isSelected(id: number | string): boolean {
  return selectedItems.value.some((item) => item.id === String(id));
}

function isAssigned(id: number | string): boolean {
  return assignedIds.value.has(String(id));
}

// ---- 保存 ----
async function handleSave() {
  if (!definitionId.value) return;
  dialogApi.setState({ confirmLoading: true });
  try {
    await ManageTemplateApi.syncTemplates(
      definitionId.value,
      selectedItems.value.map((item) => item.id),
    );
    ElMessage.success(
      $t('content.message.manage.template_selector.save_success'),
    );
    dialogApi.close();
  } catch (error: any) {
    ElMessage.error(
      error?.message ||
        $t('content.message.manage.template_selector.save_failed'),
    );
  }
  dialogApi.setState({ confirmLoading: false });
}

function typeLabel(t?: string): string {
  const opt = TEMPLATE_TYPE_OPTIONS.find((o) => o.value === t);
  return opt?.label ?? t ?? '-';
}

/** 外部调用打开弹窗 */
function open(defId: number | string, defName: string) {
  definitionId.value = defId;
  definitionName.value = defName;
  keyword.value = '';
  templateType.value = undefined;
  page.value = 1;
  loadAssignedIds().then(() => {
    loadTemplates().then(() => {
      dialogApi.open();
    });
  });
}

defineExpose({ open });
</script>

<template>
  <Dialog>
    <div style="padding: 16px 20px">
      <p style="margin-bottom: 12px; color: var(--el-text-color-regular)">
        <template v-if="definitionName">
          {{
            $t('content.message.manage.template_selector.title_desc', {
              name: definitionName,
            })
          }}
        </template>
      </p>

      <!-- 已选模板 Tags 展示（跨分页可见） -->
      <div v-if="selectedItems.length > 0" class="selected-tags">
        <span class="selected-tags-label">
          {{
            $t('content.message.manage.template_selector.selected_tags_label')
          }}：
        </span>
        <ElTag
          v-for="item in selectedItems"
          :key="item.id"
          closable
          size="small"
          type="info"
          :disable-transitions="true"
          @close="removeSelected(item.id)"
        >
          {{ item.name }}
        </ElTag>
      </div>

      <!-- 搜索 + 类型 -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px">
        <ElSelect
          v-model="templateType"
          :placeholder="
            $t('content.message.manage.template_selector.all_types')
          "
          clearable
          style="width: 130px"
          @change="handleTypeChange"
        >
          <ElOption
            v-for="opt in TEMPLATE_TYPE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElInput
          v-model="keyword"
          :placeholder="
            $t('content.message.manage.template_selector.search_placeholder')
          "
          clearable
          style="flex: 1"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <ElButton type="primary" @click="handleSearch">
          {{ $t('content.message.manage.template_selector.search_btn') }}
        </ElButton>
      </div>

      <!-- 列表 -->
      <div v-if="loading" class="empty-state">
        {{ $t('content.message.manage.template_selector.loading') }}
      </div>

      <div v-else-if="items.length === 0" class="empty-state">
        {{
          keyword || templateType
            ? $t('content.message.manage.template_selector.no_results')
            : $t('content.message.manage.template_selector.no_templates')
        }}
      </div>

      <div v-else class="template-list">
        <div
          v-for="item in items"
          :key="`${item.id}-${selectedVersion}`"
          class="template-item"
          :class="[{ 'is-assigned': isAssigned(item.id) }]"
        >
          <ElCheckbox
            :model-value="isSelected(item.id)"
            @change="() => toggleItem(item.id)"
          >
            <span>{{ item.title || item.name || '-' }}</span>
            <span class="template-type">({{ typeLabel(item.type) }})</span>
          </ElCheckbox>
          <span v-if="isAssigned(item.id)" class="assigned-badge">
            {{ $t('content.message.manage.template_selector.assigned_badge') }}
          </span>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-bar">
        <ElPagination
          small
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>

      <div class="selected-count">
        {{
          $t('content.message.manage.template_selector.selected_count', {
            count: selectedItems.length,
          })
        }}
      </div>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.empty-state {
  padding: 60px 0;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.selected-tags-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.template-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:last-child {
    border-bottom: none;
  }

  &.is-assigned {
    // 已关联样式
  }
}

.template-type {
  margin-left: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.assigned-badge {
  flex-shrink: 0;
  padding: 1px 6px;
  font-size: 11px;
  color: #fff;
  background: #409eff;
  border-radius: 3px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.selected-count {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
