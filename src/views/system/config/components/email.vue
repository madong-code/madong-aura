<script setup lang="ts">
  import { onMounted } from 'vue'

  import { ElButton, ElMessage } from 'element-plus'

  import { useVbenForm } from '#/adapter/form'
  import { ConfigService } from '#/api/system/config'
  import { $t } from '#/locales'

  const [BasicForm, formApi] = useVbenForm({
    showDefaultActions: false,
    commonConfig: { labelWidth: 120 },
    wrapperClass: 'grid-cols-1 gap-x-6 gap-y-1 lg:grid-cols-2',
    schema: [
      {
        fieldName: 'Host',
        label: $t('system.config.email.host'),
        component: 'Input',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.email.placeholder.host')
        }
      },
      {
        fieldName: 'Port',
        label: $t('system.config.email.port'),
        component: 'Input',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.email.placeholder.port')
        }
      },
      {
        fieldName: 'Username',
        label: $t('system.config.email.username'),
        component: 'Input',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.email.placeholder.username')
        }
      },
      {
        fieldName: 'Password',
        label: $t('system.config.email.password'),
        component: 'Input',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.email.placeholder.password')
        }
      },
      {
        fieldName: 'SMTPSecure',
        label: $t('system.config.email.smtp_secure'),
        component: 'Select',
        defaultValue: 'ssl',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          options: [
            { label: 'ssl', value: 'ssl' },
            { label: 'tsl', value: 'tsl' }
          ]
        }
      },
      {
        fieldName: 'From',
        label: $t('system.config.email.from'),
        component: 'Input',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.email.placeholder.from')
        }
      },
      {
        fieldName: 'FromName',
        label: $t('system.config.email.from_name'),
        component: 'Input',
        rules: 'required',
        formItemClass: 'col-span-1 w-full lg:col-span-2 lg:w-1/2',
        componentProps: {
          placeholder: $t('system.config.email.placeholder.from_name')
        }
      }
    ]
  })

  async function onSubmit() {
    const { valid } = await formApi.validate()
    if (!valid) return
    const content = await formApi.getValues()
    await ConfigService.update('email', {
      group_code: 'default',
      code: 'email',
      name: $t('system.config.email.title'),
      content
    })
    ElMessage.success($t('system.config.save_success'))
    retrieveData()
  }

  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('email', {
      group_code: 'default'
    })) as any
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
    </div>
  </div>
</template>
