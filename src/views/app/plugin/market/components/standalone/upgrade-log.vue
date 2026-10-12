<script setup lang="ts">
/** 版本更新日志对话框 — 100% 移植自 madong-vue upgrade-log */
import { ref, watch } from 'vue';

import {
  ElCollapse,
  ElCollapseItem,
  ElEmpty,
  ElScrollbar,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { requestClient } from '#/api/request';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'UpgradeLog' });

const props = defineProps<{ moduleCode?: string; moduleId?: number }>();

const emit = defineEmits<{ close: [] }>();

const [Dialog, dialogApi] = useDialog({
  title: $t('app.plugin.market.upgrade_log.title'),
  width: '800px',
  fullscreen: false,
  footer: false,
  draggable: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm: () => {
    dialogApi.close();
  },
  onCancel: () => {
    handleClose();
  },
});

const loading = ref(false);
const activeName = ref(0);
const versionList = ref<any[]>([]);
const currentModuleCode = ref(props.moduleCode);

const fetchVersionList = async (code?: string) => {
  const moduleCode = code || currentModuleCode.value;
  if (!moduleCode) {
    versionList.value = [];
    return;
  }
  loading.value = true;
  try {
    const response: any = await requestClient.get(
      `/plugin/${moduleCode}/upgrade-logs`,
    );
    versionList.value = response?.version_list || [];
  } catch {
    versionList.value = [];
  } finally {
    loading.value = false;
  }
};

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return ['', ''];
  const [date, time] = timestamp.split(' ');
  if (!time) return [date, ''];
  const [hours, minutes] = time.split(':');
  return [date, `${hours}:${minutes}`];
};

const openDialog = async (mod?: any) => {
  currentModuleCode.value = mod?.code || props.moduleCode;
  dialogApi.open();
  await fetchVersionList(currentModuleCode.value);
  if (versionList.value.length > 0) activeName.value = 0;
};

const handleClose = () => {
  dialogApi.close();
  versionList.value = [];
  activeName.value = 0;
  emit('close');
};

watch(
  () => props.moduleCode,
  async () => {
    if (dialogApi.getState().visible) {
      await fetchVersionList();
      if (versionList.value.length > 0) activeName.value = 0;
    }
  },
);

defineExpose({ openDialog });
</script>

<template>
  <Dialog>
    <div v-loading="loading" class="p-[20px] mt-5">
      <div class="time-dialog h-[500px]" style="overflow: auto">
        <ElScrollbar>
          <ElEmpty
            v-if="!loading && versionList.length === 0"
            :description="$t('app.plugin.market.upgrade_log.no_records')"
            :image-size="100"
          />
          <ElTimeline style="width: 100%" v-else-if="!loading">
            <ElTimelineItem
              v-for="(item, index) in versionList"
              :key="index"
              :color="item.is_important ? '#409EFF' : '#909399'"
            >
              <div class="relative">
                <span class="text-[#333333] text-[14px] absolute">{{
                  formatTimestamp(item.release_time)[0]
                }}</span>
                <br />
                <span
                  class="text-[#999999] text-[14px] w-[78px] block mt-[10px] absolute text-right"
                  >{{ formatTimestamp(item.release_time)[1] }}</span>
              </div>
              <ElCollapse v-model="activeName" accordion>
                <ElCollapseItem :name="index">
                  <template #title>
                    <span class="text-[#333] text-[14px]">
                      v{{ item.version_no }}
                      <ElTag
                        v-if="item.is_important"
                        type="primary"
                        size="small"
                        class="ml-2"
                        >{{
                          $t('app.plugin.market.upgrade_log.important')
                        }}</ElTag>
                    </span>
                  </template>
                  <div
                    class="px-[20px] py-[20px] bg-overlay timeline-log-wrap whitespace-pre-wrap rounded-[4px]"
                    style="background: rgb(25 103 249 / 3%)"
                  >
                    <div
                      class="text-[#333] text-[14px] leading-6"
                      v-html="item.upgrade_log"
                    ></div>
                  </div>
                </ElCollapseItem>
              </ElCollapse>
            </ElTimelineItem>
          </ElTimeline>
        </ElScrollbar>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.el-timeline-item {
  min-height: 75px;
}

:deep(.el-timeline-item__node--normal) {
  position: relative;
  left: 117px;
  width: 18px;
  height: 18px;
  background: rgb(25 103 249 / 12%) !important;
  border-radius: 50%;
}

:deep(.el-timeline-item__node--normal::before) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  content: '';
  background-color: var(--el-color-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

:deep(.el-timeline-item__tail) {
  left: 125px;
  height: calc(100% - 24px - 12px);
  margin: 24px 0 12px;
  border-left-color: #ddd;
  border-left-style: dashed;
}

:deep(.el-dialog__header) {
  height: 25px;
  padding: 10px 20px;
  line-height: 25px;
  text-align: left;
  background: #fff;
  border-bottom: solid 1px #e4e7ed;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #666;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #666;
}

:deep(.el-dialog__headerbtn) {
  top: 14px;
}

:deep(.el-collapse) {
  margin-top: -22px;
  margin-left: 119px;
  border: none;
}

:deep(.el-collapse-item__header) {
  position: relative;
  z-index: 999;
  height: 25px;
  line-height: 25px;
  border: none;
}

:deep(.el-collapse-item__wrap) {
  border: none;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0 !important;
  margin-top: 15px;
}

:deep(.el-timeline-item__node--01) {
  left: 117px !important;
  width: 18px !important;
  height: 18px !important;
}
</style>

<style>
.time-dialog .el-dialog {
  top: 10%;
  height: 65%;
  max-height: 90%;
  margin: 0 auto !important;
  overflow: hidden;
}

.time-dialog .el-dialog__body {
  position: absolute;
  inset: 46px 0 0;
  z-index: 1;
  padding: 10px 20px 0 0;
  overflow: hidden;
  overflow-y: auto;
}

.time-dialog .el-timeline-item__wrapper {
  top: -20px !important;
}

.el-scrollbar__bar {
  z-index: 999;
}
</style>
