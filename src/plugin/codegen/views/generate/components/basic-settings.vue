<script setup lang="ts">
/** 基础设置 — 移植自 zold */
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus';

import { GeneratorCodeService } from '#/api/app/plugin/codegen';
import { $t } from '#/locales';

interface BasicSettingsData {
  table_name: string;
  table_content: string;
  plugin_name: string;
  module_name: string;
  class_name: string;
}

const props = defineProps<{ modelValue?: BasicSettingsData }>();
const emit = defineEmits<{
  dataChange: [value: BasicSettingsData];
  'update:modelValue': [value: BasicSettingsData];
}>();

const formData = ref<BasicSettingsData>({
  table_name: '',
  table_content: '',
  plugin_name: '',
  module_name: '',
  class_name: '',
});

const pluginList = ref<{ label: string; value: string }[]>([]);

let debounceTimer: null | ReturnType<typeof setTimeout> = null;

const handleDataChange = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emitDataChange(), 300);
};

const emitDataChange = () => {
  const formattedData = getFormattedData();
  emit('update:modelValue', formattedData);
  emit('dataChange', formattedData);
};

const convert_to_camel_case = (name: string): string => {
  if (!name) return '';
  return name.replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const convert_to_pascal_case = (name: string): string => {
  if (!name) return '';
  const camel_case = convert_to_camel_case(name);
  return camel_case.charAt(0).toUpperCase() + camel_case.slice(1);
};

const convert_to_snake_case = (name: string): string => {
  if (!name) return '';
  return name
    .replaceAll(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

const handleModuleNameBlur = () => {
  if (formData.value.module_name) {
    formData.value.module_name = convert_to_snake_case(
      formData.value.module_name,
    );
    handleDataChange();
  }
};

const handleClassNameBlur = () => {
  if (formData.value.class_name) {
    formData.value.class_name = convert_to_snake_case(
      formData.value.class_name,
    );
    handleDataChange();
  }
};

const getFormattedData = () => ({
  table_name: formData.value.table_name,
  table_content: formData.value.table_content,
  plugin_name: formData.value.plugin_name,
  module_name: formData.value.module_name,
  class_name: formData.value.class_name,
  camel_case_name: convert_to_camel_case(formData.value.class_name),
  pascal_case_name: convert_to_pascal_case(formData.value.class_name),
});

const getPluginDev = () => {
  GeneratorCodeService.getPluginDevList({ format: 'select' }).then(
    (data: any) => {
      pluginList.value = data as { label: string; value: string }[];
    },
  );
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) formData.value = { ...formData.value, ...newValue };
  },
  { immediate: true, deep: true },
);

defineExpose({
  getData: () => getFormattedData(),
  setData: (data: Partial<BasicSettingsData>) => {
    formData.value = { ...formData.value, ...data };
    emitDataChange();
  },
  validate: () => {
    if (!formData.value.table_name)
      return { valid: false, message: '请选择数据表' };
    if (!formData.value.module_name)
      return { valid: false, message: '请输入模块名称' };
    if (!formData.value.class_name)
      return { valid: false, message: '请输入类名称' };
    return { valid: true };
  },
});

onMounted(() => {
  getPluginDev();
});
onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <div class="basic-settings">
    <ElForm :model="formData" label-width="90px" style="max-width: 450px">
      <ElFormItem :label="$t('codegen.generate.basic.table_name')">
        <ElInput
          v-model.trim="formData.table_name"
          disabled
          :placeholder="$t('codegen.generate.basic.table_name_placeholder')"
          class="input-width"
          maxlength="64"
        />
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.basic.description')">
        <ElInput
          v-model.trim="formData.table_content"
          clearable
          :placeholder="$t('codegen.generate.basic.description_placeholder')"
          class="input-width"
          maxlength="64"
          @blur="handleDataChange"
          @input="handleDataChange"
        />
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.basic.plugin')">
        <ElSelect
          class="input-width"
          :placeholder="$t('codegen.generate.basic.plugin_placeholder')"
          v-model="formData.plugin_name"
          filterable
          remote
          clearable
          @change="handleDataChange"
          @clear="handleDataChange"
        >
          <ElOption
            :label="item.label"
            :value="item.value"
            v-for="item in pluginList"
            :key="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.basic.module_name')">
        <div>
          <ElInput
            v-model.trim="formData.module_name"
            clearable
            :placeholder="$t('codegen.generate.basic.module_name_placeholder')"
            class="input-width"
            @blur="handleModuleNameBlur"
            @input="handleDataChange"
          />
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.basic.module_tip_1') }}
          </p>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.basic.module_tip_2') }}
          </p>
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.basic.class_name')">
        <div>
          <ElInput
            v-model.trim="formData.class_name"
            clearable
            :placeholder="$t('codegen.generate.basic.class_name_placeholder')"
            class="input-width"
            @blur="handleClassNameBlur"
            @input="handleDataChange"
          />
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.basic.class_tip_1') }}
          </p>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.basic.class_tip_2') }}
          </p>
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped>
.basic-settings {
  padding: 20px;
}

.input-width {
  width: 300px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
