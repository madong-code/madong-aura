<template>
  <div class="plugin-develop-page art-full-height">
    <BasicCrud />
    <PluginForm ref="pluginFormRef" />
  </div>
</template>

<script setup lang="tsx">
import { ref } from "vue";
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import { PluginDevelopRow } from "@/api/tools/apps/develop/types";
import PluginDevelopService from "@/api/tools/apps/develop";
import { ElMessage, ElMessageBox } from "element-plus";
import { $t } from "@/locales";
import { PluginForm } from "./components";

const pluginFormRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {},
  toolbarActions: [
    {
      label: $t("tools.plugin.develop.create"),
      type: "primary",
      sort: 1010,
      icon: "ant-design:plus-outlined",
      auth: "plugin:develop:create",
      async onClick() {
        pluginFormRef.value?.show(crudApi, {}, "add");
      },
    },
  ],
  dropDownToolbarActions: [],
  tableActions: [
    {
      label: $t("tools.plugin.develop.edit"),
      type: "primary",
      sort: 1010,
      icon: "ant-design:edit-outlined",
      link: true,
      auth: "plugin:develop:update",
      async onClick(event: any, record: PluginDevelopRow) {
        pluginFormRef.value?.show(crudApi, record, "edit");
      },
    },
    {
      label: $t("tools.plugin.develop.action.package"),
      type: "primary",
      sort: 1010,
      link: true,
      icon: "ant-design:download-outlined",
      auth: "plugin:develop:package",
      async onClick(event: any, record: PluginDevelopRow) {
        try {
          await ElMessageBox.confirm(
            $t("tools.plugin.develop.action.package_confirm_message"),
            $t("tools.plugin.develop.action.package_confirm_title"),
            {
              confirmButtonText: $t("tools.plugin.develop.action.package_confirm"),
              cancelButtonText: $t("tools.plugin.develop.action.package_cancel"),
              type: "warning",
              closeOnClickModal: false,
              closeOnPressEscape: false,
            }
          );

          const res = (await PluginDevelopService.build(record.key)) as any;

          const zipPath = res?.zip_path || "";
          const hasFrontend = res?.has_frontend
            ? $t("tools.plugin.develop.action.package_has_frontend") + "是"
            : $t("tools.plugin.develop.action.package_has_frontend") + "否";

          ElMessageBox.alert(
            `<div style="line-height: 2;">
                <div style="margin-bottom: 10px;"><strong>${$t(
                  "tools.plugin.develop.action.package_plugin"
                )}:</strong> ${res.plugin_key}</div>
                <div style="margin-bottom: 10px;"><strong>${$t(
                  "tools.plugin.develop.action.package_zip_path"
                )}:</strong> ${zipPath}</div>
                <div><strong>${$t(
                  "tools.plugin.develop.action.package_has_frontend"
                )}:</strong> ${hasFrontend}</div>
              </div>`,
            $t("tools.plugin.develop.action.package_success"),
            {
              showConfirmButton: true,
              dangerouslyUseHTMLString: true,
              showClose: false,
              closeOnClickModal: true,
              closeOnPressEscape: true,
            }
          );
        } catch (error) {
          // 用户取消操作
          console.log("打包操作已取消");
        }
      },
    },
  ],
  dropDownActions: [],
});
</script>

<style lang="scss" scoped>
.plugin-develop-page {
  height: 100%;
}

:deep(.plugin-title-cell) {
  .plugin-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .plugin-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: cover;
  }

  .plugin-title {
    font-weight: 500;
  }
}

:deep(.install-status) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;

  .installed-icon {
    color: #67c23a;
    font-size: 18px;
  }

  .uninstalled-icon {
    color: #909399;
    font-size: 18px;
  }

  span {
    color: #606266;
  }
}
</style>
