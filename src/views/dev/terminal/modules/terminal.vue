<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";

import { useDrawer, useModal } from "#/components/core/effects/common-ui";
import { $t } from "#/locale";
import { cloneDeep } from "#/components/core/utils";

import { useForm } from "#/adapter/form";

import { TerminalApi } from "#/api/dev/terminal";

import {
  ElButton,
  ElSpace,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElAlert,
  ElEmpty,
  ElTimeline,
  ElTimelineItem,
  ElCard,
  ElTag,
  ElRadioGroup,
  ElRadioButton,
  ElSelect,
  ElOption,
  ElDialog,
  ElLoading,
  ElMessageBox,
} from "element-plus";

import { DictEnum, taskStatus } from "@/enums/index";
import { useTerminalStore } from "@/store/modules/terminal";
import { confirm, getDictOptions } from "@/utils";

const emit = defineEmits(["retry", "delete", "toggle-log"]);

const isUpdate = ref<Boolean>(false);
const api = new TerminalApi();
const scrollContainer = ref<HTMLElement | null>(null);

const [Form, formApi] = useForm({
  commonConfig: {
    formItemClass: "col-span-12",
    componentProps: {
      class: "w-full",
    },
    labelWidth: 120,
  },
  schema: [
    {
      component: "Select",
      fieldName: "npm_registry",
      defaultValue: "npm",
      label: $t("dev.terminal.form.npm_registry"),
      componentProps: {
        placeholder: $t("dev.terminal.form.placeholder.npm_registry"),
        clearable: true,
        options: [
          { label: "NPM", value: "npm" },
          { label: "Taobao", value: "taobao" },
          { label: "Tencent", value: "tencent" },
          { label: "未知", value: "unknown" },
        ],
        onChange: (value) => {
          changeRegistry(value, "npm");
        },
      },
    },
    {
      component: "Select",
      fieldName: "composer_registry",
      defaultValue: "composer",
      label: $t("dev.terminal.form.composer_registry"),
      componentProps: {
        placeholder: $t("dev.terminal.form.placeholder.composer_registry"),
        clearable: true,
        options: [
          { label: "Composer", value: "composer" },
          { label: "Huawei", value: "huawei" },
          { label: "Aliyun", value: "aliyun" },
          { label: "Tencent", value: "tencent" },
        ],
        onChange: (value) => {
          changeRegistry(value, "composer");
        },
      },
    },
    {
      component: "Select",
      fieldName: "package_manager",
      label: $t("dev.terminal.form.package_manager"),
      defaultValue: "pnpm",
      componentProps: {
        placeholder: $t("dev.terminal.form.placeholder.package_manager"),
        clearable: true,
        options: [
          { label: "NPM", value: "npm" },
          { label: "PNPM", value: "pnpm" },
          { label: "YARN", value: "yarn" },
        ],
        onChange: (value) => {
          changePackageManager(value);
        },
      },
    },
    {
      fieldName: "automatic_cleanup_task",
      label: $t("dev.terminal.form.automatic_cleanup_task"),
      component: "RadioGroup",
      defaultValue: 1,
      componentProps: {
        buttonStyle: "solid",
        options: getDictOptions(DictEnum.SYS_YES_NO),
        optionType: "button",
        onChange: (value) => {
          //调用接口
          console.log(value);
        },
      },
    },
  ],
  showDefaultActions: false,
  wrapperClass: "grid-cols-12",
});

const [Modal, modalApi] = useModal({
  destroyOnClose: true,
  draggable: true,
  fullscreenButton: false,
  async onOpenChange(isOpen) {
    if (isOpen) {
      terminal.state.showConfig = false;
    }
  },
});

const terminal = useTerminalStore();

type SourceType = "npm" | "composer";

const state = reactive({
  registryLoading: false,
  registryLoadingType: "pnpm",
  packageManagerLoading: false,
});

const getTaskStatus = (status: number) => {
  const statusMap: Record<number, { statusText: string; statusType: string }> = {
    [taskStatus.Waiting]: {
      statusText: $t("dev.terminal.status.waiting"),
      statusType: "purple",
    },
    [taskStatus.Connecting]: {
      statusText: $t("dev.terminal.status.connecting"),
      statusType: "warning",
    },
    [taskStatus.Executing]: {
      statusText: $t("dev.terminal.status.executing"),
      statusType: "warning",
    },
    [taskStatus.Success]: {
      statusText: $t("dev.terminal.status.success"),
      statusType: "success",
    },
    [taskStatus.Failed]: {
      statusText: $t("dev.terminal.status.failed"),
      statusType: "danger",
    },
    [taskStatus.Unknown]: {
      statusText: $t("dev.terminal.status.unknown"),
      statusType: "info",
    },
  };

  return (
    statusMap[status] || {
      statusText: $t("dev.terminal.status.unknown"),
      statusType: "info",
    }
  );
};

const addTerminalTask = (
  command: string,
  pm: boolean,
  blockOnFailure = true,
  extend = "",
  callback: Function = () => {}
) => {
  if (pm) {
    terminal.addTaskPM(command, blockOnFailure, extend, callback);
  } else {
    terminal.addTask(command, blockOnFailure, extend, callback);
  }

  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
};

const buildPackaging = async () => {
  await ElMessageBox.confirm(
    $t("dev.terminal.form.confirm.packaging_build"),
    $t("dev.terminal.form.confirm.title")
  );
  addTerminalTask("cmdr-build", true, true, "", null);
};

const changePackageManager = (val: string) => {
  state.packageManagerLoading = true;
  api
    .config({ manager: val })
    .then((res) => {
      if (res.code == 0) {
        terminal.changePackageManager(val);
      }
    })
    .finally(() => {
      state.packageManagerLoading = false;
    });
};

const changeRegistry = (val: string, type: SourceType) => {
  const oldVal =
    type == "npm" ? terminal.state.npmRegistry : terminal.state.composerRegistry;
  terminal.changeRegistry(val, type);
  state.registryLoading = true;
  state.registryLoadingType = type;
  terminal.addTask(`set-${type}-registry.${val}`, false, "", async (res: taskStatus) => {
    state.registryLoading = false;
    if (res == taskStatus.Failed || res == taskStatus.Unknown) {
      await ElMessageBox.confirm(
        $t("dev.terminal.form.confirm.source_command"),
        $t("dev.terminal.form.confirm.title")
      );
      terminal.changeRegistry(oldVal, type);
      const field = type == "npm" ? "npm_registry" : "composer_registry";
      formApi.setFieldValue(field, oldVal);
    }
  });
};

const isConfigVisible = computed(() => terminal.state.showConfig);

onMounted(() => {
  terminal.init();
});

const simpleImage = ElEmpty.PRESENTED_IMAGE_SIMPLE;

const title = computed(() => {
  return terminal.state.showConfig
    ? $t("dev.terminal.form.title")
    : $t("dev.terminal.title");
});
</script>

<template>
  <el-dialog
    :title="title"
    :visible.sync="modalApi.visible"
    width="700px"
    :before-close="modalApi.handleClose"
    :destroy-on-close="true"
    :modal-append-to-body="false"
    :draggable="true"
  >
    <div v-show="!terminal.state.showConfig">
      <!-- <el-alert title="演示环境已禁用命令执行" type="warning" closable /> -->
      <div
        ref="scrollContainer"
        class="scroll-content pt-5 pl-5 pr-5"
        :style="{ minHeight: '500px', overflowY: 'auto' }"
      >
        <el-timeline
          v-if="terminal.state.taskList.length"
          :reverse="false"
          :mode="'left'"
        >
          <el-timeline-item
            v-for="(item, idx) in terminal.state.taskList"
            :key="idx"
            :color="getTaskStatus(item.status).statusType"
            class="task-item"
            :class="'task-status-' + item.status"
          >
            <template #icon>
              <el-icon><clock-circle /></el-icon>
            </template>

            <h3 class="task-title">{{ item.date }}</h3>

            <el-card>
              <div class="task-header">
                <div class="header-left">
                  <el-tag :type="getTaskStatus(item.status).statusType">
                    {{ getTaskStatus(item.status).statusText }}
                  </el-tag>

                  <el-tag
                    class="block-on-failure-tag"
                    v-if="
                      (item.status == taskStatus.Failed ||
                        item.status == taskStatus.Unknown) &&
                      item.blockOnFailure
                    "
                    type="warning"
                  >
                    {{ $t("dev.terminal.block_on_failure") }}
                  </el-tag>

                  <el-tag
                    class="block-on-failure-tag"
                    v-if="
                      item.status == taskStatus.Executing ||
                      item.status == taskStatus.Connecting
                    "
                    type="danger"
                  >
                    {{ $t("dev.terminal.not_refresh_browser") }}
                  </el-tag>

                  <span class="command">{{ item.command }}</span>
                </div>

                <div class="header-right">
                  <el-button
                    :title="$t('dev.terminal.actions.retry')"
                    size="small"
                    circle
                    type="primary"
                    @click="terminal.retryTask(idx)"
                  >
                    <el-icon><reload /></el-icon>
                  </el-button>

                  <el-button
                    :title="$t('dev.terminal.actions.delete')"
                    size="small"
                    circle
                    type="danger"
                    @click="terminal.delTask(idx)"
                  >
                    <el-icon><delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <template v-if="item.status !== taskStatus.Waiting">
                <div
                  v-if="
                    item.status !== taskStatus.Connecting &&
                    item.status !== taskStatus.Executing
                  "
                  @click="terminal.setTaskShowMessage(idx)"
                  class="toggle-message-display"
                >
                  <span>{{ $t("dev.terminal.actions.command_run_log") }}</span>
                  <el-icon :class="{ 'arrow-up': item.showMessage }">
                    <el-icon-arrow-down />
                  </el-icon>
                </div>

                <div
                  v-if="
                    item.status === taskStatus.Connecting ||
                    item.status === taskStatus.Executing ||
                    (item.status > taskStatus.Executing && item.showMessage)
                  "
                  class="exec-message"
                  :class="'exec-message-' + item.uuid"
                >
                  <pre
                    v-for="(msg, index) in item.message"
                    :key="index"
                    class="message-item"
                    >{{ msg }}</pre
                  >
                </div>
              </template>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-empty
          v-else
          :description="$t('dev.terminal.empty')"
          class="empty-state"
          :image="simpleImage"
        />
      </div>
    </div>

    <div v-if="isConfigVisible">
      <Form />
    </div>

    <template #footer>
      <div v-show="!isConfigVisible">
        <el-space wrap>
          <el-button @click="addTerminalTask('test', true, false)">
            <el-icon><code /></el-icon>
            {{ $t("dev.terminal.actions.test") }}
          </el-button>

          <el-dropdown trigger="click" placement="bottom-start">
            <el-button>
              <el-icon><download /></el-icon>
              {{ $t("dev.terminal.actions.install.title") }}
              <el-icon><arrow-down /></el-icon>
            </el-button>
            <el-dropdown-menu>
              <el-dropdown-item
                @click.native.prevent="addTerminalTask('cmdr-install', true)"
              >
                {{ $t("dev.terminal.actions.install.pnpm_install") }}
              </el-dropdown-item>
              <el-dropdown-item
                @click.native.prevent="addTerminalTask('composer.update', false)"
              >
                {{ $t("dev.terminal.actions.install.composer_update") }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-button @click="buildPackaging()">
            <el-icon><tag /></el-icon>
            {{ $t("dev.terminal.actions.republish") }}
          </el-button>

          <el-button @click="terminal.clearSuccessTask()">
            <el-icon><delete /></el-icon>
            {{ $t("dev.terminal.actions.empty_task") }}
          </el-button>

          <el-button @click="terminal.toggleConfigDialog()">
            <el-icon><setting /></el-icon>
            {{ $t("dev.terminal.actions.setting") }}
          </el-button>
        </el-space>
      </div>

      <div v-show="isConfigVisible">
        <el-button @click="terminal.toggleConfigDialog()">
          <el-icon><rollback /></el-icon>
          {{ $t("dev.terminal.actions.return_terminal") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.toggle-message-display {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  color: #727277;
  gap: 4px;
}

.arrow-up {
  transform: rotate(180deg);
}

.block-on-failure-tag {
  margin-left: 8px;
}

.command {
  word-break: break-all;
}

.exec-message {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.message-item {
  margin: 0;
  white-space: pre-wrap;
  color: darkgray;
}

.warning-button {
  background-color: #fffbe6;
  border-color: #ffe58f;
  color: #d48806;
}

.warning-button:hover {
  background-color: #ffe58f;
  border-color: #ffd591;
  color: #ad6800;
}
</style>
