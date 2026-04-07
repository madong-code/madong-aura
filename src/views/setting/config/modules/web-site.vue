<template>
  <div>
    <BasicForm />
    <el-button class="web-site-sumbit" type="primary" @click="onSubmit">{{ $t('setting.config.web_site.button.submit') }}</el-button>
  </div>
</template>

<script setup lang="tsx">
  import { useForm } from '@/components/form'
  import { $t } from '@/locales'
  import { ElButton } from 'element-plus'
  import { convertStringNumbers } from '../schemas'
  import { ConfigService } from '@/api/setting/config'

  const labelPosition = ref<'left' | 'right' | 'top'>('right')

  const schema = [
    {
      prop: 'site_name',
      label: $t('setting.config.web_site.site_name'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.site_name'),
        clearable: true,
        style: { width: '40%' }
      },
      rules: []
    },
    {
      prop: 'site_url',
      label: $t('setting.config.web_site.site_url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.site_url'),
        clearable: true,
        style: { width: '40%' }
      },
      rules: []
    },
    {
      prop: 'logo',
      label: $t('setting.config.web_site.logo'),
      component: 'Avatar',
      componentProps: {}
    },
    {
      prop: 'seo_title',
      label: $t('setting.config.web_site.seo_title'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.seo_title'),
        clearable: true,
        style: { width: '60%' }
      },
      rules: []
    },
    {
      prop: 'seo_keywords',
      label: $t('setting.config.web_site.seo_keywords'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.seo_keywords'),
        clearable: true,
        style: { width: '60%' }
      },
      rules: []
    },
    {
      prop: 'seo_description',
      label: $t('setting.config.web_site.seo_description'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.seo_description'),
        clearable: true,
        style: { width: '60%' },
        type: 'textarea',
        rows: 4
      },
      rules: []
    },
    {
      prop: 'share_image',
      label: $t('setting.config.web_site.share_image'),
      component: 'Avatar',
      componentProps: {}
    },
    {
      prop: 'copyright',
      label: $t('setting.config.web_site.copyright'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.copyright'),
        clearable: true,
        style: { width: '60%' }
      },
      rules: []
    },
    {
      prop: 'icp',
      label: $t('setting.config.web_site.icp'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.icp'),
        clearable: true,
        style: { width: '40%' }
      },
      rules: []
    },
    {
      prop: 'icp_url',
      label: $t('setting.config.web_site.icp_url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.icp_url'),
        clearable: true,
        style: { width: '60%' }
      },
      rules: []
    },
    {
      prop: 'network_security',
      label: $t('setting.config.web_site.network_security'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.network_security'),
        clearable: true,
        style: { width: '40%' }
      },
      rules: []
    },
    {
      prop: 'network_security_url',
      label: $t('setting.config.web_site.network_security_url'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.web_site.placeholder.network_security_url'),
        clearable: true,
        style: { width: '60%' }
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
    formApi.validate().then(async () => {
      const values = {
        group_code: 'system',
        code: 'web_site_setting',
        name: '前台站点设置',
        content: await formApi.getValues()
      }
      ConfigService.update('web_site_setting', values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    })
  }

  /**
   * 获取表单数据
   */
  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('web_site_setting')) as any

    await formApi.setValues({ ...convertStringNumbers(record) })
  }

  onMounted(async () => {
    retrieveData()
  })
</script>

<style lang="scss">
  .web-site-sumbit {
    margin-left: 100px;
  }
</style>
