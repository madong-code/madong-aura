<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import { ElButton, ElMessage } from 'element-plus'

  import { useVbenForm } from '#/adapter/form'
  import { ConfigService } from '#/api/system/config'
  import { DictEnum } from '#/enums'
  import { $t } from '#/locales'

  import UploadSettingDrawer from './upload-ext-drawer.vue'

  const [BasicForm, formApi] = useVbenForm({
    showDefaultActions: false,
    commonConfig: { labelWidth: 120 },
    wrapperClass: 'grid-cols-1 gap-x-6 gap-y-1 lg:grid-cols-2',
    schema: [
      {
        fieldName: 'mode',
        label: $t('system.config.upload.mode'),
        component: 'ApiDict',
        defaultValue: 'local',
        formItemClass: 'col-span-1 lg:col-span-2',
        componentProps: {
          renderType: 'RadioGroup',
          code: DictEnum.SYS_CLOUD_STORAGE,
          isBtn: true
        }
      },
      {
        fieldName: 'single_limit',
        label: $t('system.config.upload.single_limit'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: { placeholder: '1024' }
      },
      {
        fieldName: 'total_limit',
        label: $t('system.config.upload.total_limit'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: { placeholder: '1024' }
      },
      {
        fieldName: 'nums',
        label: $t('system.config.upload.nums'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: { placeholder: '1' }
      },
      {
        fieldName: 'exclude',
        label: $t('system.config.upload.exclude'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {}
      }
    ]
  })

  const uploadSettingDrawerRef = ref()

  async function onSubmit() {
    const { valid } = await formApi.validate()
    if (!valid) return
    const content = await formApi.getValues()
    await ConfigService.update('upload', {
      group_code: 'default',
      code: 'upload',
      name: $t('system.config.upload.title'),
      content
    })
    ElMessage.success($t('system.config.save_success'))
    retrieveData()
  }

  async function handleSetting() {
    const values = await formApi.getValues()
    uploadSettingDrawerRef.value.show(values)
  }

  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('upload')) as any
    await formApi.setValues({ ...record })
  }

  onMounted(() => {
    retrieveData()
  })
</script>

<template>
  <div class="min-w-0">
    <BasicForm />
    <div class="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
      <ElButton type="primary" @click="onSubmit">
        {{ $t('system.config.save') }}
      </ElButton>
      <ElButton type="primary" @click="handleSetting">
        {{ $t('system.config.upload.more') }}
      </ElButton>
    </div>
    <UploadSettingDrawer ref="uploadSettingDrawerRef" />
  </div>
</template>
