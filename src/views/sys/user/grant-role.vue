<template>
  <Dialog>
    <div style="padding: 20px">
      <pre>
        <code>{{ record }}</code>
      </pre>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import { useDialog } from '@/components/dialog'
  const record = ref({})
  const [Dialog, dialogApi] = useDialog({
    title: '授权角色',
    // dialogType: 'drawer',
    // direction: 'rtl', // 从右侧滑入
    width: '50%',
    onConfirm: () => {
      console.log('点击了确定')
      dialogApi.close()
    }
  })
  defineExpose({
    show({ data }: { data: any }) {
      record.value = data
      dialogApi.open()
    }
  })
</script>
