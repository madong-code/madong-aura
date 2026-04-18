<template>
  <div class="key-value-editor">
    <div v-for="(item, index) in list" :key="index" class="key-value-row">
      <el-input
        v-model="item.key"
        placeholder="键"
        class="key-input"
        @change="handleChange"
      />
      <span class="separator">:</span>
      <el-input
        v-model="item.value"
        placeholder="值"
        class="value-input"
        @change="handleChange"
      />
      <el-button
        type="danger"
        link
        class="delete-btn"
        @click="removeRow(index)"
      >
        <Icon icon="ant-design:delete-outlined" />
      </el-button>
    </div>
    <el-button type="primary" link class="add-btn" @click="addRow">
      <Icon icon="ant-design:plus-outlined" />
      <span>添加</span>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@/components/icon'

interface KeyValueItem {
  key: string
  value: string
}

const props = defineProps<{
  value?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:value', value: Record<string, any>): void
}>()

// 将对象转换为列表
const objectToList = (obj: Record<string, any> | undefined): KeyValueItem[] => {
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value)
  }))
}

// 将列表转换为对象
const listToObject = (list: KeyValueItem[]): Record<string, any> => {
  const result: Record<string, any> = {}
  list.forEach(item => {
    if (item.key.trim()) {
      // 尝试解析为 JSON，失败则保持字符串
      try {
        result[item.key] = JSON.parse(item.value)
      } catch {
        result[item.key] = item.value
      }
    }
  })
  return result
}

const list = ref<KeyValueItem[]>([])

// 监听外部值变化
watch(() => props.value, (newVal) => {
  list.value = objectToList(newVal)
}, { deep: true, immediate: true })

const addRow = () => {
  list.value.push({ key: '', value: '' })
}

const removeRow = (index: number) => {
  list.value.splice(index, 1)
  handleChange()
}

const handleChange = () => {
  const result = listToObject(list.value)
  emit('update:value', result)
}

defineExpose({
  getValue() {
    return listToObject(list.value)
  }
})
</script>

<style scoped>
.key-value-editor {
  width: 100%;
}

.key-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.key-input {
  flex: 0 0 35%;
}

.separator {
  color: #909399;
  font-weight: bold;
}

.value-input {
  flex: 1;
}

.delete-btn {
  flex-shrink: 0;
  padding: 4px;
}

.add-btn {
  margin-top: 4px;
}
</style>
