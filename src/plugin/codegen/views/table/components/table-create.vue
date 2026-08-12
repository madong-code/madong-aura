<script setup lang="ts">
import { reactive, ref } from 'vue';

import {
  ElButton,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { GeneratorTableService } from '#/api/app/plugin/codegen/table';
import { $t } from '#/locales';

interface ColumnField {
  name: string;
  type: string;
  length: null | number;
  nullable: boolean;
  primary: boolean;
  auto_increment: boolean;
  comment: string;
}

const emit = defineEmits<{ success: [] }>();

const visible = ref(false);
const saving = ref(false);
const formRef = ref();
const form = reactive({
  name: '',
  comment: '',
});

const rules = {
  name: [
    {
      required: true,
      message: () => $t('codegen.table.table.create.name_required'),
      trigger: 'blur',
    },
  ],
};

const typeOptions = [
  { value: 'varchar', label: 'varchar' },
  { value: 'int', label: 'int' },
  { value: 'bigint', label: 'bigint' },
  { value: 'tinyint', label: 'tinyint' },
  { value: 'decimal', label: 'decimal' },
  { value: 'text', label: 'text' },
  { value: 'longtext', label: 'longtext' },
  { value: 'datetime', label: 'datetime' },
  { value: 'timestamp', label: 'timestamp' },
  { value: 'json', label: 'json' },
];

const fields = ref<ColumnField[]>([
  {
    name: 'id',
    type: 'bigint',
    length: null,
    nullable: false,
    primary: true,
    auto_increment: true,
    comment: '主键',
  },
  {
    name: 'created_at',
    type: 'datetime',
    length: null,
    nullable: false,
    primary: false,
    auto_increment: false,
    comment: '创建时间',
  },
  {
    name: 'updated_at',
    type: 'datetime',
    length: null,
    nullable: false,
    primary: false,
    auto_increment: false,
    comment: '更新时间',
  },
]);

function addField() {
  fields.value.push({
    name: '',
    type: 'varchar',
    length: 255,
    nullable: true,
    primary: false,
    auto_increment: false,
    comment: '',
  });
}

function removeField(idx: number) {
  fields.value.splice(idx, 1);
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  if (fields.value.length === 0) {
    ElMessage.warning($t('codegen.table.table.create.add_field'));
    return;
  }
  saving.value = true;
  try {
    await GeneratorTableService.createTable({
      name: form.name,
      comment: form.comment,
      columns: fields.value,
    });
    ElMessage.success($t('common.success'));
    visible.value = false;
    emit('success');
  } catch (error: any) {
    ElMessage.error(error?.message || $t('common.error'));
  } finally {
    saving.value = false;
  }
}

function show() {
  form.name = '';
  form.comment = '';
  fields.value = [
    {
      name: 'id',
      type: 'bigint',
      length: null,
      nullable: false,
      primary: true,
      auto_increment: true,
      comment: '主键',
    },
    {
      name: 'created_at',
      type: 'datetime',
      length: null,
      nullable: false,
      primary: false,
      auto_increment: false,
      comment: '创建时间',
    },
    {
      name: 'updated_at',
      type: 'datetime',
      length: null,
      nullable: false,
      primary: false,
      auto_increment: false,
      comment: '更新时间',
    },
  ];
  visible.value = true;
}

defineExpose({ show });
</script>

<template>
  <ElDrawer
    v-model="visible"
    :title="$t('codegen.table.table.create.title')"
    size="72%"
    direction="rtl"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="m-drawer-body">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
        <ElFormItem :label="$t('codegen.table.table.create.name')" prop="name">
          <ElInput v-model="form.name" placeholder="例如 sa_demo" />
        </ElFormItem>
        <ElFormItem :label="$t('codegen.table.table.create.comment')">
          <ElInput v-model="form.comment" placeholder="表注释" />
        </ElFormItem>
        <ElFormItem :label="$t('codegen.table.table.create.fields')">
          <div class="w-full">
            <ElButton type="primary" plain @click="addField">
              + {{ $t('codegen.table.table.create.add_field') }}
            </ElButton>
            <ElTable :data="fields" border class="mt-2">
              <ElTableColumn type="index" width="50" />
              <ElTableColumn
                :label="$t('codegen.table.table.create.field_name')"
              >
                <template #default="{ row }">
                  <ElInput v-model="row.name" size="small" />
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.field_type')"
                width="120"
              >
                <template #default="{ row }">
                  <ElSelect v-model="row.type" size="small">
                    <ElOption
                      v-for="t in typeOptions"
                      :key="t.value"
                      :label="t.label"
                      :value="t.value"
                    />
                  </ElSelect>
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.field_length')"
                width="100"
              >
                <template #default="{ row }">
                  <ElInputNumber
                    v-model="row.length"
                    :min="0"
                    size="small"
                    controls-position="right"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.nullable')"
                width="80"
                align="center"
              >
                <template #default="{ row }">
                  <ElSwitch v-model="row.nullable" />
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.primary')"
                width="80"
                align="center"
              >
                <template #default="{ row }">
                  <ElSwitch v-model="row.primary" />
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.auto_increment')"
                width="80"
                align="center"
              >
                <template #default="{ row }">
                  <ElSwitch v-model="row.auto_increment" />
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.field_comment')"
              >
                <template #default="{ row }">
                  <ElInput v-model="row.comment" size="small" />
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('codegen.table.table.create.operation')"
                width="80"
                align="center"
              >
                <template #default="{ $index }">
                  <ElButton type="danger" link @click="removeField($index)">
                    {{ $t('common.delete') }}
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <span class="flex justify-end gap-2">
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </span>
    </template>
  </ElDrawer>
</template>

<style scoped>
.m-drawer-body {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}
</style>
