import { computed, ref } from 'vue'

import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
//@ts-ignore
import { Push } from '@/utils/push/push-vue.js'
import { MessageService, type NotificationItem } from '@/app/api/setting/message'
import { useUserStore } from './user'

export const useNotifyStore = defineStore(
  'app-notify',
  () => {
    /**
     * return才会被持久化 存储全部消息
     */
    const notificationList = ref<NotificationItem[]>([])

    const userStore = useUserStore()
    const userId = computed(() => {
      return userStore.info?.id || '0'
    })

    const tenantId = computed(() => {
      //@ts-ignore
      return userStore.userInfo?.tenant?.tenant_id || '*'
    })

    const notifications = computed(() => {
      const currentUserId = String(userId.value)
      return notificationList.value.filter((item) => String(item.uid) === currentUserId)
    })

    /**
     * 是否已读
     * @param action
     * @returns
     */
    const isReadActionCaseInsensitive = function (action: any): boolean {
      return typeof action === 'string' && action.toLowerCase() === 'read'
    }

    /**
     * 将新消息添加到持久化
     * @param data
     * @param uid
     */
    const addUniqueNotification = function (data: any) {
      const currentUserId = String(userId.value)
      const exists = notificationList.value.some(
        (notification) =>
          String(notification.id) === String(data.id) &&
          String(notification.uid) === currentUserId &&
          String(notification.channel === String(data.channel))
      )
      if (!exists) {
        ElNotification.success({
          message: data.title || '新消息提醒',
          duration: 5,
          description: data.content || ''
        })
        notificationList.value.unshift({
          id: String(data.id),
          avatar: data?.sender?.avatar || '',
          date: data.created_date,
          isRead: isReadActionCaseInsensitive(data.status),
          message: data.content || '',
          title: data.title,
          related_id: data.related_id || '',
          uid: data.receiver_id,
          type: data?.type || '',
          channel: data.channel || 'notice'
        })
      }
    }

    /**
     * 开始监听消息
     */
    async function startListeningMessage() {
      /**
       * 未开启 不监听
       */
      const wssUrl = import.meta.env.VITE_GLOB_WSS_URL
      const appKey = import.meta.env.VITE_GLOB_WSS_APPKEY
      const sseEnable = import.meta.env.VITE_GLOB_ENABLE_WSS
      if (!sseEnable) {
        return
      }

      const connection = new Push({
        url: wssUrl, // websocket地址
        app_key: appKey,
        auth: '/plugin/webman/push/auth' // 订阅鉴权(仅限于私有频道)
      })

      // 公共订阅-弃用
      // const notices_channel = connection.subscribe('backend-'+'admin-' + tenantId.value+'-*');
      //公告订阅
      // notices_channel.on('notice', function (message: any) {
      //   if (Array.isArray(message)) {
      //     message.forEach((data: any) => {
      //       data['receiver_id'] = userId.value;//公告没有对应的接收人把本地登录的用户id追加到数据流
      //       addUniqueNotification(data);
      //     });
      //   } else {
      //     message['receiver_id'] = userId.value;//公告没有对应的接收人把本地登录的用户id追加到数据流
      //     addUniqueNotification(message);
      //   }
      // });

      /**
       *
       * 订阅后端消息通道（格式：backend-{模块}-{租户ID}-{用户ID}）
       *
       * 通道命名规则：
       * - backend      : 固定前缀，标识后端服务通道（与前端其他通道区分）
       * - admin         : 业务模块标识（此处为管理员模块，可替换为其他模块）
       * - tenantId.value   : 当前租户的唯一ID
       * - userId.value     : 当前用户的唯一ID
       * 示例最终通道名：backend-admin-1-1
       */
      const message_channel = connection.subscribe(
        'backend-' + 'admin-' + tenantId.value + '-' + userId.value
      )
      message_channel.on('message', function (data: any) {
        const message = data.messages || {}
        if (Array.isArray(message)) {
          message.forEach((data: any) => {
            //添加到列表
            addUniqueNotification(data)
          })
        } else {
          addUniqueNotification(message)
        }
      })
    }

    /**
     * 设置全部已读
     */
    async function setAllRead() {
      const currentUserId = String(userId.value)
      // 公共过滤函数
      const filterUserNotifications = (channel: string) =>
        notificationList.value.filter(
          (item) => String(item.uid) === currentUserId && item.channel === channel
        )
      try {
        // 处理消息（需要后端同步）
        const messages = filterUserNotifications('message')
        const unreadMessages = messages.filter((item) => !item.isRead)

        if (unreadMessages.length > 0) {
          // 循环处理每个未读消息
          for (const message of unreadMessages) {
            //@ts-ignore
            await MessageService.updateRead(message.id)
            message.isRead = true
          }
        }

        // 处理公告通知（无需后端同步）
        const notices = filterUserNotifications('notice')
        notices.forEach((item) => (item.isRead = true)) // 直接标记本地状态
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    }

    /**
     * 设置单条消息已读
     * @param item 通知
     */
    async function setRead(item: NotificationItem) {
      // 提前返回已读项，避免重复处理
      if (item.isRead) return

      try {
        // 公告通知本地标记
        if (item.channel === 'notice') {
          item.isRead = true
          return
        }

        // 消息类型同步标记后端
        await MessageService.updateRead(String(item.id))
        item.isRead = true
      } catch (error) {
        console.error(`标记消息[${item.id}]为已读失败:`, error)
      }
    }

    /**
     * 清空全部消息
     */
    function clearAllMessage() {
      const currentUserId = String(userId.value)
      notificationList.value = notificationList.value.filter(
        (item: any) => String(item.uid) !== currentUserId
      )
    }

    /**
     * 只需要空实现即可
     * 否则会在退出登录清空所有
     */
    function $reset() {
      notificationList.value = []
    }
    /**
     * 显示小圆点
     */
    const showDot = computed(() =>
      notificationList.value
        .filter((item: any) => item.uid === userId.value)
        .some((item: any) => !item.isRead)
    )

    return {
      $reset,
      clearAllMessage,
      notificationList,
      notifications,
      setAllRead,
      setRead,
      showDot,
      startListeningMessage
    }
  },
  {
    persist: {
      pick: ['notificationList']
    }
  }
)
