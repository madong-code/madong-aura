<template>
  <Dialog class="w-[700px]">
    <Detail :message v-if="isRead" />
  </Dialog>
</template>
<script setup lang="tsx">
  import { useDialog } from '@/components/dialog'
  import { CrudMethods } from '@/components/crud'
  import Detail from './detail.vue'
  import type { MessageRow } from '@/app/api/network/message'
  import { MessageService } from '@/app/api/network/message'
  import { dayjs } from 'element-plus'

  const crudApi = ref<CrudMethods>()

  const emit = defineEmits<{ reload: [] }>()

  const record = ref<MessageRow>()
  const isRead = ref<Boolean>(false)

  interface EmailMessage {
    title: string
    content: string
    sender: string
    recipient: string
    date: string | dayjs.Dayjs
    salutation?: string
    signature?: string
  }

  const message = reactive<EmailMessage>({
    title: '', //标题
    content: '', //内容
    sender: '', //发送人
    recipient: '', //接收人
    date: '', //日期
    salutation: '', //招呼
    signature: '' //签名
  })

  const [Dialog, dialogApi] = useDialog({
    title: '',
    width: '60%',
    dialogType: 'drawer',
    footer: false,
    modal: true,
    closeOnClickModal: true,
    destroyOnClose: true
  })

  defineExpose({
    async show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
      record.value = data
      crudApi.value = getCrudApi()
      isRead.value = false
      if (record?.value?.id) {
        const data = await MessageService.get(record.value.id)
        message.title = data?.title || ''
        message.content = data?.content || ''
        message.sender = data?.sender?.real_name || 'Administrator'
        message.recipient = ''
        message.date = data.created_date || ''
        isRead.value = true
        //渲染成功后标记已读状态
        if (record.value.status !== 'read') {
          await MessageService.updateRead(record.value.id)
          emit('reload')
        }
      }

      dialogApi.setState({
        title: data?.title || '消息详情'
      })
      dialogApi.open()
    }
  })
</script>
<style lang="scss" scoped></style>
