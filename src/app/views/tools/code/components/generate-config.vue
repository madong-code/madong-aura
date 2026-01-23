<template>
  <div class="generate-config">
    <el-form
      :model="configData"
      class="page-form"
      label-width="140px"
      ref="formRef"
      :rules="rules"
    >
      <el-form-item :label="$t('tools.code.config.delete_type')">
        <div>
          <el-radio-group v-model="configData.is_delete" @change="handleDeleteTypeChange">
            <el-radio :label="0">{{ $t("tools.code.config.physical_delete") }}</el-radio>
            <el-radio :label="1">{{ $t("tools.code.config.soft_delete") }}</el-radio>
          </el-radio-group>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t("tools.code.config.delete_type_tip") }}
          </p>
        </div>
      </el-form-item>
      <el-form-item
        prop="delete_column_name"
        :label="$t('tools.code.config.delete_field')"
        v-if="configData.is_delete"
      >
        <div>
          <el-select
            class="input-width"
            :placeholder="$t('tools.code.config.placeholder.select')"
            v-model="configData.delete_column_name"
          >
            <el-option
              :label="`${item.column_name}:${item.column_comment}`"
              :value="item.column_name"
              v-for="(item, index) in tableColumn"
              :key="index"
            />
          </el-select>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t("tools.code.config.delete_field_tip") }}
          </p>
        </div>
      </el-form-item>

      <el-form-item :label="$t('tools.code.config.edit_mode')">
        <div>
          <el-radio-group
            v-model="configData.edit_type"
            :placeholder="$t('tools.code.config.placeholder.select_edit_mode')"
          >
            <el-radio :label="1">{{ $t("tools.code.config.dialog") }}</el-radio>
            <el-radio :label="2">{{ $t("tools.code.config.drawer") }}</el-radio>
          </el-radio-group>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t("tools.code.config.edit_mode_tip") }}
          </p>
        </div>
      </el-form-item>
      <el-form-item :label="$t('tools.code.config.sort_field')">
        <div>
          <el-select
            class="input-width"
            :placeholder="$t('tools.code.config.placeholder.enter_sort_field')"
            v-model="configData.order_column_name"
            clearable
          >
            <el-option
              :label="`${item.column_name}:${item.column_comment}`"
              :value="item.column_name"
              v-for="(item, index) in tableColumn"
              :key="index"
            />
          </el-select>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t("tools.code.config.sort_field_tip") }}
          </p>
        </div>
      </el-form-item>
      <el-form-item
        :label="$t('tools.code.config.sort_order')"
        v-if="configData.order_column_name"
      >
        <div>
          <el-select
            class="input-width"
            :placeholder="$t('tools.code.config.placeholder.select_sort_order')"
            v-model="configData.order_type"
          >
            <el-option :label="$t('tools.code.config.asc')" :value="1" />
            <el-option :label="$t('tools.code.config.desc')" :value="2" />
          </el-select>
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t("tools.code.config.sort_order_tip") }}
          </p>
        </div>
      </el-form-item>
      <el-form-item :label="$t('tools.code.config.parent_menu')">
        <div>
          <el-tree-select
            class="input-width"
            v-if="configData.addon_name"
            clearable
            v-model="configData.parent_menu"
            :props="{ label: 'menu_name', value: 'menu_key' }"
            :data="addonMenuList"
            check-strictly
            :render-after-expand="false"
            :loading="menuLoading"
            :remote-method="loadAddonMenuList"
          />
          <el-tree-select
            class="input-width"
            v-else
            v-model="configData.parent_menu"
            clearable
            :props="{ label: 'menu_name', value: 'menu_key' }"
            :data="sysMenuList"
            check-strictly
            :render-after-expand="false"
            :loading="menuLoading"
            :remote-method="loadSysMenuList"
          />
          <p class="text-[12px] text-[#a9a9a9] leading-normal mt-[5px]">
            {{ $t("tools.code.config.parent_menu_tip") }}
          </p>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";

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

// Props定义：接收父组件传递的数据
const props = defineProps<{
  configData: GenerateConfigData;
  tableColumn: any[];
  basicData: BasicData;
}>();

// Emits定义：向父组件发送数据变更事件
const emit = defineEmits<{
  "update:configData": [GenerateConfigData];
}>();

// 菜单列表数据
const addonMenuList = ref<any[]>([]);
const sysMenuList = ref<any[]>([]);
const menuLoading = ref(false);

// 表单验证规则
const rules = ref({
  delete_column_name: [{ required: true, message: "请选择删除字段", trigger: "change" }],
});

// 表单引用
const formRef = ref();

/**
 * 加载插件菜单列表
 */
const loadAddonMenuList = async () => {
  try {
    menuLoading.value = true;
    // 这里应该调用API获取插件菜单数据
    // const response = await api.getAddonMenuList(props.basicData.plugin_name);
    // addonMenuList.value = response.data || [];

    // 模拟数据
    addonMenuList.value = [
      { menu_key: "addon_menu1", menu_name: "插件菜单1" },
      { menu_key: "addon_menu2", menu_name: "插件菜单2" },
      { menu_key: "addon_menu3", menu_name: "插件菜单3" },
    ];
  } catch (error) {
    console.error("加载插件菜单失败:", error);
    addonMenuList.value = [];
  } finally {
    menuLoading.value = false;
  }
};

/**
 * 加载系统菜单列表
 */
const loadSysMenuList = async () => {
  try {
    menuLoading.value = true;
    // 这里应该调用API获取系统菜单数据
    // const response = await api.getSysMenuList();
    // sysMenuList.value = response.data || [];

    // 模拟数据
    sysMenuList.value = [
      { menu_key: "sys_menu1", menu_name: "系统菜单1" },
      { menu_key: "sys_menu2", menu_name: "系统菜单2" },
      { menu_key: "sys_menu3", menu_name: "系统菜单3" },
      { menu_key: "sys_menu4", menu_name: "系统菜单4" },
    ];
  } catch (error) {
    console.error("加载系统菜单失败:", error);
    sysMenuList.value = [];
  } finally {
    menuLoading.value = false;
  }
};

/**
 * 处理删除类型变更
 */
const handleDeleteTypeChange = () => {
  if (props.configData.is_delete === 0) {
    props.configData.delete_column_name = "";
  }
  handleDataChange();
};

/**
 * 处理数据变更，通知父组件
 */
const handleDataChange = () => {
  emit("update:configData", { ...props.configData });
};

/**
 * 验证表单
 */
const validateForm = () => {
  return new Promise((resolve, reject) => {
    if (!formRef.value) {
      resolve(true);
      return;
    }

    formRef.value.validate((valid: boolean) => {
      if (valid) {
        resolve(true);
      } else {
        reject(new Error("表单验证失败"));
      }
    });
  });
};

/**
 * 重置表单
 */
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

/**
 * 获取数据
 */
const getData = (): GenerateConfigData => {
  return { ...props.configData };
};

/**
 * 设置数据
 */
const setData = (data: Partial<GenerateConfigData>) => {
  Object.assign(props.configData, data);
  handleDataChange();
};

/**
 * 刷新菜单数据
 */
const refreshMenuData = () => {
  if (props.configData.addon_name) {
    loadAddonMenuList();
  } else {
    loadSysMenuList();
  }
};

// 监听基础数据变化，自动更新插件名称
watch(
  () => props.basicData.plugin_name,
  (newVal) => {
    props.configData.addon_name = newVal || "";
    // 插件名称变化时重新加载菜单
    refreshMenuData();
  }
);

// 监听插件名称变化，自动加载对应的菜单数据
watch(
  () => props.configData.addon_name,
  (newVal) => {
    refreshMenuData();
  }
);

onMounted(() => {
  // 初始化时根据基础数据设置插件名称
  if (props.basicData.plugin_name) {
    props.configData.addon_name = props.basicData.plugin_name;
  }
  // 初始化菜单数据
  refreshMenuData();
});

// 暴露方法给父组件
defineExpose({
  validateForm,
  resetForm,
  getData,
  setData,
  refreshMenuData,
});
</script>

<style scoped>
.generate-config {
  padding: 20px;
}

.input-width {
  width: 300px;
}
</style>
