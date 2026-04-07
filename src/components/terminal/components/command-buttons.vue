<template>
  <div class="terminal-buttons">
    <!-- 动态渲染命令分组 -->
    <template v-for="group in terminal.commandGroups" :key="group.id">
      <!-- 如果分组只有一个命令，直接显示按钮 -->
      <ElButton
        v-if="group.commands.length === 1"
        class="terminal-menu-item"
        v-blur
        @click="group.id === 'test' || (group.id === 'install' && group.commands[0].key === 'install.server') ? $emit('add-task', group.commands[0].key, false, false) : $emit('add-task', group.commands[0].key, true, false)"
      >
        <template #icon>
          <Icon :icon="group.icon" style="font-size: 18px" />
        </template>
        {{ group.name }}
      </ElButton>

      <!-- 如果分组有多个命令，显示下拉菜单 -->
      <ElDropdown v-else class="terminal-menu-item" :key="group.id">
        <ElButton v-blur>
          <template #icon>
            <Icon :icon="group.icon" style="font-size: 20px" />
          </template>
          {{ group.name }}
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="cmd in group.commands"
              :key="cmd.key"
              @click="group.id === 'test' || (group.id === 'install' && cmd.key === 'install.server') ? $emit('add-task', cmd.key, false, false) : $emit('add-task', cmd.key, true, false)"
            >
              {{ cmd.name }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </template>

    <!-- 清空成功任务按钮 -->
    <ElButton class="terminal-menu-item" v-blur @click="$emit('clear-success')">
      <template #icon>
        <Icon icon="ant-design:clear-outlined" style="font-size: 20px" />
      </template>
      {{ $t("tools.terminal.actions.empty_task") }}
    </ElButton>

    <!-- 设置按钮 -->
    <ElButton
      class="terminal-menu-item"
      v-blur
      @click="$emit('toggle-config')"
    >
      <template #icon>
        <Icon icon="ant-design:setting-outlined" style="font-size: 20px" />
      </template>
      {{ $t("tools.terminal.actions.setting") }}
    </ElButton>
  </div>
</template>

<script setup lang="ts">
import { useTerminalStore } from '@/store/modules/terminal';

defineOptions({ name: "CommandButtons" });

defineProps<{
  packageManager: string;
}>();

defineEmits<{
  "add-task": [command: string, pm: boolean, blockOnFailure?: boolean];
  build: [platform: string];
  "clear-success": [];
  "toggle-config": [];
}>();

const terminal = useTerminalStore();
</script>

<style scoped lang="scss">
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
</style>
