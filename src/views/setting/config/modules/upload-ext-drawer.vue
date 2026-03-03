<script lang="tsx" setup>
  import { ConfigService } from '@/api/setting/config'
  import { useDialog } from '@/components/dialog'
  import { useForm } from '@/components/form'
  import { $t } from '@/locales'

  const record = ref()

  const fieldLink = {
    root: '存储目录',
    secretId: 'secretId',
    accessKey: 'accessKey',
    accessKeyId: 'accessKeyId',
    secretKey: 'secretKey',
    key: 'key',
    accessKeySecret: 'accessKeySecret',
    secret: 'secret',
    bucket: '桶名称',
    dirname: '目录名称',
    domain: '域名地址',
    endpoint: 'Endpoint',
    region: '区域',
    acl: 'Acl',
    remark: '备注'
  }

  const [BasicForm, formApi] = useForm({
    labelPosition: 'right',
    labelWidth: '140px',
    schema: [
      {
        prop: 'mode',
        label: '',
        component: 'Input',
        ifShow: false
      },
      {
        prop: 'root',
        label: $t('setting.config.upload.extend.root'),
        component: 'RadioGroup',
        rules: [
          {
            required: true
          }
        ],
        componentProps: {
          placeholder: '',
          allowClear: true,
          options: [
            {
              label: '不公开（runtime目录）',
              value: 'runtime'
            },
            {
              label: '公开（public目录）',
              value: 'public'
            }
          ]
        },
        ifShow: (values: any) => {
          if (values) {
            return ['local'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'secretId',
        label: $t('setting.config.upload.extend.secretId'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['cos'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'accessKey',
        label: $t('setting.config.upload.extend.accessKey'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['qiniu'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'accessKeyId',
        label: $t('setting.config.upload.extend.accessKeyId'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['oss'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'secretKey',
        label: $t('setting.config.upload.extend.secretKey'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['cos', 'qiniu'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'key',
        label: $t('setting.config.upload.extend.key'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['s3'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'accessKeySecret',
        label: $t('setting.config.upload.extend.accessKeySecret'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['oss'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'secret',
        label: $t('setting.config.upload.extend.secret'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['s3'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'bucket',
        label: $t('setting.config.upload.extend.bucket'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['oss', 'cos', 'qiniu', 's3'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'dirname',
        label: $t('setting.config.upload.extend.dirname'),
        rules: [
          {
            required: true
          }
        ]
      },
      {
        component: 'Input',
        prop: 'domain',
        label: $t('setting.config.upload.extend.domain'),
        rules: [
          {
            required: true
          }
        ],
        ifShow: (values: any) => {
          if (values) {
            return ['local', 'oss', 'cos', 'qiniu', 's3'].includes(values.mode)
          }
          return false
        }
      },

      {
        component: 'Input',
        prop: 'endpoint',
        label: $t('setting.config.upload.extend.endpoint'),
        ifShow: (values: any) => {
          if (values) {
            return ['oss', 'qiniu', 's3'].includes(values.mode)
          }
          return false
        }
      },

      {
        component: 'Input',
        prop: 'region',
        label: $t('setting.config.upload.extend.region'),
        ifShow: (values: any) => {
          if (values) {
            return ['cos', 's3'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        prop: 'acl',
        label: $t('setting.config.upload.extend.acl'),
        ifShow: (values: any) => {
          if (values) {
            return ['s3'].includes(values.mode)
          }
          return false
        }
      },
      {
        component: 'Input',
        componentProps: {
          type: 'textarea',
          rows: 5
        },
        prop: 'remark',
        label: $t('setting.config.upload.extend.remark')
      }
    ]
  })

  const [Dialog, dialogApi] = useDialog({
    title: '更多设置',
    width: '50%',
    modal: true,
    dialogType: 'drawer',
    direction: 'rtl',
    closeOnClickModal: true,
    destroyOnClose: true,
    async onConfirm() {
      const storageMapping = {
        local: '本地存储配置',
        oss: 'OSS存储配置',
        cos: 'COS存储配置',
        qiniu: '七牛云存储配置',
        s3: 'S3存储配置'
      }

      const getStorageName = (key: string): string => {
        return storageMapping[key as keyof typeof storageMapping] || key
      }
      const values = {
        group_code: 'upload',
        code: record.value.mode,
        name: getStorageName(record.value.mode),
        content: await formApi.getValues()
      }
      ConfigService.update(record.value.mode, values).then(() => {
        ElMessage.success($t('common.operation_success'))
        retrieveData()
      })
    }
  })

  /**
   * 获取配置信息
   */
  const retrieveData = async function () {
    const response = (await ConfigService.getByCode(record.value.mode)) as any
    await formApi.setValues({ ...response, mode: record.value.mode })
  }

  defineExpose({
    show(args: any) {
      record.value = args
      dialogApi.setState({
        title: `更多设置`
      })
      dialogApi.open()
      nextTick(async () => {
        retrieveData()
      })
    }
  })
</script>
<template>
  <Dialog title="更多设置" class="w-[650px]">
    <BasicForm />
  </Dialog>
</template>
