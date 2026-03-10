<script lang="tsx" setup>
  import { useForm } from '@/components/form'
  import { $t } from '@/locales'
  import { ConfigService } from '@/api/setting/config'

  const fieldLink = {
    Host: $t('setting.config.email.Host'),
    Port: $t('setting.config.email.Port'),
    Username: $t('setting.config.email.Username'),
    Password: $t('setting.config.email.Password'),
    SMTPSecure: $t('setting.config.email.SMTPSecure'),
    From: $t('setting.config.email.From'),
    FromName: $t('setting.config.email.FromName'),
    email: $t('setting.config.email.test')
  }

  const [BasicForm, formApi] = useForm({
    labelPosition: 'right',
    labelWidth: '130px',
    inline: false,
    schema: [
      {
        prop: 'Host',
        label: $t('setting.config.email.Host'),
        component: 'Input',
        componentProps: {
          placeholder: $t('setting.config.email.placeholder.Host'),
          allowClear: true,
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('setting.config.email.placeholder.Host')
          }
        ]
      },
      {
        prop: 'Port',
        label: $t('setting.config.email.Port'),
        component: 'Input',
        componentProps: {
          placeholder: $t('setting.config.email.placeholder.Port'),
          allowClear: true,
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('setting.config.email.placeholder.Port')
          }
        ]
      },
      {
        prop: 'Username',
        label: $t('setting.config.email.Username'),
        component: 'Input',
        componentProps: {
          placeholder: $t('setting.config.email.placeholder.Username'),
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('setting.config.email.placeholder.Username')
          }
        ]
      },
      {
        prop: 'Password',
        label: $t('setting.config.email.Password'),
        component: 'Input',
        componentProps: {
          placeholder: $t('setting.config.email.placeholder.Password'),
          style: { width: '40%' },
          allowClear: true
        },
        rules: [
          {
            required: true,
            message: $t('setting.config.email.placeholder.Password')
          }
        ]
      },
      {
        prop: 'SMTPSecure',
        label: $t('setting.config.email.SMTPSecure'),
        component: 'RadioGroup',
        defaultValue: 'ssl',
        componentProps: {
          options: [
            {
              label: 'ssl',
              value: 'ssl'
            },
            {
              label: 'tsl',
              value: 'tsl'
            }
          ]
        },
        rules: [
          {
            required: true
          }
        ]
      },

      {
        prop: 'From',
        label: $t('setting.config.email.From'),
        component: 'Input',
        componentProps: {
          placeholder: $t('setting.config.email.placeholder.From'),
          allowClear: true,
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('setting.config.email.placeholder.From')
          }
        ]
      },
      {
        prop: 'FromName',
        label: $t('setting.config.email.FromName'),
        component: 'Input',
        componentProps: {
          placeholder: $t('setting.config.email.placeholder.FromName'),
          allowClear: true,
          style: { width: '40%' }
        },
        rules: [
          {
            required: true,
            message: $t('setting.config.email.placeholder.FromName')
          }
        ]
      }
    ]
  })

  function onSubmit() {
    formApi.validate().then(async (e: any) => {
      const values = {
        group_code: 'setting',
        code: 'email',
        name: '邮箱设置',
        content: await formApi.getValues()
      }
      ConfigService.update('email', values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    })
  }

  /**
   * 获取表单数据
   */
  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('email')) as any
    await formApi.setValues({ ...record })
  }

  onMounted(async () => {
    retrieveData()
  })
</script>

<template>
  <div>
    <BasicForm />
    <el-button class="site-sumbit" type="primary" @click="onSubmit">保存</el-button>
  </div>
</template>
