<script setup lang="ts">
import type { RoleRow } from '#/api/system/role/types';

import { computed, ref, watch } from 'vue';

import { ElCheckbox, ElEmpty, ElInput } from 'element-plus';

import { RoleService } from '#/api/system/role';
import { $t } from '#/locales';

const props = withDefaults(
  defineProps<{
    multiple?: boolean;
    rowKey?: string;
    value?: string[];
  }>(),
  {
    value: () => [],
    multiple: true,
    rowKey: 'id',
  },
);

const emit = defineEmits<{
  (e: 'select', selected: RoleRow[]): void;
}>();

const searchText = ref('');
const roles = ref<RoleRow[]>([]);
const selectedKeys = ref<string[]>([]);

const filteredRoles = computed(() => {
  if (!searchText.value) return roles.value;
  const keyword = searchText.value.toLowerCase();
  return roles.value.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword),
  );
});

const isSelected = (data: RoleRow): boolean => {
  return selectedKeys.value.includes(
    String(data[props.rowKey as keyof RoleRow]),
  );
};

const loadRoles = async () => {
  try {
    const response = await RoleService.list();
    roles.value = Array.isArray(response)
      ? response
      : response?.items || response?.list || [];

    if (props.value && props.value.length > 0) {
      selectedKeys.value = [...props.value];
    }
  } catch (error) {
    console.error('加载角色列表失败:', error);
    roles.value = [];
  }
};

const handleClick = (data: RoleRow) => {
  if (!props.multiple) {
    const key = String(data[props.rowKey as keyof RoleRow]);
    selectedKeys.value = [key];
    emitSelect();
  }
};

const handleCheck = (checked: boolean, data: RoleRow) => {
  const key = String(data[props.rowKey as keyof RoleRow]);
  if (checked) {
    if (!selectedKeys.value.includes(key)) {
      selectedKeys.value = [...selectedKeys.value, key];
    }
  } else {
    selectedKeys.value = selectedKeys.value.filter((k) => k !== key);
  }
  emitSelect();
};

const emitSelect = () => {
  const selected = roles.value.filter((item) =>
    selectedKeys.value.includes(String(item[props.rowKey as keyof RoleRow])),
  );
  emit('select', selected);
};

const getSelected = (): RoleRow[] => {
  return roles.value.filter((item) =>
    selectedKeys.value.includes(String(item[props.rowKey as keyof RoleRow])),
  );
};

watch(
  () => props.value,
  (newValue) => {
    if (newValue) {
      selectedKeys.value = Array.isArray(newValue)
        ? newValue.map(String)
        : [String(newValue)];
    } else {
      selectedKeys.value = [];
    }
  },
  { immediate: true },
);

defineExpose({
  getSelected,
});

loadRoles();
</script>

<template>
  <div class="role-select-dialog">
    <ElInput
      v-model="searchText"
      :placeholder="$t('components.form.select_role.search_placeholder')"
      clearable
      style="margin-bottom: 12px"
    />
    <div class="role-list">
      <div
        v-for="item in filteredRoles"
        :key="String(item[rowKey])"
        class="role-item"
        :class="{ 'is-selected': isSelected(item) }"
        @click="handleClick(item)"
      >
        <ElCheckbox
          v-if="multiple"
          :model-value="isSelected(item)"
          @update:model-value="(val) => handleCheck(Boolean(val), item)"
          @click.stop
        />
        <div class="role-info">
          <span class="role-name">{{ item.name }}</span>
          <span class="role-code">{{ item.code }}</span>
        </div>
      </div>
      <ElEmpty
        v-if="filteredRoles.length === 0"
        :description="$t('components.form.select_role.empty_description')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.role-select-dialog {
  padding: 16px;

  .role-list {
    max-height: 400px;
    overflow-y: auto;
    // border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
  }

  .role-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-lighter);
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-selected {
      background-color: var(--el-color-primary-light-9);
    }

    .role-info {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-left: 8px;

      .role-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .role-code {
        padding: 2px 6px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        background: var(--el-fill-color);
        border-radius: 4px;
      }
    }
  }
}
</style>
