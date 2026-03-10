<template>
  <Dialog>
    <el-card>
      <div v-loading="loading">
        <div class="text-page-title mb-[20px]">历史版本</div>
        <div class="time-dialog h-[500px]" style="overflow: auto">
          <el-scrollbar>
            <el-empty
              v-if="!loading && versionList.length === 0"
              description="暂无版本更新记录"
              :image-size="100"
            />
            <el-timeline style="width: 100%" v-else-if="!loading">
              <el-timeline-item
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
                    >{{ formatTimestamp(item.release_time)[1] }}</span
                  >
                </div>
                <el-collapse v-model="activeName" accordion>
                  <el-collapse-item :name="index">
                    <template #title>
                      <span class="text-[#333] text-[14px]">
                        v{{ item.version_no }}
                        <el-tag
                          v-if="item.is_important"
                          type="primary"
                          size="small"
                          class="ml-2"
                        >
                          重要更新
                        </el-tag>
                      </span>
                    </template>
                    <div
                      class="px-[20px] py-[20px] bg-overlay timeline-log-wrap whitespace-pre-wrap rounded-[4px]"
                      style="background: rgba(25, 103, 249, 0.03)"
                    >
                      <div class="text-[#333] text-[14px] leading-6">
                        {{ item.upgrade_log }}
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </div>
      </div>
    </el-card>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { getModuleUpgradeLogs } from "../store";
import { useDialog } from "@/components/dialog";

const [Dialog, dialogApi] = useDialog({
  title: "更新信息",
  width: "800px",
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

// Props定义
const props = defineProps({
  moduleId: {
    type: Number,
    required: true,
  },
  moduleName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

// 状态管理
const dialogVisible = ref(false);
const loading = ref(false);
const activeName = ref(0);

// 获取版本列表
const versionList = computed(() => {
  const moduleLog = getModuleUpgradeLogs(props.moduleId);
  return moduleLog ? moduleLog.version_list : [];
});

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  const [date, time] = timestamp.split(" ");
  const [hours, minutes] = time.split(":");
  return [date, `${hours}:${minutes}`];
};

// 打开对话框
const openDialog = () => {
  dialogApi.open();
  loading.value = true;

  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false;
    if (versionList.value.length > 0) {
      activeName.value = 0; // 默认展开第一个
    }
  }, 500);
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  dialogApi.close();
  emit("close");
};

// 监听moduleId变化
watch(
  () => props.moduleId,
  () => {
    if (dialogVisible.value) {
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
        if (versionList.value.length > 0) {
          activeName.value = 0;
        }
      }, 300);
    }
  }
);

defineExpose({
  openDialog,
});
</script>

<style scoped>
.el-timeline-item {
  min-height: 75px;
}

.el-timeline-item >>> .el-timeline-item__node--normal {
  left: 117px;
  width: 18px;
  height: 18px;
  background: rgba(25, 103, 249, 0.12) !important;
  border-radius: 50%;
  position: relative;
}

.el-timeline-item >>> .el-timeline-item__node--normal::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.el-timeline-item >>> .el-timeline-item__tail {
  left: 125px;
  border-left-color: #dddddd;
  border-left-style: dashed;
  margin: 24px 0 12px;
  height: calc(100% - 24px - 12px);
}

.time-dialog >>> .el-dialog__header {
  padding: 10px 20px;
  height: 25px;
  line-height: 25px;
  text-align: left;
  background: #fff;
  border-bottom: solid 1px #e4e7ed;
}

.time-dialog >>> .el-card__body {
  padding: 8px;
}

.time-dialog >>> .el-card.is-always-shadow {
  box-shadow: none;
}

.time-dialog >>> .el-dialog__headerbtn .el-dialog__close {
  color: #666;
}

.time-dialog >>> .el-dialog__headerbtn:hover .el-dialog__close {
  color: #666;
}

.time-dialog >>> .el-dialog__headerbtn {
  top: 14px;
}

.time-dialog >>> .el-collapse {
  margin-left: 119px;
  border: none;
  margin-top: -22px;
}

.time-dialog >>> .el-collapse-item__header {
  border: none;
  line-height: 25px;
  height: 25px;
  position: relative;
  z-index: 999;
}

.time-dialog >>> .el-collapse-item__wrap {
  border: none;
}

.time-dialog >>> .el-collapse-item__content {
  margin-top: 15px;
  padding-bottom: 0 !important;
}

.time-dialog >>> .el-timeline-item__node--01 {
  width: 18px !important;
  height: 18px !important;
  left: 117px !important;
}
</style>

<style>
.time-dialog .el-dialog {
  margin: 0 auto !important;
  max-height: 90%;
  overflow: hidden;
  top: 5%;
}

.time-dialog .el-dialog {
  margin: 0 auto !important;
  height: 65%;
  overflow: hidden;
  top: 10%;
}

.time-dialog .el-dialog__body {
  position: absolute;
  left: 0;
  top: 46px;
  bottom: 0;
  right: 0;
  z-index: 1;
  overflow: hidden;
  overflow-y: auto;
  padding: 10px 20px 0 0;
}

.time-dialog .el-timeline-item__wrapper {
  top: -20px !important;
}

.el-scrollbar__bar {
  z-index: 999;
}
</style>
