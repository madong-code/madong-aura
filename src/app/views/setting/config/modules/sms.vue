<script lang="tsx" setup>
  import { ConfigService } from '@/app/api/setting/config'
  import { useForm } from '@/components/form'
  import { DictEnum } from '@/app/enums'
  import { $t } from '@/locales'
  import { convertStringNumbers } from '../schemas'

  const fieldLink = {
    access_key_id: $t('system.config.sms.access_key_id'),
    access_key_secret: $t('system.config.sms.access_key_secret'),
    enable: $t('system.config.sms.enable'),
    sign_name: $t('system.config.sms.sign_name')
  }

  const [BaseForm, formApi] = useForm({
    labelPosition: 'right',
    labelWidth: '130px',
    inline: false,
    schema: [
      {
        prop: 'access_key_id',
        label: $t('system.config.sms.access_key_id'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.config.sms.placeholder.access_key_id'),
          allowClear: true,
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('system.config.sms.placeholder.access_key_id')
          }
        ]
      },
      {
        prop: 'access_key_secret',
        label: $t('system.config.sms.access_key_secret'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.config.sms.placeholder.access_key_secret'),
          allowClear: true,
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('system.config.sms.placeholder.access_key_secret')
          }
        ]
      },
      {
        prop: 'enable',
        label: $t('system.config.sms.enable'),
        component: 'ApiDict',
        defaultValue: 1,
        componentProps: {
          renderType: 'RadioGroup',
          code: DictEnum.SYS_ENABLED_STATUS,
          isBtn: true
        },
        rules: [
          {
            required: true
          }
        ]
      },
      {
        prop: 'sign_name',
        label: $t('system.config.sms.sign_name'),
        component: 'Input',
        componentProps: {
          type: 'textarea',
          // style: { width: "50%" },
          rows: 7,
          placeholder: $t('system.config.sms.placeholder.sign_name'),
          allowClear: true
        }
      }
    ]
  })

  function onSubmit() {
    formApi.validate().then(async (e: any) => {
      const values = {
        group_code: 'setting',
        code: 'sms',
        name: '短信设置',
        content: await formApi.getValues()
      }
      ConfigService.update('sms', values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    })
  }

  /**
   * 获取表单数据
   */
  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('sms')) as any
    await formApi.setValues({ ...convertStringNumbers(record) })
  }

  onMounted(async () => {
    retrieveData()
  })
</script>

<template>
  <div content-class="flex flex-col gap-4">
    <BaseForm />
    <el-button class="site-sumbit" type="primary" @click="onSubmit">保存</el-button>
  </div>
</template>

<style lange="scss">
  .label-left {
    display: flex; /* 确保使用 flexbox */
    justify-content: flex-start; /* 靠左对齐 */
    width: 100px;
    text-align: left;
  }
</style>
