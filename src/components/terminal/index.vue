<template>
  <div>
    <!-- 终端主对话框 -->
    <ElDialog
      v-model="terminal.state.show"
      :title="$t('dev.terminal.title')"
      class="terminal-dialog"
      draggable
    >
      <!-- 终端滚动区域 -->
      <ElScrollbar ref="terminalScrollbarRef" :max-height="400" class="terminal-scrollbar">
        <!-- 演示环境禁用警告 -->
        <ElAlert
          class="terminal-warning-alert"
          v-if="!terminal.state.developmentServer"
          :title="$t('演示环境已禁用命令执行')"
          type="error"
        />

        <!-- 终端任务时间线 -->
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
                <!-- 任务状态标签 -->
                <el-tag :type="getTaskStatus(item.status)['statusType']">{{
                  getTaskStatus(item.status)['statusText']
                }}</el-tag>
                <!-- 失败时阻止后续任务标签 -->
                <el-tag
                  class="block-on-failure-tag"
                  v-if="
                    (item.status == taskStatus.Failed || item.status == taskStatus.Unknown) &&
                    item.blockOnFailure
                  "
                  type="warning"
                >
                  {{ $t('dev.terminal.block_on_failure') }}
                </el-tag>
                <!-- 执行时请勿刷新浏览器标签 -->
                <el-tag
                  class="block-on-failure-tag"
                  v-if="item.status == taskStatus.Connecting || item.status == taskStatus.Executing"
                  type="danger"
                >
                  {{ $t('dev.terminal.not_refresh_browser') }}
                </el-tag>
                <!-- 命令文本 -->
                <span class="command">{{ item.command }}</span>
                <!-- 任务操作按钮 -->
                <div class="task-opt">
                  <!-- 重试按钮 -->
                  <ElButton
                    :title="$t('Retry')"
                    v-if="item.status == taskStatus.Failed || item.status == taskStatus.Unknown"
                    size="small"
                    v-blur
                    type="warning"
                    :icon="RefreshRight"
                    circle
                    @click="terminal.retryTask(idx)"
                  />
                  <!-- 删除按钮 -->
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
              <!-- 任务消息显示区域 -->
              <template v-if="item.status != taskStatus.Waiting">
                <!-- 消息展开/折叠切换 -->
                <div
                  v-if="item.status != taskStatus.Connecting && item.status != taskStatus.Executing"
                  @click="terminal.setTaskShowMessage(idx)"
                  class="toggle-message-display"
                >
                  <span>{{ $t('dev.terminal.actions.command_run_log') }}</span>
                  <Icon
                    :icon="item.showMessage ? 'ep:arrow-up' : 'ep:arrow-down'"
                    size="16"
                    color="#909399"
                  />
                </div>
                <!-- 消息内容显示 -->
                <div
                  v-if="
                    item.status == taskStatus.Connecting ||
                    item.status == taskStatus.Executing ||
                    (item.status > taskStatus.Executing && item.showMessage)
                  "
                  class="exec-message"
                  :class="'exec-message-' + item.uuid"
                >
                  <pre v-for="(msg, index) in item.message" :key="index" class="message-item">{{
                    msg
                  }}</pre>
                </div>
              </template>
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
        <!-- 空任务提示 -->
        <ElEmpty v-else :image-size="80" :description="$t('dev.terminal.empty')" />
      </ElScrollbar>

      <!-- 终端操作按钮组 -->
      <div class="terminal-buttons">
        <!-- 测试按钮 -->
        <ElButton class="terminal-menu-item" v-blur @click="addTerminalTask('test', true, false)">
          <template #icon>
            <Icon icon="ant-design:code-outlined" style="font-size: 18px" />
          </template>
          {{ $t('dev.terminal.actions.test') }}
        </ElButton>
        <!-- 安装依赖下拉菜单 -->
        <ElDropdown class="terminal-menu-item">
          <ElButton v-blur>
            <template #icon>
              <Icon icon="ant-design:download-outlined" style="font-size: 20px" />
            </template>
            {{ $t('dev.terminal.actions.install.title') }}
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <!-- 包管理器安装 -->
              <ElDropdownItem
                @click="addTerminalTask('cmdr-install', true)"
                v-if="terminal.state.packageManager != 'none'"
              >
                {{ terminal.state.packageManager }} run install
              </ElDropdownItem>
              <!-- Composer更新 -->
              <ElDropdownItem @click="addTerminalTask('composer.update', false)"
                >composer update</ElDropdownItem
              >
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <!-- 构建打包按钮 -->
        <ElButton class="terminal-menu-item" v-blur @click="buildPackaging()">
          <template #icon>
            <Icon icon="ant-design:tag-outlined" style="font-size: 20px" />
          </template>
          {{ $t('dev.terminal.actions.republish') }}</ElButton
        >
        <!-- 清空成功任务按钮 -->
        <ElButton class="terminal-menu-item" v-blur @click="terminal.clearSuccessTask()">
          <template #icon>
            <Icon icon="ant-design:clear-outlined" style="font-size: 20px" />
          </template>
          {{ $t('dev.terminal.actions.empty_task') }}
        </ElButton>
        <!-- 设置按钮 -->
        <ElButton class="terminal-menu-item" v-blur @click="terminal.toggleConfigDialog()">
          <template #icon>
            <Icon icon="ant-design:setting-outlined" style="font-size: 20px" />
          </template>
          {{ $t('dev.terminal.actions.setting') }}
        </ElButton>
      </div>
    </ElDialog>

    <!-- 配置对话框 -->
    <ElDialog
      @close="terminal.toggleConfigDialog(false)"
      :model-value="terminal.state.showConfig"
      class="terminal-dialog"
      :title="$t('dev.terminal.form.title')"
      draggable
    >
      <!-- 配置表单 -->
      <ConfigForm />
      <!-- 配置对话框操作按钮 -->
      <div class="config-buttons">
        <ElButton @click="terminal.toggleConfigDialog(false)">
          <template #icon>
            <Icon icon="ant-design:rollback-outlined" style="font-size: 20px" />
          </template>
          {{ $t('dev.terminal.actions.return_terminal') }}</ElButton
        >
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElAlert, ElMessageBox, ElScrollbar } from 'element-plus'
  import { nextTick, onMounted, reactive, useTemplateRef } from 'vue'
  import { TerminalService } from '@/app/api/tools/terminal'
  import { DictEnum, taskStatus } from '@/app/enums/index'
  import { useTerminalStore } from '@/store/modules/terminal'
  import { $t } from '@/locales'
  import { RefreshRight, Delete } from '@element-plus/icons-vue'
  import { useForm } from '../form'
  import { mittBus } from '@/utils'

  // 组件名称定义
  defineOptions({ name: 'terminal-command' })

  // 源类型定义
  type SourceType = 'npm' | 'composer'

  // 终端状态管理
  const terminal = useTerminalStore()
  // 终端滚动条引用
  const terminalScrollbarRef = useTemplateRef('terminalScrollbarRef')

  // 组件状态
  const state = reactive({
    registryLoading: false, // 源加载状态
    registryLoadingType: 'npm', // 源加载类型
    packageManagerLoading: false // 包管理器加载状态
  })

  /**
   * 配置表单
   */
  const [ConfigForm, formApi] = useForm({
    labelWidth: '120px',
    schema: [
      {
        component: 'Select',
        prop: 'npm_registry',
        defaultValue: 'npm',
        label: $t('dev.terminal.form.npm_registry'),
        componentProps: {
          placeholder: $t('dev.terminal.form.placeholder.npm_registry'),
          clearable: true,
          options: [
            { label: 'NPM', value: 'npm' },
            { label: 'Taobao', value: 'taobao' },
            { label: 'Tencent', value: 'tencent' },
            { label: '未知', value: 'unknown' }
          ],
          onChange: (value: any) => {
            changeRegistry(value, 'npm')
          }
        }
      },
      {
        component: 'Select',
        prop: 'composer_registry',
        defaultValue: 'composer',
        label: $t('dev.terminal.form.composer_registry'),
        componentProps: {
          placeholder: $t('dev.terminal.form.placeholder.composer_registry'),
          clearable: true,
          options: [
            { label: 'Composer', value: 'composer' },
            { label: 'Huawei', value: 'huawei' },
            { label: 'Aliyun', value: 'aliyun' },
            { label: 'Tencent', value: 'tencent' }
          ],
          onChange: (value: any) => {
            changeRegistry(value, 'composer')
          }
        }
      },
      {
        component: 'Select',
        prop: 'package_manager',
        label: $t('dev.terminal.form.package_manager'),
        defaultValue: 'pnpm',
        componentProps: {
          placeholder: $t('dev.terminal.form.placeholder.package_manager'),
          clearable: true,
          options: [
            { label: 'NPM', value: 'npm' },
            { label: 'PNPM', value: 'pnpm' },
            { label: 'YARN', value: 'yarn' }
          ],
          onChange: (value: any) => {
            changePackageManager(value)
          }
        }
      },
      {
        prop: 'automatic_cleanup_task',
        label: $t('dev.terminal.form.automatic_cleanup_task'),
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          renderType: 'RadioGroup',
          code: DictEnum.SYS_YES_NO,
          isBtn: true,
          onChange: (value: any) => {
            //调用接口
            console.log(value)
          }
        }
      }
    ]
  })

  /**
   * 获取任务状态文本和类型
   * @param status 任务状态代码
   * @returns 包含状态文本和类型的对象
   */
  const getTaskStatus = (status: number) => {
    const statusMap: Record<number, { statusText: string; statusType: any }> = {
      [taskStatus.Waiting]: {
        statusText: $t('dev.terminal.status.waiting'),
        statusType: 'info'
      },
      [taskStatus.Connecting]: {
        statusText: $t('dev.terminal.status.connecting'),
        statusType: 'warning'
      },
      [taskStatus.Executing]: {
        statusText: $t('dev.terminal.status.executing'),
        statusType: 'warning'
      },
      [taskStatus.Success]: {
        statusText: $t('dev.terminal.status.success'),
        statusType: 'success'
      },
      [taskStatus.Failed]: {
        statusText: $t('dev.terminal.status.failed'),
        statusType: 'danger'
      },
      [taskStatus.Unknown]: {
        statusText: $t('dev.terminal.status.unknown'),
        statusType: 'danger'
      }
    }

    return (
      statusMap[status] || {
        statusText: $t('dev.terminal.status.unknown'),
        statusType: 'danger'
      }
    )
  }

  /**
   * 添加终端任务
   * @param command 命令名称
   * @param pm 是否使用包管理器
   * @param blockOnFailure 失败时是否阻止后续任务
   * @param extend 扩展参数
   * @param callback 回调函数
   */
  const addTerminalTask = (
    command: string,
    pm: boolean,
    blockOnFailure = true,
    extend = '',
    callback: Function = () => {}
  ) => {
    if (pm) {
      terminal.addTaskPM(command, blockOnFailure, extend, callback)
    } else {
      terminal.addTask(command, blockOnFailure, extend, callback)
    }

    // 任务列表滚动条滚动到底部
    nextTick(() => {
      if (terminalScrollbarRef.value && terminalScrollbarRef.value.wrapRef) {
        terminalScrollbarRef.value.setScrollTop(terminalScrollbarRef.value.wrapRef.scrollHeight)
      }
    })
  }

  /**
   * 重新发布构建
   */
  const buildPackaging = () => {
    ElMessageBox.confirm(
      $t('dev.terminal.form.confirm.packaging_build'),
      $t('dev.terminal.form.confirm.title'),
      {
        type: 'warning'
      }
    ).then(() => {
      addTerminalTask('cmdr-build', true, true, '')
    })
  }

  /**
   * 更改包管理
   * @param val 包管理器名称
   */
  const changePackageManager = (val: string) => {
    state.packageManagerLoading = true
    TerminalService.config({ manager: val })
      .then((res: any) => {
        if (res.code == 0) {
          terminal.changePackageManager(val)
        }
      })
      .finally(() => {
        state.packageManagerLoading = false
      })
  }

  /**
   * 更改源
   * @param val 源名称
   * @param type 源类型
   */
  const changeRegistry = (val: string, type: SourceType) => {
    const field = type == 'npm' ? 'npm_registry' : 'composer_registry'
    const oldVal = type == 'npm' ? terminal.state.npmRegistry : terminal.state.composerRegistry
    terminal.changeRegistry(val, type)
    state.registryLoading = true
    state.registryLoadingType = type
    terminal.addTask(`set-${type}-registry.${val}`, false, '', (res: taskStatus) => {
      state.registryLoading = false
      if (res == taskStatus.Failed || res == taskStatus.Unknown) {
        ElMessageBox.confirm(
          $t('dev.terminal.form.confirm.source_command'),
          $t('dev.terminal.form.confirm.title'),
          {
            showCancelButton: false,
            type: 'warning'
          }
        ).then(() => {
          terminal.changeRegistry(oldVal, type)
          const field = type == 'npm' ? 'npm_registry' : 'composer_registry'
          formApi.setValues({ field: oldVal })
        })
      }
    })
  }

  /**
   * 打开终端
   */
  const openTerminal = (): void => {
    terminal.state.show = true
    console.log('打开终端')
  }

  /**
   * 关闭终端
   */
  const closeTerminal = (): void => {
    terminal.state.show = false
    console.log('关闭终端')
  }

  // 组件挂载时初始化
  onMounted(() => {
    terminal.init()
    // 注册打开终端事件监听
    mittBus.on('openTerminalCommand', openTerminal)
  })

  // 组件卸载时清理
  onUnmounted(() => {
    // 移除打开终端事件监听
    mittBus.off('openTerminalCommand', closeTerminal)
  })
</script>
<style scoped lang="scss">
  // 终端对话框样式
  :deep(.terminal-dialog) {
    --el-dialog-padding-primary: 15px 15px 0 15px;
    .el-dialog__body {
      margin-top: 15px;
    }
  }

  // 终端警告提示样式
  .terminal-warning-alert {
    margin: 0 0 20px 0;
  }

  // 终端时间线样式
  .terminal-timeline {
    padding: 0 15px;
  }

  // 命令文本样式
  .command {
    font-size: var(--el-font-size-large);
    font-weight: bold;
    margin-left: 10px;
  }

  // 执行消息显示区域样式
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

    // 滚动条样式（WebKit浏览器）
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

  // Firefox滚动条样式
  @supports not (selector(::-webkit-scrollbar)) {
    .exec-message {
      scrollbar-width: thin;
      scrollbar-color: #c8c9cc #eaeaea;
    }
  }

  // 消息展开/折叠切换样式
  .toggle-message-display {
    padding-top: 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  // 任务操作按钮样式
  .task-opt {
    display: none;
    float: right;
  }

  // 任务项悬停显示操作按钮
  .task-item.task-status-0:hover,
  .task-item.task-status-3:hover,
  .task-item.task-status-4:hover,
  .task-item.task-status-5:hover {
    .task-opt {
      display: inline;
    }
  }

  // 失败时阻止后续任务标签样式
  .block-on-failure-tag {
    margin-left: 10px;
  }

  // 终端菜单项样式
  .terminal-menu-item {
    margin-bottom: 12px;
  }

  // 终端菜单项间距
  .terminal-menu-item + .terminal-menu-item {
    margin-left: 12px;
    margin-bottom: 12px;
  }

  // 终端按钮组布局
  .terminal-buttons {
    display: block;
    width: fit-content;
    margin: 0 auto;
    padding-top: 12px;
  }

  // 配置按钮组布局
  .config-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 20px;
    padding-right: 20px;
  }
</style>
