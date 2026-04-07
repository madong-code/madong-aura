<template>
  <div>
    <BasicForm />
    <el-button class="baidu-tongji-sumbit" type="primary" @click="onSubmit">{{ $t('setting.config.baidu_tongji.button.submit') }}</el-button>
  </div>
</template>

<script setup lang="tsx">
  import { useForm } from '@/components/form'
  import { $t } from '@/locales'
  import { ElButton } from 'element-plus'
  import { convertStringNumbers } from '../schemas'
  import { ConfigService } from '@/api/setting/config'
  import { DictEnum } from '@/enums'

  const labelPosition = ref<'left' | 'right' | 'top'>('right')

  const schema = [
    {
      prop: 'baidu_tongji_enabled',
      label: $t('setting.config.baidu_tongji.baidu_tongji_enabled'),
      component: 'ApiDict',
      defaultValue: 0,
      componentProps: {
        renderType: 'RadioGroup',
        isBtn: true,
        code: DictEnum.SYS_ENABLED_STATUS
      }
    },
    {
      prop: 'baidu_tongji_code',
      label: $t('setting.config.baidu_tongji.baidu_tongji_code'),
      component: 'Input',
      componentProps: {
        placeholder: $t('setting.config.baidu_tongji.placeholder.baidu_tongji_code'),
        clearable: true,
        style: { width: '60%' }
      },
      rules: []
    }
  ]

  const [BasicForm, formApi] = useForm({
    labelPosition: labelPosition?.value,
    labelWidth: '120px',
    inline: false,
    schema: schema as any
  })

  async function onSubmit() {
    formApi.validate().then(async () => {
      const values = {
        group_code: 'system',
        code: 'baidu_tongji_setting',
        name: '百度统计设置',
        content: await formApi.getValues()
      }
      ConfigService.update('baidu_tongji_setting', values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    })
  }

  /**
   * 获取表单数据
   */
  const retrieveData = async () => {
    const record = (await ConfigService.getByCode('baidu_tongji_setting')) as any

    await formApi.setValues({ ...convertStringNumbers(record) })
  }

  onMounted(async () => {
    retrieveData()
  })
</script>

<style lang="scss">
  .baidu-tongji-sumbit {
    margin-left: 120px;
  }
</style>
