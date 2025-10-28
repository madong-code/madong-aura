<template>
  <div>
    <ElDialog
      v-model="terminal.state.show"
      :title="$t('dev.terminal.title')"
      class="terminal-dialog"
      draggable
    >
      <ElScrollbar
        ref="terminalScrollbarRef"
        :max-height="400"
        class="terminal-scrollbar"
      >
        <ElAlert
          class="terminal-warning-alert"
          v-if="!terminal.state.developmentServer"
          :title="$t('演示环境已禁用命令执行')"
          type="error"
        />

        <ElTimeline class="terminal-timeline" v-if="terminal.state.taskList.length">
          <ElTimelineItem
            v-for="(item, idx) in terminal.state.taskList"
            :key="idx"
            class="task-item"
            :class="'task-status-' + item.status"
            :type="getTaskStatus(item.status)['statusType']"
            center
            :timestamp="item.date"
            placement="top"
          >
            <ElCard>
              <div>
                <el-tag :type="getTaskStatus(item.status)['statusType']">{{
                  getTaskStatus(item.status)["statusText"]
                }}</el-tag>
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
                <div class="task-opt">
                  <ElButton
                    :title="$t('Retry')"
                    v-if="
                      item.status == taskStatus.Failed ||
                      item.status == taskStatus.Unknown
                    "
                    size="small"
                    v-blur
                    type="warning"
                    :icon="RefreshRight"
                    circle
                    @click="terminal.retryTask(idx)"
                  />
                  <ElButton
                    @click="terminal.delTask(idx)"
                    :title="$t('Delete')"
                    size="small"
                    v-blur
                    type="danger"
                    :icon="Delete"
                    circle
                  />
                </div>
              </div>
              <template v-if="item.status != taskStatus.Waiting">
                <div
                  v-if="
                    item.status != taskStatus.Connecting &&
                    item.status != taskStatus.Executing
                  "
                  @click="terminal.setTaskShowMessage(idx)"
                  class="toggle-message-display"
                >
                  <span>{{ $t("dev.terminal.actions.command_run_log") }}</span>
                  <Icon
                    :icon="item.showMessage ? 'ep:arrow-up' : 'ep:arrow-down'"
                    size="16"
                    color="#909399"
                  />
                </div>
                <div
                  v-if="
                    item.status == taskStatus.Connecting ||
                    item.status == taskStatus.Executing ||
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
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
        <ElEmpty v-else :image-size="80" :description="$t('dev.terminal.empty')" />
      </ElScrollbar>

      <div class="terminal-buttons">
        <ElButton
          class="terminal-menu-item"
          v-blur
          @click="addTerminalTask('test', true, false)"
        >
          <template #icon>
            <Icon icon="ant-design:code-outlined" style="font-size: 18px" />
          </template>
          {{ $t("dev.terminal.actions.test") }}
        </ElButton>
        <ElDropdown class="terminal-menu-item">
          <ElButton v-blur>
            <template #icon>
              <Icon icon="ant-design:download-outlined" style="font-size: 20px" />
            </template>
            {{ $t("dev.terminal.actions.install.title") }}
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                @click="addTerminalTask('cmdr-install', true)"
                v-if="terminal.state.packageManager != 'none'"
              >
                {{ terminal.state.packageManager }} run install
              </ElDropdownItem>
              <ElDropdownItem @click="addTerminalTask('composer.update', false)"
                >composer update</ElDropdownItem
              >
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <ElButton class="terminal-menu-item" v-blur @click="buildPackaging()">
          <template #icon>
            <Icon icon="ant-design:tag-outlined" style="font-size: 20px" />
          </template>
          {{ $t("dev.terminal.actions.republish") }}</ElButton
        >
        <ElButton class="terminal-menu-item" v-blur @click="terminal.clearSuccessTask()">
          <template #icon>
            <Icon icon="ant-design:clear-outlined" style="font-size: 20px" />
          </template>
          {{ $t("dev.terminal.actions.empty_task") }}
        </ElButton>
        <ElButton
          class="terminal-menu-item"
          v-blur
          @click="terminal.toggleConfigDialog()"
        >
          <template #icon>
            <Icon icon="ant-design:setting-outlined" style="font-size: 20px" />
          </template>
          {{ $t("dev.terminal.actions.setting") }}
        </ElButton>
      </div>
    </ElDialog>

    <ElDialog
      @close="terminal.toggleConfigDialog(false)"
      :model-value="terminal.state.showConfig"
      class="terminal-dialog"
      :title="$t('dev.terminal.form.title')"
      draggable
    >
      <ConfigForm />
      <div class="config-buttons">
        <ElButton @click="terminal.toggleConfigDialog(false)">
          <template #icon>
            <Icon icon="ant-design:rollback-outlined" style="font-size: 20px" />
          </template>
          {{ $t("dev.terminal.actions.return_terminal") }}</ElButton
        >
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ElAlert, ElMessageBox, ElScrollbar } from "element-plus";
import { nextTick, onMounted, reactive, useTemplateRef } from "vue";
import { TerminalService } from "@/api/dev/terminal";
import { DictEnum, taskStatus } from "@/enums/index";
import { useTerminalStore } from "@/store/modules/terminal";
import { $t } from "@/locales";
import { RefreshRight, Delete } from "@element-plus/icons-vue";
import { useForm } from "../form";

type SourceType = "npm" | "composer";

const terminal = useTerminalStore();
const terminalScrollbarRef = useTemplateRef("terminalScrollbarRef");

const state = reactive({
  registryLoading: false,
  registryLoadingType: "npm",
  packageManagerLoading: false,
});

/**
 * 配置表单
 */
const [ConfigForm, formApi] = useForm({
  labelWidth: "120px",
  schema: [
    {
      component: "Select",
      prop: "npm_registry",
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
        onChange: (value: any) => {
          changeRegistry(value, "npm");
        },
      },
    },
    {
      component: "Select",
      prop: "composer_registry",
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
        onChange: (value: any) => {
          changeRegistry(value, "composer");
        },
      },
    },
    {
      component: "Select",
      prop: "package_manager",
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
        onChange: (value: any) => {
          changePackageManager(value);
        },
      },
    },
    {
      prop: "automatic_cleanup_task",
      label: $t("dev.terminal.form.automatic_cleanup_task"),
      component: "ApiDict",
      defaultValue: 1,
      componentProps: {
        renderType: "RadioGroup",
        code: DictEnum.SYS_YES_NO,
        isBtn: true,
        onChange: (value: any) => {
          //调用接口
          console.log(value);
        },
      },
    },
  ],
});

const getTaskStatus = (status: number) => {
  const statusMap: Record<number, { statusText: string; statusType: any }> = {
    [taskStatus.Waiting]: {
      statusText: $t("dev.terminal.status.waiting"),
      statusType: "info",
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
      statusType: "danger",
    },
  };

  return (
    statusMap[status] || {
      statusText: $t("dev.terminal.status.unknown"),
      statusType: "danger",
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

  // 任务列表滚动条滚动到底部
  nextTick(() => {
    if (terminalScrollbarRef.value && terminalScrollbarRef.value.wrapRef) {
      terminalScrollbarRef.value.setScrollTop(
        terminalScrollbarRef.value.wrapRef.scrollHeight
      );
    }
  });
};

/**
 * 重新发布
 */
const buildPackaging = () => {
  ElMessageBox.confirm(
    $t("dev.terminal.form.confirm.packaging_build"),
    $t("dev.terminal.form.confirm.title"),
    {
      type: "warning",
    }
  ).then(() => {
    addTerminalTask("cmdr-build", true, true, "");
  });
};

/**
 * 更改包管理
 * @param val
 */
const changePackageManager = (val: string) => {
  state.packageManagerLoading = true;
  TerminalService.config({ manager: val })
    .then((res: any) => {
      if (res.code == 0) {
        terminal.changePackageManager(val);
      }
    })
    .finally(() => {
      state.packageManagerLoading = false;
    });
};

/**
 * 更改源
 * @param val
 * @param type
 */
const changeRegistry = (val: string, type: SourceType) => {
  const field = type == "npm" ? "npm_registry" : "composer_registry";
  const oldVal =
    type == "npm" ? terminal.state.npmRegistry : terminal.state.composerRegistry;
  terminal.changeRegistry(val, type);
  state.registryLoading = true;
  state.registryLoadingType = type;
  terminal.addTask(`set-${type}-registry.${val}`, false, "", (res: taskStatus) => {
    state.registryLoading = false;
    if (res == taskStatus.Failed || res == taskStatus.Unknown) {
      ElMessageBox.confirm(
        $t("dev.terminal.form.confirm.source_command"),
        $t("dev.terminal.form.confirm.title"),
        {
          showCancelButton: false,
          type: "warning",
        }
      ).then(() => {
        terminal.changeRegistry(oldVal, type);
        const field = type == "npm" ? "npm_registry" : "composer_registry";
        formApi.setValues({ field: oldVal });
      });
    }
  });
};

onMounted(() => {
  terminal.init();
});

defineExpose({
  show() {
    terminal.state.show = true;
  },
});
</script>

<style scoped lang="scss">
:deep(.terminal-dialog) {
  --el-dialog-padding-primary: 15px 15px 0 15px;
  .el-dialog__body {
    margin-top: 15px;
  }
}
.terminal-warning-alert {
  margin: 0 0 20px 0;
}
.terminal-timeline {
  padding: 0 15px;
}
.command {
  font-size: var(--el-font-size-large);
  font-weight: bold;
  margin-left: 10px;
}
.exec-message {
  color: var(--ba-bg-color-overlay);
  font-size: 12px;
  line-height: 16px;
  padding: 6px;
  background-color: #424251;
  margin-top: 10px;
  min-height: 30px;
  max-height: 200px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c8c9cc;
    border-radius: 4px;
    box-shadow: none;
    -webkit-box-shadow: none;
  }
  &::-webkit-scrollbar-track {
    background: var(--ba-bg-color);
  }
  &:hover {
    &::-webkit-scrollbar-thumb:hover {
      background: #909399;
    }
  }
}
@supports not (selector(::-webkit-scrollbar)) {
  .exec-message {
    scrollbar-width: thin;
    scrollbar-color: #c8c9cc #eaeaea;
  }
}
.toggle-message-display {
  padding-top: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.task-opt {
  display: none;
  float: right;
}
.task-item.task-status-0:hover,
.task-item.task-status-3:hover,
.task-item.task-status-4:hover,
.task-item.task-status-5:hover {
  .task-opt {
    display: inline;
  }
}
.block-on-failure-tag {
  margin-left: 10px;
}
.terminal-menu-item {
  margin-bottom: 12px;
}
.terminal-menu-item + .terminal-menu-item {
  margin-left: 12px;
  margin-bottom: 12px;
}
.terminal-buttons {
  display: block;
  width: fit-content;
  margin: 0 auto;
  padding-top: 12px;
}
.config-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 20px;
  padding-right: 20px;
}
</style>
