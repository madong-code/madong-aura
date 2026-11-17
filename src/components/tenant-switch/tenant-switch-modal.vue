<!-- 租户切换弹窗：仅多租户模式可用（accessStore.tenantId 非空） -->
<template>
  <ElDialog
    v-model="visible"
    :title="$t('tenant.switch.title')"
    width="500px"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="tenant-switch__current">
      {{ $t('tenant.switch.current') }}：
      <span class="font-semibold">{{ currentTenantName }}</span>
    </div>
    <div class="tenant-switch__tip">{{ $t('tenant.switch.select') }}</div>
    <ElSelect
      v-if="tenantOptions.length > 0"
      v-model="selectedTenantId"
      class="w-full"
      :placeholder="$t('tenant.switch.placeholder')"
      filterable
    >
      <ElOption
        v-for="item in tenantOptions"
        :key="String(item.id)"
        :label="item.name"
        :value="item.id"
      />
    </ElSelect>
    <div v-else class="tenant-switch__empty">{{ $t('tenant.switch.empty') }}</div>
    <template #footer>
      <ElButton @click="visible = false">{{ $t('tenant.switch.cancel') }}</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleConfirm">
        {{ $t('tenant.switch.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useAccessStore } from '#/core/stores'
  import { useAuthStore } from '@/store'
  import { computed, ref } from 'vue'
  import { getUserTenantListApi } from '@/api'

  defineOptions({ name: 'TenantSwitchModal' })

  const authStore = useAuthStore()
  const accessStore = useAccessStore()

  const visible = ref(false)
  const loading = ref(false)
  const selectedTenantId = ref<number | string>('')
  const tenantOptions = ref<{ id: number | string; name: string }[]>([])

  const currentTenantName = computed(() => {
    const info = authStore.tenantList.find(
      (t) => String(t.id) === String(accessStore.tenantId)
    )
    return info?.name ?? ''
  })

  async function open() {
    visible.value = true
    loading.value = true
    try {
      const list = await getUserTenantListApi()
      const currentId = accessStore.tenantId
      tenantOptions.value = (list ?? []).filter(
        (t) => String(t.id) !== String(currentId)
      )
      selectedTenantId.value = tenantOptions.value[0]?.id ?? ''
    } finally {
      loading.value = false
    }
  }

  async function handleConfirm() {
    if (!selectedTenantId.value) return
    loading.value = true
    try {
      await authStore.switchTenant(selectedTenantId.value)
      visible.value = false
    } finally {
      loading.value = false
    }
  }

  defineExpose({ open })
</script>

<style scoped>
  .tenant-switch__current {
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary-dark-2);
    font-size: 14px;
  }

  .tenant-switch__tip {
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .tenant-switch__empty {
    padding: 20px;
    text-align: center;
    color: var(--el-text-color-placeholder);
  }
</style>
