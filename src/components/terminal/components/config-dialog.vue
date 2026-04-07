<template>
  <ElDialog
    @close="$emit('close')"
    :model-value="visible"
    class="terminal-dialog"
    :title="$t('tools.terminal.form.title')"
    draggable
  >
    <!-- 配置表单 -->
    <ElForm :model="formData" label-width="120px">
      <!-- NPM源配置 -->
      <ElFormItem :label="$t('tools.terminal.form.npm_registry')">
        <ElSelect
          v-model="formData.npm_registry"
          :placeholder="$t('tools.terminal.form.placeholder.npm_registry')"
          clearable
          @change="(val) => $emit('change-registry', val, 'npm')"
        >
          <ElOption label="NPM" value="npm" />
          <ElOption label="Taobao" value="taobao" />
          <ElOption label="Tencent" value="tencent" />
          <ElOption label="Huawei" value="huawei" />
          <ElOption label="Aliyun" value="aliyun" />
        </ElSelect>
      </ElFormItem>

      <!-- Composer源配置 -->
      <ElFormItem :label="$t('tools.terminal.form.composer_registry')">
        <ElSelect
          v-model="formData.composer_registry"
          :placeholder="$t('tools.terminal.form.placeholder.composer_registry')"
          clearable
          @change="(val) => $emit('change-registry', val, 'composer')"
        >
          <ElOption label="Composer" value="composer" />
          <ElOption label="Huawei" value="huawei" />
          <ElOption label="Aliyun" value="aliyun" />
          <ElOption label="Tencent" value="tencent" />
        </ElSelect>
      </ElFormItem>

      <!-- 包管理器配置 -->
      <ElFormItem :label="$t('tools.terminal.form.package_manager')">
        <ElSelect
          v-model="formData.package_manager"
          :placeholder="$t('tools.terminal.form.placeholder.package_manager')"
          clearable
          @change="(val) => $emit('change-package-manager', val)"
        >
          <ElOption label="NPM" value="npm" />
          <ElOption label="CNPM" value="cnpm" />
          <ElOption label="PNPM" value="pnpm" />
          <ElOption label="YARN" value="yarn" />
        </ElSelect>
      </ElFormItem>

      <!-- 自动清理任务配置 -->
      <ElFormItem :label="$t('tools.terminal.form.automatic_cleanup_task')">
        <ElRadioGroup
          v-model="formData.automatic_cleanup_task"
          @change="(val) => $emit('change-cleanup', val)"
        >
          <ElRadioButton label="0">{{ $t("common.no") }}</ElRadioButton>
          <ElRadioButton label="1">{{ $t("common.yes") }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <!-- 配置对话框操作按钮 -->
    <div class="config-buttons">
      <ElButton @click="$emit('close')">
        <template #icon>
          <Icon icon="ant-design:rollback-outlined" style="font-size: 20px" />
        </template>
        {{ $t("tools.terminal.actions.return_terminal") }}</ElButton
      >
      <ElButton type="primary" @click="$emit('save')">
        <template #icon>
          <Icon icon="ant-design:check-outlined" style="font-size: 20px" />
        </template>
        {{ $t("common.save") }}</ElButton
      >
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
defineOptions({ name: "ConfigDialog" });

defineProps<{
  visible: boolean;
  formData: {
    npm_registry: string;
    composer_registry: string;
    package_manager: string;
    automatic_cleanup_task: string;
  };
}>();

defineEmits<{
  close: [];
  save: [];
  "change-registry": [val: string, type: "npm" | "composer"];
  "change-package-manager": [val: string];
  "change-cleanup": [val: string];
}>();
</script>

<style scoped lang="scss">
.config-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 20px;
  padding-right: 20px;
}
</style>
