<script setup lang="ts">
/** 授权版卸载弹窗 - 仅卸载菜单，无文件操作 */
import { ref } from 'vue';

import { ElButton, ElCard, ElIcon, ElMessage, ElProgress } from 'element-plus';
import { TriangleAlert } from 'lucide-vue-next';

import { requestClient } from '#/api/request';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'GrantedModuleUninstallDialog' });

const props = defineProps<{ plugin: any }>();

const emit = defineEmits<{ close: []; refresh: [] }>();

const [Dialog, dialogApi] = useDialog({
  title: $t('app.plugin.market.uninstall.title'),
  width: '500px',
  fullscreen: false,
  footer: false,
  draggable: true,
  closeOnClickModal: false,
  destroyOnClose: true,
});

const loading = ref(false);
const uninstalling = ref(false);

const openDialog = () => {
  if (!props.plugin?.code) {
    ElMessage.error($t('app.plugin.market.install.invalid'));
    return;
  }
  loading.value = false;
  uninstalling.value = false;
  dialogApi.open();
};

const confirmUninstall = async () => {
  uninstalling.value = true;
  loading.value = true;
  try {
    await requestClient.post(
      `/tenant/plugin/${props.plugin.code}/uninstall-menu`,
    );
    ElMessage.success(
      $t('app.plugin.market.uninstall.success', { name: props.plugin.name }),
    );
    dialogApi.close();
    emit('refresh');
  } catch (error: any) {
    ElMessage.error(error?.message || $t('app.plugin.market.uninstall.fail'));
  } finally {
    uninstalling.value = false;
    loading.value = false;
  }
};

const handleClose = () => {
  dialogApi.close();
  emit('close');
};

defineExpose({ openDialog });
</script>

<template>
  <Dialog>
    <ElCard class="box-card !border-none" shadow="never">
      <div class="p-4 text-center">
        <ElIcon class="mb-4" :size="48" color="#e6a23c">
          <TriangleAlert />
        </ElIcon>
        <h3 class="text-lg font-medium mb-2">
          {{ $t('app.plugin.market.uninstall.dialog_title') }}
        </h3>
        <p
          class="text-sm text-gray-500 mb-2"
          v-html="
            $t('app.plugin.market.uninstall.confirm_msg', {
              name: plugin?.name,
            })
          "
        ></p>
        <p class="text-sm text-orange-500 mb-6">
          {{ $t('app.plugin.market.uninstall.warning') }}
        </p>
        <div v-if="loading" class="flex flex-col items-center gap-3">
          <ElProgress
            :percentage="100"
            :stroke-width="6"
            striped
            striped-flow
            status="warning"
          />
          <span class="text-sm text-gray-400">{{
            $t('app.plugin.market.uninstall.uninstalling')
          }}</span>
        </div>
        <div v-else class="flex justify-center gap-3">
          <ElButton @click="handleClose">
            {{ $t('app.plugin.market.install.cancel') }}
          </ElButton>
          <ElButton
            type="danger"
            :loading="uninstalling"
            @click="confirmUninstall"
          >
            {{ $t('app.plugin.market.uninstall.confirm') }}
          </ElButton>
        </div>
      </div>
    </ElCard>
  </Dialog>
</template>
