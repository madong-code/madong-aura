/**
 * useUserAvatar - 当前登录用户头像
 *
 * 统一头像的数据来源与展示地址：
 * 1. 优先取 core-user store（登录守卫与个人中心上传成功都会写入），业务 user store 兜底；
 * 2. 地址统一经 buildStaticUrl 解析，兼容同域相对路径、CDN 域名与私有空间签名直链；
 * 3. 空地址或加载失败回落内置默认头像，避免出现裂图。
 *
 * @module useUserAvatar
 * @author Mr.April
 */

import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import defaultAvatar from '@imgs/user/avatar.webp'
import { useUserStore as useCoreUserStore } from '#/core/stores'
import { useUserStore } from '@/store/modules/user'
import { buildStaticUrl } from '#/utils/url'

/**
 * 当前用户头像
 * @returns 头像展示地址、原始路径与加载失败处理
 */
export function useUserAvatar() {
  const coreUserStore = useCoreUserStore()
  const userStore = useUserStore()
  const { getUserInfo } = storeToRefs(userStore)

  // core-user store 由登录守卫/个人中心写入；业务 store 兼容仅由守卫写入的场景
  const rawAvatar = computed(() =>
    String(coreUserStore.userInfo?.avatar || getUserInfo.value?.avatar || '')
  )

  // 同域相对路径 → 站点相对地址；配置 CDN → 完整域名；私有空间 → 签名直链
  const resolvedAvatar = computed(() => buildStaticUrl(rawAvatar.value))

  // 头像文件可能已被清理（历史数据），加载失败时回落默认头像
  const loadFailed = ref(false)
  watch(resolvedAvatar, () => {
    loadFailed.value = false
  })

  const avatarSrc = computed(() =>
    loadFailed.value || !resolvedAvatar.value ? defaultAvatar : resolvedAvatar.value
  )

  /**
   * 头像加载失败处理
   */
  const handleAvatarError = (): void => {
    loadFailed.value = true
  }

  return { avatarSrc, rawAvatar, handleAvatarError }
}
