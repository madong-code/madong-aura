<script setup lang="ts">
  import { onMounted } from 'vue'

  import { ElButton, ElMessage } from 'element-plus'

  import { useVbenForm } from '#/adapter/form'
  import { ConfigService } from '#/api/system/config'
  import { Page } from '#/components/page'
  import { $t } from '#/locales'

  const [BasicForm, formApi] = useVbenForm({
    showDefaultActions: false,
    commonConfig: { labelWidth: 120 },
    wrapperClass: 'grid-cols-1 gap-x-6 gap-y-1 lg:grid-cols-2',
    schema: [
      {
        fieldName: 'platform',
        label: $t('system.config.sms.platform'),
        component: 'Select',
        defaultValue: 'aliyun',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          options: [
            { label: $t('system.config.sms.platform_aliyun'), value: 'aliyun' },
            { label: $t('system.config.sms.platform_tencent'), value: 'tencent' }
          ]
        }
      },
      {
        fieldName: 'app_id',
        label: $t('system.config.sms.app_id'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.sms.placeholder.app_id')
        }
      },
      {
        fieldName: 'app_key',
        label: $t('system.config.sms.app_key'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.sms.placeholder.app_key')
        }
      },
      {
        fieldName: 'sign_name',
        label: $t('system.config.sms.sign_name'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.sms.placeholder.sign_name')
        }
      },
      {
        fieldName: 'template_code',
        label: $t('system.config.sms.template_code'),
        component: 'Input',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.sms.placeholder.template_code')
        }
      }
    ]
  })

  async function onSubmit() {
    const { valid } = await formApi.validate()
    if (!valid) return
    const content = await formApi.getValues()
    await ConfigService.update('sms', {
      group_code: 'default',
      code: 'sms',
      name: $t('system.config.sms.title'),
      content
    })
    ElMessage.success($t('system.config.save_success'))
    retrieveData()
  }

  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('sms', {
      group_code: 'default'
    })) as any
    await formApi.setValues({ ...record })
  }

  onMounted(() => {
    retrieveData()
  })
</script>

<template>
  <Page :title="$t('system.config.sms.title')" auto-content-height>
    <BasicForm />
    <div class="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
      <ElButton type="primary" @click="onSubmit">
        {{ $t('system.config.save') }}
      </ElButton>
    </div>
  </Page>
</template>
