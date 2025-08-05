<template>
  <ElDialog
    custom-class="m-dialog"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    v-model="dialogVisible"
    width="60%"
    :title="updateFlag ? '编辑用户' : '新增用户'"
    :fullscreen="fullscreen"
    :show-close="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="el-dialog__header-inner">
        <span :id="titleId" :class="titleClass">{{ updateFlag ? '编辑用户' : '新增用户' }}</span>
        <div class="dialog-header-actions">
          <ElButton class="dialog-header-btn" @click="toggleFullscreen" link>
            <template #icon>
              <Icon :icon="fullscreen ? '&#xe62d;' : '&#xe8ce;'" />
            </template>
          </ElButton>
          <ElButton class="dialog-header-btn" @click="close" link>
            <Icon icon="&#xe7dc;" />
          </ElButton>
        </div>
      </div>
    </template>
    <BasicForm :form-schema="formSchema" :model="formModel" @submit="handleSubmit">
      <template #realName="{ model }">
        <ElInput v-model="model.realName" placeholder="请输入姓名==" />
      </template>
    </BasicForm>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Icon } from '@/components/icon'
  import { BasicForm } from '@/components/form'
  import { formSchema } from './schemas'
  const dialogVisible = ref(false)
  const record = ref({})
  const updateFlag = ref(false)
  const fullscreen = ref(false)
  const formModel = reactive<any>({})

  const show = ({ data, isUpdate }: { data: any; isUpdate: boolean }) => {
    updateFlag.value = isUpdate === true
    record.value = data || {}
    dialogVisible.value = true
    fullscreen.value = false // 重置全屏状态
  }

  const toggleFullscreen = () => {
    fullscreen.value = !fullscreen.value
  }
  const handleSubmit = (values: any) => {
    console.log('表单对象:', values)
  }

  defineExpose({
    show
  })
</script>

<style lang="scss" scoped>
  .el-dialog__header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-header-actions {
    display: flex;
    align-items: center;
  }

  .dialog-header-btn {
    margin-left: 10px;
    padding: 0;
    width: 24px;
    height: 24px;

    :deep(.el-icon) {
      font-size: 16px;
    }
  }

  :deep(.el-dialog__header) {
    display: block !important;
  }
</style>
