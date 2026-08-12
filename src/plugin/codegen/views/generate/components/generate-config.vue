<script setup lang="ts">
/** 生成配置 — 移植自 zold */
import { onMounted, ref, watch } from 'vue';

import {
  ElForm,
  ElFormItem,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElTreeSelect,
} from 'element-plus';

import { $t } from '#/locales';

interface GenerateConfigData {
  is_delete: number;
  delete_column_name: string;
  edit_type: number;
  order_column_name: string;
  order_type: number;
  parent_menu: string;
  addon_name: string;
  table_column: any[];
}

interface BasicData {
  table_name: string;
  table_content: string;
  plugin_name: string;
  module_name: string;
  class_name: string;
}

const props = defineProps<{
  basicData: BasicData;
  configData: GenerateConfigData;
  tableColumn: any[];
}>();

const emit = defineEmits<{ 'update:configData': [GenerateConfigData] }>();

// 本地响应式副本，避免直接修改 prop
const localConfigData = ref<GenerateConfigData>({ ...props.configData });

let updatingFromParent = false;

watch(
  () => props.configData,
  (val) => {
    updatingFromParent = true;
    localConfigData.value = { ...val };
    // 当前同步周期内阻止 emit 回写，打破死循环
    queueMicrotask(() => {
      updatingFromParent = false;
    });
  },
);

watch(
  localConfigData,
  (val) => {
    if (updatingFromParent) return;
    emit('update:configData', { ...val });
  },
  { deep: true },
);

const addonMenuList = ref<any[]>([]);
const sysMenuList = ref<any[]>([]);
const menuLoading = ref(false);
const formRef = ref();

const rules = ref({
  delete_column_name: [
    { required: true, message: '请选择删除字段', trigger: 'change' },
  ],
});

const loadAddonMenuList = async () => {
  menuLoading.value = true;
  try {
    addonMenuList.value = [
      { menu_key: 'addon_menu1', menu_name: '插件菜单1' },
      { menu_key: 'addon_menu2', menu_name: '插件菜单2' },
    ];
  } catch {
    addonMenuList.value = [];
  } finally {
    menuLoading.value = false;
  }
};

const loadSysMenuList = async () => {
  menuLoading.value = true;
  try {
    sysMenuList.value = [
      { menu_key: 'sys_menu1', menu_name: '系统菜单1' },
      { menu_key: 'sys_menu2', menu_name: '系统菜单2' },
    ];
  } catch {
    sysMenuList.value = [];
  } finally {
    menuLoading.value = false;
  }
};

const handleDeleteTypeChange = () => {
  if (localConfigData.value.is_delete === 0)
    localConfigData.value.delete_column_name = '';
};

const validateForm = () =>
  new Promise((resolve) => {
    if (!formRef.value) {
      resolve(true);
      return;
    }
    formRef.value.validate((valid: boolean) =>
      valid ? resolve(true) : resolve(false),
    );
  });

const refreshMenuData = () => {
  if (localConfigData.value.addon_name) loadAddonMenuList();
  else loadSysMenuList();
};

watch(
  () => props.basicData.plugin_name,
  (newVal) => {
    localConfigData.value.addon_name = newVal || '';
    refreshMenuData();
  },
);

watch(
  () => localConfigData.value.addon_name,
  () => {
    refreshMenuData();
  },
);

onMounted(() => {
  if (props.basicData.plugin_name)
    localConfigData.value.addon_name = props.basicData.plugin_name;
  refreshMenuData();
});

defineExpose({
  validateForm,
  resetForm: () => formRef.value?.resetFields(),
  getData: () => ({ ...localConfigData.value }),
  setData: (data: Partial<GenerateConfigData>) => {
    localConfigData.value = { ...localConfigData.value, ...data };
  },
  refreshMenuData,
});
</script>

<template>
  <div class="generate-config">
    <ElForm
      :model="localConfigData"
      class="page-form"
      label-width="140px"
      ref="formRef"
      :rules="rules"
    >
      <ElFormItem :label="$t('codegen.generate.config.delete_type')">
        <div>
          <ElRadioGroup
            v-model="localConfigData.is_delete"
            @change="handleDeleteTypeChange"
          >
            <ElRadio :label="0">
              {{ $t('codegen.generate.config.physical_delete') }}
            </ElRadio>
            <ElRadio :label="1">
              {{ $t('codegen.generate.config.soft_delete') }}
            </ElRadio>
          </ElRadioGroup>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.config.delete_type_tip') }}
          </p>
        </div>
      </ElFormItem>
      <ElFormItem
        prop="delete_column_name"
        :label="$t('codegen.generate.config.delete_field')"
        v-if="localConfigData.is_delete"
      >
        <div>
          <ElSelect
            class="input-width"
            :placeholder="$t('codegen.generate.config.placeholder.select')"
            v-model="localConfigData.delete_column_name"
          >
            <ElOption
              :label="`${item.column_name}:${item.column_comment}`"
              :value="item.column_name"
              v-for="(item, index) in tableColumn"
              :key="index"
            />
          </ElSelect>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.config.delete_field_tip') }}
          </p>
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.config.edit_mode')">
        <div>
          <ElRadioGroup v-model="localConfigData.edit_type">
            <ElRadio :label="1">
              {{ $t('codegen.generate.config.dialog') }}
            </ElRadio>
            <ElRadio :label="2">
              {{ $t('codegen.generate.config.drawer') }}
            </ElRadio>
          </ElRadioGroup>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.config.edit_mode_tip') }}
          </p>
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.config.sort_field')">
        <div>
          <ElSelect
            class="input-width"
            :placeholder="
              $t('codegen.generate.config.placeholder.enter_sort_field')
            "
            v-model="localConfigData.order_column_name"
            clearable
          >
            <ElOption
              :label="`${item.column_name}:${item.column_comment}`"
              :value="item.column_name"
              v-for="(item, index) in tableColumn"
              :key="index"
            />
          </ElSelect>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.config.sort_field_tip') }}
          </p>
        </div>
      </ElFormItem>
      <ElFormItem
        :label="$t('codegen.generate.config.sort_order')"
        v-if="localConfigData.order_column_name"
      >
        <div>
          <ElSelect
            class="input-width"
            :placeholder="
              $t('codegen.generate.config.placeholder.select_sort_order')
            "
            v-model="localConfigData.order_type"
          >
            <ElOption :label="$t('codegen.generate.config.asc')" :value="1" />
            <ElOption :label="$t('codegen.generate.config.desc')" :value="2" />
          </ElSelect>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.config.sort_order_tip') }}
          </p>
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('codegen.generate.config.parent_menu')">
        <div>
          <ElTreeSelect
            class="input-width"
            v-if="localConfigData.addon_name"
            clearable
            v-model="localConfigData.parent_menu"
            :props="{ label: 'menu_name' }"
            node-key="menu_key"
            :data="addonMenuList"
            check-strictly
            :render-after-expand="false"
            :loading="menuLoading"
          />
          <ElTreeSelect
            class="input-width"
            v-else
            v-model="localConfigData.parent_menu"
            clearable
            :props="{ label: 'menu_name' }"
            node-key="menu_key"
            :data="sysMenuList"
            check-strictly
            :render-after-expand="false"
            :loading="menuLoading"
          />
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t('codegen.generate.config.parent_menu_tip') }}
          </p>
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped>
.generate-config {
  padding: 20px;
}

.input-width {
  width: 300px;
}
</style>
