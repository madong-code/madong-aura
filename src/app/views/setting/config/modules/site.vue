<template>
  <div>
    <BasicForm />
    <el-button class="site-sumbit" type="primary" @click="onSubmit">保存</el-button>
  </div>
</template>

<script setup lang="tsx">
  import { FormSchema, useForm } from '@/components/form'
  import { DictEnum } from '@/app/enums'
  import { $t } from '@/locales'
  import { ElButton } from 'element-plus'
  import { convertStringNumbers } from '../schemas'
  import { ConfigService } from '@/app/api/setting/config'
  import { request } from 'http'

  const labelPosition = ref<'left' | 'right' | 'top'>('right')
  const formData = ref({})

  const fieldLink = {
    site_open: '站点开启',
    site_url: '网站地址',
    site_name: '站点名称',
    site_logo: '站点Logo',
    site_network_security: '网备案号',
    site_description: '网站描述',
    site_record_no: '网站ICP',
    site_icp_url: 'ICP URL',
    site_network_security_url: '网安备案链接',
    site_keywords: '关键字'
  }

  const schema = [
    {
      prop: 'site_open',
      label: $t('system.config.site.open'),
      component: 'ApiDict',
      defaultValue: 1,
      componentProps: {
        renderType: 'RadioGroup',
        isBtn: true,
        code: DictEnum.SYS_ENABLED_STATUS
      }
    },
    {
      prop: 'site_url',
      label: $t('system.config.site.url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.url'),
        clearable: true,
        style: { width: '40%' }
      },
      rules: []
    },
    {
      prop: 'site_name',
      label: $t('system.config.site.name'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.name'),
        clearable: true,
        style: { width: '40%' }
      },

      rules: []
    },
    {
      prop: 'site_logo',
      label: $t('system.config.site.logo'),
      component: 'Avatar',
      componentProps: {}
    },
    {
      prop: 'site_network_security',
      label: $t('system.config.site.network_security'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.network_security'),
        clearable: true,
        style: { width: '40%' }
      }
    },
    {
      prop: 'site_keywords',
      label: $t('system.config.site.keywords'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.keywords'),
        clearable: true,
        style: { width: '40%' }
      },
      rules: [{ request: true, message: $t('system.config.site.placeholder.keywords') }]
    },

    {
      prop: 'site_record_no',
      label: $t('system.config.site.record_no'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.record_no'),
        clearable: true,
        style: { width: '40%' }
      }
    },
    {
      prop: 'site_icp_url',
      label: $t('system.config.site.icp_url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.icp_url'),
        clearable: true,
        style: { width: '40%' }
      }
    },
    {
      prop: 'site_network_security_url',
      label: $t('system.config.site.network_security_url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.network_security_url'),
        clearable: true,
        style: { width: '40%' }
      }
    },
    {
      prop: 'site_description',
      label: $t('system.config.site.description'),
      component: 'Input',
      componentProps: {
        placeholder: $t('system.config.site.placeholder.description'),
        clearable: true,
        style: { width: '40%' },
        type: 'textarea',
        rows: 4
      },
      rules: []
    }
  ]

  const [BasicForm, formApi] = useForm({
    labelPosition: labelPosition?.value,
    labelWidth: '100px',
    inline: false,
    schema: schema as any
  })

  async function onSubmit() {
    formApi.validate().then(async (e: any) => {
      const values = {
        group_code: 'system',
        code: 'site_setting',
        name: '站点设置',
        content: await formApi.getValues()
      }
      ConfigService.update('site_setting', values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    })
  }

  /**
   * 获取表单数据
   */
  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('site_setting')) as any

    await formApi.setValues({ ...convertStringNumbers(record) })
  }

  onMounted(async () => {
    retrieveData()
  })
</script>

<style lang="scss">
  .site-sumbit {
    margin-left: 100px;
  }
</style>
