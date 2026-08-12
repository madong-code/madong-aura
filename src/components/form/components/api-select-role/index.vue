<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue';

import { ElButton, ElSelectV2 } from 'element-plus';

import { Dialog } from '#/components/dialog';
import { $t } from '#/locales';

import RoleSelectModal from './role-select-dialog.vue';

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
    modalTitle?: string;
    modelValue?: null | string | string[];
    multiple?: boolean;
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
    dialogWidth: '500px',
    rowKey: 'id',
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
  () => props.placeholder || $t('components.form.select_role.placeholder'),
);
const effectiveButtonText = computed(
  () => props.buttonText || $t('components.form.select_role.modal_button'),
);
const effectiveModalTitle = computed(
  () => props.modalTitle || $t('components.form.select_role.modal_title'),
);

const selectValue = computed({
  get() {
    const v = props.modelValue;
    if (props.multiple)
      return Array.isArray(v) ? v : v ? String(v).split(',') : [];
    return v || '';
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
    const values = Array.isArray(v) ? v.map(String) : String(v).split(',');
    tempValue.value = values;
    loadRoleNames(values);
  } else {
    tempValue.value = [];
    options.value = [];
  }
}

async function loadRoleNames(values: string[]) {
  if (!values?.length) {
    options.value = [];
    return;
  }
  try {
    const { RoleService } = await import('#/api/system/role');
    const response: any = await RoleService.list();
    const roles = Array.isArray(response)
      ? response
      : response?.items || response?.list || [];
    const roleMap = new Map<string, string>();
    roles.forEach((r: any) => roleMap.set(String(r[props.rowKey]), r.name));
    options.value = values
      .filter((v) => roleMap.has(v))
      .map((v) => ({ label: roleMap.get(v) || v, value: v }));
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

function handleChange(value: any) {
  emit('update:modelValue', value);
  emit('change', value);
}

watch(() => props.modelValue, initValue, { immediate: true });
defineExpose({ getValue: () => selectValue.value });
</script>

<template>
  <div class="select-role">
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
      @confirm="handleConfirm"
    >
      <RoleSelectModal ref="modalRef" :multiple="multiple" :value="tempValue" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.select-role {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
