<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { $t } from '#/locales';

interface RelationData {
  type: string;
  name: string;
  addon: string;
  model: string;
  local_key: string;
  foreign_key: string;
}

const props = defineProps<{ modelValue: RelationData[] }>();
const emit = defineEmits<{ 'update:modelValue': [value: RelationData[]] }>();

const localData = ref<RelationData[]>([]);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) localData.value = [...newValue];
  },
  { immediate: true, deep: true },
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentIndex = ref(-1);
const relationFormRef = ref();
const relationForm = ref<RelationData>({
  type: '',
  name: '',
  addon: '',
  model: '',
  local_key: '',
  foreign_key: '',
});

const relationRules = {
  type: [
    {
      required: true,
      message: () => $t('codegen.generate.relation.type_required'),
      trigger: 'change',
    },
  ],
  name: [
    {
      required: true,
      message: () => $t('codegen.generate.relation.method_name_required'),
      trigger: 'blur',
    },
  ],
  model: [
    {
      required: true,
      message: () => $t('codegen.generate.relation.model_required'),
      trigger: 'blur',
    },
  ],
  local_key: [
    {
      required: true,
      message: () => $t('codegen.generate.relation.local_key_required'),
      trigger: 'blur',
    },
  ],
  foreign_key: [
    {
      required: true,
      message: () => $t('codegen.generate.relation.foreign_key_required'),
      trigger: 'blur',
    },
  ],
};

const relationTypeOptions = computed(() => [
  {
    value: 'one_to_one',
    label: $t('codegen.generate.relation.type_options.one_to_one'),
  },
  {
    value: 'one_to_many',
    label: $t('codegen.generate.relation.type_options.one_to_many'),
  },
  {
    value: 'many_to_many',
    label: $t('codegen.generate.relation.type_options.many_to_many'),
  },
]);

const addEvent = (row: null | RelationData, index: number) => {
  isEdit.value = row !== null;
  currentIndex.value = index;
  relationForm.value = row
    ? { ...row }
    : {
        type: '',
        name: '',
        addon: '',
        model: '',
        local_key: '',
        foreign_key: '',
      };
  dialogVisible.value = true;
};

const deleteEvent = (index: number) => {
  ElMessageBox.confirm($t('codegen.generate.relation.delete_confirm'), {
    confirmButtonText: $t('common.confirm'),
    cancelButtonText: $t('common.cancel'),
    type: 'warning',
  })
    .then(() => {
      localData.value.splice(index, 1);
      emit('update:modelValue', [...localData.value]);
      ElMessage.success($t('common.delete_success'));
    })
    .catch(() => {});
};

const handleClose = () => {
  dialogVisible.value = false;
  relationForm.value = {
    type: '',
    name: '',
    addon: '',
    model: '',
    local_key: '',
    foreign_key: '',
  };
  relationFormRef.value?.resetFields();
};

const handleSubmit = async () => {
  if (!relationFormRef.value) return;
  try {
    const valid = await relationFormRef.value.validate();
    if (!valid) return;
    if (isEdit.value && currentIndex.value >= 0)
      localData.value[currentIndex.value] = { ...relationForm.value };
    else localData.value.push({ ...relationForm.value });
    emit('update:modelValue', [...localData.value]);
    ElMessage.success(
      isEdit.value ? $t('common.update_success') : $t('common.add_success'),
    );
    handleClose();
  } catch {}
};

const getRelationTypeTag = (
  type: string,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' => {
  const map: Record<string, 'danger' | 'info' | 'success' | 'warning'> = {
    one_to_one: 'success',
    one_to_many: 'warning',
    many_to_many: 'danger',
  };
  return map[type] || 'info';
};

const getRelationTypeText = (type: string) => {
  const map: Record<string, string> = {
    one_to_one: $t('codegen.generate.relation.one_to_one'),
    one_to_many: $t('codegen.generate.relation.one_to_many'),
    many_to_many: $t('codegen.generate.relation.many_to_many'),
  };
  return map[type] || type;
};

const validateForm = () =>
  new Promise((resolve, reject) => {
    if (!localData.value || localData.value.length === 0) {
      resolve(true);
      return;
    }
    const isValid = localData.value.every(
      (r) => r.type && r.name && r.model && r.local_key && r.foreign_key,
    );
    if (isValid) {
      resolve(true);
    } else {
      ElMessage.warning($t('codegen.generate.relation.incomplete_setting'));
      reject(new Error('Incomplete relation settings'));
    }
  });

defineExpose({
  validateForm,
  resetForm: () => {
    localData.value = [];
  },
  getData: () => localData.value,
  setData: (data: RelationData[]) => {
    localData.value = [...data];
  },
});
</script>

<template>
  <div class="relation-settings">
    <div class="relation-form">
      <ElButton type="primary" @click="addEvent(null, -1)">
        {{ $t('codegen.generate.relation.add_relation') }}
      </ElButton>
    </div>
    <ElTable :data="localData" border style="width: 100%">
      <ElTableColumn
        prop="type"
        :label="$t('codegen.generate.relation.type')"
        width="120"
      >
        <template #default="scope">
          <ElTag :type="getRelationTypeTag(scope.row.type)">
            {{ getRelationTypeText(scope.row.type) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="name"
        :label="$t('codegen.generate.relation.method_name')"
        width="150"
      />
      <ElTableColumn
        prop="addon"
        :label="$t('codegen.generate.relation.app')"
        width="120"
      />
      <ElTableColumn
        prop="model"
        :label="$t('codegen.generate.relation.model')"
        width="150"
      />
      <ElTableColumn
        prop="local_key"
        :label="$t('codegen.generate.relation.local_key')"
        width="120"
      />
      <ElTableColumn
        prop="foreign_key"
        :label="$t('codegen.generate.relation.foreign_key')"
      />
      <ElTableColumn
        :label="$t('codegen.generate.relation.operation')"
        width="150"
        fixed="right"
      >
        <template #default="scope">
          <ElButton
            link
            type="primary"
            @click="addEvent(scope.row, scope.$index)"
          >
            {{ $t('common.edit') }}
          </ElButton>
          <ElButton link type="danger" @click="deleteEvent(scope.$index)">
            {{ $t('common.delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog
      v-model="dialogVisible"
      :title="
        isEdit
          ? $t('codegen.generate.relation.edit_relation')
          : $t('codegen.generate.relation.add_relation')
      "
      width="600px"
      :before-close="handleClose"
    >
      <ElForm
        ref="relationFormRef"
        :model="relationForm"
        :rules="relationRules"
        label-width="100px"
      >
        <ElFormItem :label="$t('codegen.generate.relation.type')" prop="type">
          <ElSelect
            v-model="relationForm.type"
            :placeholder="$t('codegen.generate.relation.type_placeholder')"
            style="width: 100%"
          >
            <ElOption
              v-for="item in relationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          :label="$t('codegen.generate.relation.method_name')"
          prop="name"
        >
          <ElInput
            v-model="relationForm.name"
            :placeholder="
              $t('codegen.generate.relation.method_name_placeholder')
            "
          />
        </ElFormItem>
        <ElFormItem :label="$t('codegen.generate.relation.app')" prop="addon">
          <ElInput
            v-model="relationForm.addon"
            :placeholder="$t('codegen.generate.relation.plugin_placeholder')"
          />
        </ElFormItem>
        <ElFormItem :label="$t('codegen.generate.relation.model')" prop="model">
          <ElInput
            v-model="relationForm.model"
            :placeholder="$t('codegen.generate.relation.model_placeholder')"
          />
        </ElFormItem>
        <ElFormItem
          :label="$t('codegen.generate.relation.local_key')"
          prop="local_key"
        >
          <ElInput
            v-model="relationForm.local_key"
            :placeholder="$t('codegen.generate.relation.local_key_placeholder')"
          />
        </ElFormItem>
        <ElFormItem
          :label="$t('codegen.generate.relation.foreign_key')"
          prop="foreign_key"
        >
          <ElInput
            v-model="relationForm.foreign_key"
            :placeholder="
              $t('codegen.generate.relation.foreign_key_placeholder')
            "
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose">{{ $t('common.cancel') }}</ElButton>
          <ElButton type="primary" @click="handleSubmit">{{
            isEdit ? $t('common.update') : $t('common.confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.relation-settings {
  padding: 20px;
}

.relation-form {
  padding: 20px;
  margin-bottom: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
