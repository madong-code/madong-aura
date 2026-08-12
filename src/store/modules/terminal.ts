import type { CommandGroup, Terminal } from '#/api/devtools/terminal/types';

import { computed, nextTick, reactive } from 'vue';

import { defineStore } from 'pinia';

import { TerminalService } from '#/api/devtools/terminal';
import { TerminalTaskStatus } from '#/enums';

let uuidCounter = 0;
function uuid() {
  uuidCounter += 1;
  return `task_${Date.now()}_${uuidCounter}`;
}
function timestampFormat() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

interface TerminalTask {
  uuid: string;
  date: string;
  status: number;
  command: string;
  displayCommand: string;
  message: string[];
  showMessage: boolean;
  blockOnFailure: boolean;
  extend: string;
  callback: (...args: any[]) => any;
}

export const useTerminalStore = defineStore(
  'terminal',
  () => {
    const state = reactive<Terminal>({
      show: false,
      showDot: false,
      taskList: [] as TerminalTask[],
      packageManager: 'pnpm',
      showPackageManagerDialog: false,
      showConfig: false,
      developmentServer: false,
      automaticCleanupTask: '0',
      npmRegistry: 'unknown',
      composerRegistry: 'unknown',
      commandGroups: [] as CommandGroup[],
    });

    function getTask(idx: number): TerminalTask | undefined {
      const raw = state.taskList[idx] as any;
      if (!raw) return undefined;
      if (!raw.displayCommand) {
        raw.displayCommand = raw.command.replace(
          /\.pnpm$|\.npm$|\.cnpm$|\.yarn$/,
          '',
        );
      }
      return raw as TerminalTask;
    }

    async function init() {
      for (const t of state.taskList) {
        if (
          t.status === TerminalTaskStatus.Connecting ||
          t.status === TerminalTaskStatus.Executing
        ) {
          t.status = TerminalTaskStatus.Unknown;
        }
      }
      loadCommands();
      await loadConfig();
    }

    async function loadConfig() {
      try {
        const cfg: any = await TerminalService.getConfig();
        if (cfg) {
          if (cfg.npm_package_manager) {
            state.packageManager = cfg.npm_package_manager;
          }
          if (cfg.npm_registry) {
            state.npmRegistry = cfg.npm_registry;
          }
          if (cfg.composer_registry) {
            state.composerRegistry = cfg.composer_registry;
          }
        }
      } catch (error) {
        console.error('加载终端配置失败:', error);
      }
    }

    async function loadCommands() {
      try {
        const commands = await TerminalService.getCommands();
        state.commandGroups = Array.isArray(commands) ? commands : [];
      } catch (error) {
        console.error('加载终端命令失败:', error);
      }
    }

    function toggle(val = !state.show) {
      state.show = val;
      if (val) {
        toggleDot(false);
      }
    }

    function toggleDot(val = !state.showDot) {
      state.showDot = val;
    }

    function toggleConfigDialog(val = !state.showConfig) {
      toggle(!val);
      state.showConfig = val;
    }

    function changeRegistry(val: string, type: 'composer' | 'npm') {
      state[type === 'npm' ? 'npmRegistry' : 'composerRegistry'] = val;
    }

    function changePackageManager(val: string) {
      state.packageManager = val;
    }

    async function saveConfig() {
      try {
        await TerminalService.updateConfig({
          npm_package_manager: state.packageManager,
        });
        return true;
      } catch (error) {
        console.error('保存终端配置失败:', error);
        return false;
      }
    }

    function changeAutomaticCleanupTask(val: '0' | '1') {
      state.automaticCleanupTask = val;
    }

    function setTaskStatus(idx: number, status: number) {
      const t = getTask(idx);
      if (!t) return;
      t.status = status;
      if (
        (status === TerminalTaskStatus.Failed ||
          status === TerminalTaskStatus.Unknown) &&
        t.blockOnFailure
      ) {
        setTaskShowMessage(idx, true);
      }
    }

    function taskCompleted(idx: number) {
      const t = getTask(idx);
      if (!t) return;
      const cb = t.callback;
      if (typeof cb !== 'function') return;
      const status = t.status;
      if (
        status === TerminalTaskStatus.Failed ||
        status === TerminalTaskStatus.Unknown
      ) {
        cb(TerminalTaskStatus.Failed);
      } else if (status === TerminalTaskStatus.Success) {
        cb(TerminalTaskStatus.Success);
      }
    }

    function setTaskShowMessage(idx: number, val = !getTask(idx)?.showMessage) {
      const t = getTask(idx);
      if (t) t.showMessage = val;
    }

    function addTaskMessage(idx: number, message: string) {
      if (!state.show) toggleDot(true);
      const t = getTask(idx);
      if (t) t.message = [...t.message, message];
      nextTick(() => {
        execMessageScrollbarKeep(t?.uuid ?? '');
      });
    }

    function addTask(
      command: string,
      blockOnFailure = true,
      extend = '',
      callback: (...args: any[]) => any = () => {},
    ) {
      if (!state.show) {
        toggleDot(true);
      }
      const displayCommand = command.replace(
        /\.pnpm$|\.npm$|\.cnpm$|\.yarn$/,
        '',
      );
      const task: any = {
        uuid: uuid(),
        date: timestampFormat(),
        status: TerminalTaskStatus.Waiting,
        command,
        displayCommand,
        message: [],
        showMessage: false,
        blockOnFailure,
        extend,
        callback,
      };
      state.taskList.push(task);

      if (Number.parseInt(state.automaticCleanupTask) === 1) {
        clearSuccessTask();
      }
      startTask();
    }

    function addTaskPM(
      command: string,
      blockOnFailure = true,
      extend = '',
      callback: (...args: any[]) => any = () => {},
    ) {
      addTask(
        `${command}.${state.packageManager}`,
        blockOnFailure,
        extend,
        callback,
      );
    }

    function delTask(idx: number) {
      const t = getTask(idx);
      if (
        t &&
        t.status !== TerminalTaskStatus.Connecting &&
        t.status !== TerminalTaskStatus.Executing
      ) {
        state.taskList.splice(idx, 1);
      }
      startTask();
    }

    /**
     * 通过UUID查找任务索引
     */
    function findTaskIdxFromUuid(uuid: string): false | number {
      for (const key in state.taskList) {
        const item = state.taskList[key];
        if (item && item.uuid === uuid) {
          return Number.parseInt(key);
        }
      }
      return false;
    }

    /**
     * 保持任务日志滚动条在底部
     */
    function execMessageScrollbarKeep(uuid: string) {
      const el = document.querySelector(`.exec-message-${uuid}`);
      if (el && (el as HTMLElement).scrollHeight) {
        (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
      }
    }

    function startTask() {
      let taskKey: null | number = null;
      const len = state.taskList.length;
      const list = state.taskList as any[];
      for (let keyIdx = 0; keyIdx < len; keyIdx++) {
        const s = list[keyIdx].status as number;
        if (s === TerminalTaskStatus.Waiting) {
          taskKey = keyIdx;
          break;
        }
        if (
          s === TerminalTaskStatus.Connecting ||
          s === TerminalTaskStatus.Executing
        ) {
          break;
        }
        if (s === TerminalTaskStatus.Success) continue;
        if (
          (s === TerminalTaskStatus.Failed ||
            s === TerminalTaskStatus.Unknown) &&
          list[keyIdx].blockOnFailure
        )
          break;
      }
      if (taskKey !== null) {
        setTaskStatus(taskKey, TerminalTaskStatus.Connecting);
        startEventSource(taskKey);
      }
    }

    function startEventSource(taskKey: number) {
      const task = getTask(taskKey);
      if (!task) return;

      const { command, uuid: taskUuid, extend } = task;

      const sseConnection: any = TerminalService.command(
        command,
        taskUuid,
        extend,
        {
          // 进度事件 - 处理所有执行过程中的消息
          progress: (payload: any) => {
            try {
              const taskIdx = findTaskIdxFromUuid(payload.uuid);
              if (taskIdx === false) {
                console.warn('Task not found for uuid:', payload.uuid);
                return;
              }

              // Sse::progress 返回: { status, message, progress, data }
              const sseData = payload.data || {};
              const innerData = sseData.data || {};
              const stage = innerData.stage || 'output';
              const message = sseData.message || '';

              // 根据阶段更新任务状态
              if (stage === 'connected') {
                setTaskStatus(taskIdx, TerminalTaskStatus.Executing);
              }

              // 添加消息到日志
              if (message) {
                addTaskMessage(taskIdx, `\n${message}`);
              }
            } catch (error) {
              console.error('Error processing progress:', error);
            }
          },

          // 完成事件 - 命令执行完成
          completed: (payload: any) => {
            try {
              const taskIdx = findTaskIdxFromUuid(payload.uuid);
              if (taskIdx === false) {
                console.warn('Task not found for uuid:', payload.uuid);
                sseConnection?.close();
                return;
              }

              // Sse::completed 返回: { status, message, data: { success, ... } }
              const sseData = payload.data || {};
              const innerData = sseData.data || {};
              const success = innerData.success === true;

              const message = sseData.message || '';
              if (message) {
                addTaskMessage(taskIdx, `\n${message}`);
              }

              setTaskStatus(
                taskIdx,
                success
                  ? TerminalTaskStatus.Success
                  : TerminalTaskStatus.Failed,
              );
              sseConnection?.close();
              taskCompleted(taskIdx);
              startTask();
            } catch (error) {
              console.error('Error processing completed:', error);
              sseConnection?.close();
            }
          },

          // 错误事件 - 服务器发送的错误
          error: (payload: any) => {
            try {
              const taskIdx = findTaskIdxFromUuid(payload.uuid);
              if (taskIdx === false) {
                console.warn('Task not found for uuid:', payload.uuid);
                sseConnection?.close();
                return;
              }

              const sseData = payload.data || {};
              const message = sseData.message || '执行出错';

              addTaskMessage(taskIdx, `\n${message}`);

              setTaskStatus(taskIdx, TerminalTaskStatus.Failed);
              sseConnection?.close();
              taskCompleted(taskIdx);
              startTask();
            } catch (error) {
              console.error('Error processing error event:', error);
              sseConnection?.close();
            }
          },

          // 连接错误 - EventSource 连接失败
          onError: () => {
            console.error('SSE connection error for command:', command);
            sseConnection?.close();
            const taskIdx = findTaskIdxFromUuid(taskUuid);
            const taskItem =
              taskIdx === false ? undefined : state.taskList[taskIdx];
            // 只有任务仍在执行中才标记失败（completed 后 close 触发的 error 忽略）
            if (
              taskItem &&
              (taskItem.status === TerminalTaskStatus.Connecting ||
                taskItem.status === TerminalTaskStatus.Executing ||
                taskItem.status === TerminalTaskStatus.Waiting)
            ) {
              setTaskStatus(taskIdx as number, TerminalTaskStatus.Failed);
              addTaskMessage(taskIdx as number, '\n连接错误，请重试');
              taskCompleted(taskIdx as number);
              startTask();
            }
          },

          // 连接打开
          open: () => {
            console.warn('SSE connection opened for command:', command);
          },
        },
      );
    }

    function retryTask(idx: number) {
      const t = getTask(idx);
      if (t) t.message = [];
      setTaskStatus(idx, TerminalTaskStatus.Waiting);
      startTask();
    }

    function clearSuccessTask() {
      state.taskList = state.taskList.filter(
        (item) => item.status !== TerminalTaskStatus.Success,
      );
    }

    function clearAllTasks() {
      state.taskList = [];
    }

    function $reset() {
      state.taskList = [];
    }

    return {
      $reset,
      state,
      commandGroups: computed(() => state.commandGroups),
      init,
      loadCommands,
      loadConfig,
      saveConfig,
      toggle,
      toggleDot,
      setTaskStatus,
      setTaskShowMessage,
      addTaskMessage,
      addTask,
      addTaskPM,
      delTask,
      startTask,
      retryTask,
      clearSuccessTask,
      clearAllTasks,
      changePackageManager,
      changeRegistry,
      changeAutomaticCleanupTask,
      toggleConfigDialog,
    };
  },
  {
    persist: {
      pick: [
        'state.showDot',
        'state.taskList',
        'state.automaticCleanupTask',
        'state.npmRegistry',
        'state.composerRegistry',
      ],
    },
  },
);
