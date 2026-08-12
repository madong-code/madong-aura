<script setup lang="ts">
/** 插件开发：仅平台运营端可用，非平台账号打开返回 403 未授权 */
import { onMounted, ref } from 'vue';

import { ElMessageBox } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { AppPluginDevelopService } from '#/api/app/plugin/develop';
import { requestClient } from '#/api/request';
import { Page } from '#/components/page';
import { Fallback } from '#/core/ui/common';
import { $t } from '#/locales';

import { useCrudSchema } from './schemas';

defineOptions({ name: 'AppPluginDevelop' });

const mode = ref<string>('standalone');
const loading = ref(true);

onMounted(async () => {
  try {
    const res: any = await requestClient.get('/site/mode');
    mode.value = res?.mode || 'standalone';
  } catch {
    mode.value = 'standalone';
  } finally {
    loading.value = false;
  }
});

const [BasicCrud] = useCrud({
  ...useCrudSchema(),

  // 表格操作列
  tableActions: [],
  dropDownActions: [
    {
      label: $t('app.plugin.develop.action.package'),
      icon: 'ant-design:download-outlined',
      auth: 'plugin:develop:build',
      onClick: async (_e: Event, row: any) => {
        try {
          await ElMessageBox.confirm(
            $t('app.plugin.develop.action.package_confirm_message'),
            $t('app.plugin.develop.action.package_confirm_title'),
            {
              confirmButtonText: $t(
                'app.plugin.develop.action.package_confirm',
              ),
              cancelButtonText: $t('app.plugin.develop.action.package_cancel'),
              type: 'warning',
              closeOnClickModal: false,
              closeOnPressEscape: false,
            },
          );

          const res: any = await AppPluginDevelopService.build(row.id);
          const zipPath = res?.zip_path || '';
          const hasFrontend = res?.has_frontend
            ? $t('app.plugin.develop.action.package_has_frontend') +
              $t('common.yes')
            : $t('app.plugin.develop.action.package_has_frontend') +
              $t('common.no');

          ElMessageBox.alert(
            `<div style="line-height: 2;">
                <div style="margin-bottom: 10px;"><strong>${$t('app.plugin.develop.action.package_plugin')}:</strong> ${res.plugin_key || row.key}</div>
                <div style="margin-bottom: 10px;"><strong>${$t('app.plugin.develop.action.package_zip_path')}:</strong> ${zipPath}</div>
                <div><strong>${$t('app.plugin.develop.action.package_has_frontend')}:</strong> ${hasFrontend}</div>
              </div>`,
            $t('app.plugin.develop.action.package_success'),
            {
              dangerouslyUseHTMLString: true,
              showConfirmButton: true,
              showClose: false,
              closeOnClickModal: true,
              closeOnPressEscape: true,
            },
          );
        } catch {
          // 用户取消操作
        }
      },
    },
  ],
  toolbarActions: [],
  dropDownToolbarActions: [],
});
</script>

<template>
  <div v-loading="loading" class="h-full">
    <Fallback v-if="mode === 'saas'" status="403" />
    <Page v-else-if="!loading" auto-content-height>
      <template #header>
        <div class="mb-4">
          <h2 class="text-xl font-bold text-gray-800">插件开发</h2>
          <p class="mt-1 text-sm text-gray-400">
            {{ $t('app.plugin.develop.description') }}
          </p>
        </div>
      </template>

      <BasicCrud />
    </Page>
  </div>
</template>
