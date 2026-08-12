<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElSelectV2,
} from 'element-plus';

import { DeptService } from '#/api/system/dept';
import { Dialog } from '#/components/dialog';
import { Icon } from '#/components/icon';
import { $t } from '#/locales';

import DeptSelectModal from './dept-select-dialog.vue';

interface Option {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    buttonText?: string;
    clearable?: boolean;
    dialogWidth?: string;
    disabled?: boolean;
    filterIds?: string[];
    modalTitle?: string;
    modelValue?: null | string | string[];
    multiple?: boolean;
    mustInFilterIds?: boolean;
    placeholder?: string;
    rowKey?: string;
    showButton?: boolean;
  }>(),
  {
    modelValue: null,
    multiple: true,
    clearable: true,
    disabled: false,
    showButton: true,
    dialogWidth: '600px',
    rowKey: 'id',
    filterIds: () => [],
    mustInFilterIds: false,
    buttonText: '',
    modalTitle: '',
    placeholder: '',
  },
);

const emit = defineEmits<{
  change: [value: null | string | string[]];
  'update:modelValue': [value: null | string | string[]];
}>();

const slots = useSlots();
const dialogRef = ref();
const modalRef = ref();
const options = ref<Option[]>([]);
const tempValue = ref<string[]>([]);

const effectivePlaceholder = computed(
  () => props.placeholder || $t('components.form.select_dept.placeholder'),
);
const effectiveButtonText = computed(
  () => props.buttonText || $t('components.form.select_dept.modal_button'),
);
const effectiveModalTitle = computed(
  () => props.modalTitle || $t('components.form.select_dept.modal_title'),
);

const selectValue = computed({
  get() {
    const v = props.modelValue;
    if (props.multiple)
      return Array.isArray(v) ? v : v ? String(v).split(',') : [];
    return v;
  },
  set(val: any) {
    const result = props.multiple ? (Array.isArray(val) ? val : []) : val;
    emit('update:modelValue', result);
    emit('change', result);
  },
});

function initValue() {
  const v = props.modelValue;
  if (v) {
    const values = Array.isArray(v) ? v : String(v).split(',');
    tempValue.value = values;
    loadDeptNames(values);
  } else {
    tempValue.value = [];
    options.value = [];
  }
}

async function loadDeptNames(values: string[]) {
  if (!values?.length) {
    options.value = [];
    return;
  }
  try {
    const tree = await DeptService.getTree();
    const deptMap = new Map<string, string>();
    const traverse = (nodes: any[]) => {
      for (const n of nodes) {
        deptMap.set(String(n[props.rowKey]), n.name);
        if (n.children?.length) traverse(n.children);
      }
    };
    traverse(tree as any[]);
    options.value = values
      .filter((v) => deptMap.has(v))
      .map((v) => ({ label: deptMap.get(v) || v, value: v }));
  } catch {
    options.value = values.map((v) => ({ label: v, value: v }));
  }
}

function handleConfirm() {
  const selected = modalRef.value?.getSelected() || [];
  const values = selected.map((item: any) => String(item[props.rowKey]));
  const opts = selected.map((item: any) => ({
    label: item.name,
    value: String(item[props.rowKey]),
  }));
  options.value = opts;
  const result = props.multiple ? values : values[0] || null;
  emit('update:modelValue', result);
  emit('change', result);
  dialogRef.value?.close();
}

function handleTreeCommand(command: string) {
  switch (command) {
    case 'collapse': {
      modalRef.value?.handleCollapseAll();
      break;
    }
    case 'expand': {
      modalRef.value?.handleExpandAll();
      break;
    }
    case 'selectAll': {
      modalRef.value?.handleSelectAll();
      break;
    }
  }
}

function handleSelect(selected: any[]) {
  tempValue.value = selected.map((item: any) => String(item[props.rowKey]));
}

function handleChange(value: any) {
  emit('update:modelValue', value);
  emit('change', value);
}

watch(() => props.modelValue, initValue, { immediate: true });

watch(
  () => props.filterIds,
  (newFilterIds) => {
    if (!props.mustInFilterIds) return;
    const filterSet = new Set((newFilterIds || []).map(String));
    if (filterSet.size === 0) {
      emit('update:modelValue', props.multiple ? [] : null);
      emit('change', props.multiple ? [] : null);
      return;
    }
    if (props.modelValue) {
      const currentValues = Array.isArray(props.modelValue)
        ? props.modelValue
        : [props.modelValue];
      const invalidValues = currentValues.filter(
        (v) => !filterSet.has(String(v)),
      );
      if (invalidValues.length > 0) {
        if (props.multiple) {
          const validValues = currentValues.filter((v) =>
            filterSet.has(String(v)),
          );
          emit('update:modelValue', validValues.length > 0 ? validValues : []);
          emit('change', validValues.length > 0 ? validValues : []);
        } else if (!filterSet.has(String(props.modelValue))) {
          emit('update:modelValue', null);
          emit('change', null);
        }
      }
    }
  },
  { immediate: true, deep: true },
);

defineExpose({ getValue: () => selectValue.value });
</script>

<template>
  <div class="select-dept">
    <ElSelectV2
      v-model="selectValue"
      :options="options"
      :placeholder="effectivePlaceholder"
      :multiple="multiple"
      :clearable="clearable"
      :disabled="disabled"
      @change="handleChange"
      style="width: 100%"
    >
      <template v-for="(_, slotName) in slots" #[slotName]>
        <slot :name="slotName"></slot>
      </template>
    </ElSelectV2>
    <ElButton
      v-if="showButton"
      type="primary"
      :disabled="disabled"
      @click="dialogRef?.open()"
      style="margin-left: 8px"
    >
      {{ effectiveButtonText }}
    </ElButton>
    <Dialog
      ref="dialogRef"
      :title="effectiveModalTitle"
      :width="dialogWidth"
      custom-class="m-dialog-footer-between"
      @confirm="handleConfirm"
    >
      <DeptSelectModal
        ref="modalRef"
        :multiple="multiple"
        :value="tempValue"
        :filter-ids="filterIds"
        @select="handleSelect"
      />
      <template #prepend-footer>
        <ElDropdown @command="handleTreeCommand">
          <ElButton size="default">
            {{ $t('components.form.select_dept.tree_operation') }}
            <ElIcon class="el-icon--right">
              <Icon icon="ri:arrow-down-s-line" />
            </ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="expand">
                {{ $t('components.form.select_dept.expand_all') }}
              </ElDropdownItem>
              <ElDropdownItem command="collapse">
                {{ $t('components.form.select_dept.collapse_all') }}
              </ElDropdownItem>
              <ElDropdownItem
                v-if="multiple"
                command="selectAll"
                :divided="true"
              >
                {{
                  modalRef?.allSelected
                    ? $t('components.form.select_dept.cancel_select_all')
                    : $t('components.form.select_dept.select_all')
                }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.select-dept {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
