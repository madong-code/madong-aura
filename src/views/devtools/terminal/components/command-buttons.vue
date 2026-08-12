<script setup lang="ts">
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
} from 'element-plus';
import { Code, Code2, Download, Settings, Tags, Trash2 } from 'lucide-vue-next';

import { useTerminalStore } from '#/store';

defineOptions({ name: 'TerminalCommandButtons' });

const emit = defineEmits<{
  addTask: [command: string, pm: boolean, blockOnFailure?: boolean];
  clearSuccess: [];
  toggleConfig: [];
}>();

const icons: Record<string, any> = {
  'ant-design:code-outlined': Code,
  'ant-design:download-outlined': Download,
  'ant-design:tag-outlined': Tags,
  'ant-design:code-square-outlined': Code2,
};

const terminal = useTerminalStore();

function handleClick(
  cmd: undefined | { description?: string; key?: string; name: string },
  group?: { id?: string },
) {
  if (!cmd?.key) return;
  // test 分组和 install.server 不加包管理器后缀
  if (
    group?.id === 'test' ||
    (group?.id === 'install' && cmd.key === 'install.server')
  ) {
    emit('addTask', cmd.key, false, false);
  } else {
    emit('addTask', cmd.key, true, false);
  }
}
</script>

<template>
  <div class="terminal-buttons">
    <template v-for="group in terminal.commandGroups" :key="group.id">
      <ElButton
        v-if="group.commands.length === 1"
        class="terminal-menu-item"
        :icon="icons[group.icon]"
        @click="handleClick(group.commands[0], group)"
      >
        {{ group.name }}
      </ElButton>

      <ElDropdown v-else class="terminal-menu-item" trigger="click">
        <ElButton :icon="icons[group.icon]">
          {{ group.name }}
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="cmd in group.commands"
              :key="cmd.key"
              @click="handleClick(cmd, group)"
            >
              {{ cmd.name }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </template>

    <ElButton
      class="terminal-menu-item"
      :icon="Trash2"
      @click="emit('clearSuccess')"
    >
      {{ $t('devtools.terminal.actions.empty_task') }}
    </ElButton>

    <ElButton
      class="terminal-menu-item"
      :icon="Settings"
      @click="emit('toggleConfig')"
    >
      {{ $t('devtools.terminal.actions.setting') }}
    </ElButton>
  </div>
</template>

<style scoped>
.terminal-menu-item {
  margin-bottom: 12px;
}

.terminal-menu-item + .terminal-menu-item {
  margin-bottom: 12px;
  margin-left: 12px;
}

.terminal-buttons {
  display: block;
  width: fit-content;
  padding-top: 12px;
  margin: 0 auto;
}
</style>
