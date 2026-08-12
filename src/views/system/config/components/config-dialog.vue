<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMessage,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
} from 'element-plus';

import { ConfigService } from '#/api/system/config';
import { $t } from '#/locales';

type KVRows = Array<{ key: string; type: ValueType; value: string }>;

type ValueType = 'boolean' | 'json' | 'number' | 'string';

const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const crudApiRef = ref<any>(null);
const formDataRef = ref<any>(null);

const valueTypeOptions: { label: string; value: ValueType }[] = [
  { label: $t('system.config.common.value_type.string'), value: 'string' },
  { label: $t('system.config.common.value_type.number'), value: 'number' },
  { label: $t('system.config.common.value_type.boolean'), value: 'boolean' },
  { label: $t('system.config.common.value_type.json'), value: 'json' },
];

const formData = reactive({
  code: '',
  name: '',
  content_type: 'kv' as 'kv' | 'string',
  content_kv: [] as KVRows,
  content_string: '',
  remark: '',
  enabled: 1,
  group_code: 'default',
});

const rules = {
  code: [{ required: true, message: $t('common.required'), trigger: 'blur' }],
  name: [{ required: true, message: $t('common.required'), trigger: 'blur' }],
};

const contentPlaceholder = computed(() =>
  formData.content_type === 'string'
    ? $t('system.config.common.form.placeholder.content_string')
    : '',
);

function buildJsonString() {
  if (formData.content_type !== 'kv') return;
  const obj: Record<string, any> = {};
  for (const row of formData.content_kv) {
    if (!row.key) continue;
    let val: any;
    switch (row.type) {
      case 'boolean': {
        val = row.value === 'true';
        break;
      }
      case 'json': {
        try {
          val = row.value ? JSON.parse(row.value) : null;
        } catch {
          val = row.value;
        }
        break;
      }
      case 'number': {
        val = Number(row.value || 0);
        break;
      }
      default: {
        val = row.value ?? '';
      }
    }
    obj[row.key] = val;
  }
  formData.content_string = JSON.stringify(obj, null, 2);
}

function parseJsonString() {
  if (formData.content_type !== 'kv') return;
  if (!formData.content_string) {
    formData.content_kv = [];
    return;
  }
  try {
    const obj = JSON.parse(formData.content_string);
    formData.content_kv =
      obj && typeof obj === 'object' && !Array.isArray(obj)
        ? Object.entries(obj).map(([k, v]) => {
            let type: ValueType = 'string';
            let val = String(v);
            if (typeof v === 'number') type = 'number';
            else if (typeof v === 'boolean') {
              type = 'boolean';
              val = String(v);
            } else if (v !== null && typeof v === 'object') {
              type = 'json';
              val = JSON.stringify(v);
            }
            return { key: k, value: val, type };
          })
        : [];
  } catch {
    // 非 JSON 字符串，保留原内容
  }
}

function addKVRow() {
  formData.content_kv.push({ key: '', value: '', type: 'string' });
}

function removeKVRow(index: number) {
  formData.content_kv.splice(index, 1);
}

const handleClose = () => {
  formRef.value?.resetFields();
};

const show = ({ data, isEdit: edit, getCrudApi, formData: fd }: any) => {
  isEdit.value = edit;
  crudApiRef.value = getCrudApi;
  formDataRef.value = fd;

  if (edit && data) {
    Object.assign(formData, {
      code: data.code ?? '',
      name: data.name ?? '',
      content_type: 'string',
      content_kv: [],
      content_string: data.content ?? '',
      remark: data.remark ?? '',
      enabled: data.enabled ?? 1,
      group_code: 'default',
    });
    try {
      const parsed = JSON.parse(data.content ?? '');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        formData.content_type = 'kv';
        nextTick(() => parseJsonString());
      }
    } catch {
      // 非 JSON 字符串
    }
  } else {
    Object.assign(formData, {
      code: '',
      name: '',
      content_type: 'kv',
      content_kv: [],
      content_string: '',
      remark: '',
      enabled: 1,
      group_code: 'default',
    });
    if (formData.content_kv.length === 0) {
      addKVRow();
    }
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    let content = '';
    if (formData.content_type === 'kv') {
      buildJsonString();
      content = formData.content_string;
    } else {
      content = formData.content_string;
    }
    const params = {
      code: formData.code,
      name: formData.name,
      group_code: formData.group_code,
      content,
      remark: formData.remark,
      enabled: formData.enabled,
    };
    await (isEdit.value
      ? ConfigService.update(params.code, params)
      : ConfigService.save(params));
    ElMessage.success($t('system.config.save_success'));
    dialogVisible.value = false;
    crudApiRef.value?.()?.reload?.();
  } catch {
    // validation failed
  }
};

watch(
  () => formData.content_type,
  (newType, oldType) => {
    if (newType === 'kv' && oldType === 'string') {
      parseJsonString();
      if (formData.content_kv.length === 0) {
        addKVRow();
      }
    } else if (newType === 'string' && oldType === 'kv') {
      buildJsonString();
    }
  },
);

defineExpose({ show });
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="
      isEdit
        ? $t('system.config.common.dialog.edit_title')
        : $t('system.config.common.dialog.create_title')
    "
    width="720px"
    align-center
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <ElFormItem :label="$t('system.config.common.form.name')" prop="name">
        <ElInput
          v-model="formData.name"
          :placeholder="$t('system.config.common.form.placeholder.name')"
        />
      </ElFormItem>

      <ElFormItem :label="$t('system.config.common.form.code')" prop="code">
        <ElInput
          v-model="formData.code"
          :placeholder="$t('system.config.common.form.placeholder.code_unique')"
          :disabled="isEdit"
        />
      </ElFormItem>

      <ElFormItem :label="$t('system.config.common.form.group_code')">
        <ElInput :model-value="formData.group_code" disabled />
      </ElFormItem>

      <ElFormItem :label="$t('system.config.common.form.content_type')">
        <ElRadioGroup v-model="formData.content_type">
          <ElRadio value="kv">
            {{ $t('system.config.common.form.content_type_kv') }}
          </ElRadio>
          <ElRadio value="string">
            {{ $t('system.config.common.form.content_type_string') }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem
        v-if="formData.content_type === 'kv'"
        :label="$t('system.config.common.form.kv_label')"
      >
        <div class="kv-wrapper">
          <div
            v-for="(row, idx) in formData.content_kv"
            :key="idx"
            class="kv-row"
          >
            <ElInput
              v-model="row.key"
              :placeholder="$t('system.config.common.form.placeholder.kv_key')"
              class="kv-key"
            />
            <ElInput
              v-model="row.value"
              :placeholder="
                $t('system.config.common.form.placeholder.kv_value')
              "
              class="kv-value"
            />
            <ElSelect v-model="row.type" class="kv-type">
              <ElOption
                v-for="opt in valueTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
            <ElButton
              type="danger"
              circle
              plain
              class="kv-remove"
              @click="removeKVRow(idx)"
            >
              <ElIcon>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6H5H21"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </ElIcon>
            </ElButton>
          </div>
          <ElButton type="primary" plain class="kv-add" @click="addKVRow">
            + {{ $t('system.config.common.form.add_kv') }}
          </ElButton>
        </div>
      </ElFormItem>

      <ElFormItem
        v-else
        :label="$t('system.config.common.form.content')"
        prop="content_string"
      >
        <ElInput
          v-model="formData.content_string"
          type="textarea"
          :rows="8"
          :placeholder="contentPlaceholder"
        />
      </ElFormItem>

      <ElFormItem :label="$t('system.config.common.form.remark')" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          :placeholder="$t('system.config.common.form.placeholder.remark')"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">
        {{ $t('common.operate.cancel') }}
      </ElButton>
      <ElButton type="primary" @click="handleSubmit">
        {{ $t('common.operate.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.kv-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.kv-row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.kv-key {
  flex: 1;
  min-width: 0;
}

.kv-value {
  flex: 2;
  min-width: 0;
}

.kv-type {
  flex-shrink: 0;
  width: 110px;
}

.kv-remove {
  flex-shrink: 0;
}

.kv-add {
  width: 100%;
  margin-top: 4px;
}
</style>
