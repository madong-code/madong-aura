/**
 * 用户状态管理模块
 *
 * 提供用户相关的状态管理
 *
 * ## 主要功能
 *
 * - 用户登录状态管理
 * - 用户信息存储
 * - 访问令牌和刷新令牌管理
 * - 语言设置
 * - 搜索历史记录
 * - 锁屏状态和密码管理
 * - 登出清理逻辑
 *
 * ## 使用场景
 *
 * - 用户登录和认证
 * - 权限验证
 * - 个人信息展示
 * - 多语言切换
 * - 锁屏功能
 * - 搜索历史管理
 *
 * ## 持久化
 *
 * - 使用 localStorage 存储
 * - 存储键：user
 * - 登出时自动清理
 *
 * @module store/modules/user
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LanguageEnum } from '#/core/enums/appEnum'
import { router } from '#/router'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { AppRouteRecord } from '#/core/types/router'
import { setPageTitle } from '#/core/shared/art-utils/router'
import { resetRouterState } from '#/router/guards/beforeEach'
import { useMenuStore } from './menu'
import { StorageConfig } from '#/core/shared/art-utils/storage/storage-config'
import { useAccessStore } from '#/core/stores'
import { useAuthStore } from '#/store/auth'

/**
 * 用户状态管理
 * 管理用户登录状态、个人信息、语言设置、搜索历史、锁屏状态等
 *
 * 【art-admin 改造 · 鉴权融合】
 * 登录态（isLogin）与令牌（accessToken / refreshToken）**直接代理到 admin 的
 * accessStore**（`#/core/stores`）。原因：
 *   - 用户要求「用 admin 的鉴权 + art 的登录页 UI」，token 必须来自
 *     admin 的 `/system/auth/login`，由 admin accessStore 统一持有与持久化；
 *   - art 的路由守卫、上传组件 header、菜单获取都读 `userStore.isLogin /
 *     accessToken`，代理后无需改动这些消费方即可无缝工作。
 * 因此本 store 不再自己持有 token 的 ref，只保留 userInfo / 语言 / 锁屏 /
 * 搜索历史等 art 自身状态。
 */
export const useUserStore = defineStore(
  'userStore',
  () => {
    // 语言设置
    const language = ref(LanguageEnum.ZH)
    // 锁屏状态
    const isLock = ref(false)
    // 锁屏密码
    const lockPassword = ref('')
    // 用户信息
    const info = ref<Partial<Api.Auth.UserInfo>>({})
    // 搜索历史记录
    const searchHistory = ref<AppRouteRecord[]>([])

    // ---- 登录态 / 令牌：代理到 admin accessStore ----
    const accessStore = useAccessStore()
    const isLogin = computed(() => !!accessStore.accessToken)
    const accessToken = computed(() => accessStore.accessToken ?? '')
    const refreshToken = computed(() => accessStore.refreshToken ?? '')

    // 计算属性：获取用户信息（兼容别名：userInfo）
    const userInfo = computed(() => info.value)
    const getUserInfo = computed(() => info.value)
    // 计算属性：获取设置状态
    const getSettingState = computed(() => useSettingStore().$state)
    // 计算属性：获取工作台状态
    const getWorktabState = computed(() => useWorktabStore().$state)

    /**
     * 设置用户信息
     * @param newInfo 新的用户信息
     */
    const setUserInfo = (newInfo: Api.Auth.UserInfo) => {
      info.value = newInfo
    }

    /**
     * 设置登录状态（兼容实现）
     * 【art-admin 改造】登录态由 accessToken 派生（computed），无法直接写。
     * 保留空实现以兼容调用方；真正的登录态随 admin accessStore 的 token 变化。
     */
    const setLoginStatus = (status: boolean) => {
      void status
    }

    /**
     * 设置语言
     * @param lang 语言枚举值
     */
    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value)
      language.value = lang
    }

    /**
     * 设置搜索历史
     * @param list 搜索历史列表
     */
    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list
    }

    /**
     * 设置锁屏状态
     * @param status 锁屏状态
     */
    const setLockStatus = (status: boolean) => {
      isLock.value = status
    }

    /**
     * 设置锁屏密码
     * @param password 锁屏密码
     */
    const setLockPassword = (password: string) => {
      lockPassword.value = password
    }

    /**
     * 设置令牌（代理到 admin accessStore）
     * 【art-admin 改造】token 实际由 admin 的 `authLogin` 写入 accessStore，
     * 这里仅作为兼容入口；若外部仍调用 setToken，则写入 accessStore。
     */
    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessStore.setAccessToken(newAccessToken)
      if (newRefreshToken) {
        accessStore.setRefreshToken(newRefreshToken)
      }
    }

    /**
     * 退出登录
     * 委托 admin authStore.logout（会清 accessStore token、重置相关 store、
     * 跳回登录页），并清理 art 自身的用户信息 / 工作台等。
     */
    const logOut = () => {
      // 保存当前用户 ID，用于下次登录时判断是否为同一用户
      const currentUserId = info.value.userId
      if (currentUserId) {
        localStorage.setItem(StorageConfig.LAST_USER_ID_KEY, String(currentUserId))
      }

      // 清空用户信息
      info.value = {}
      // 重置锁屏状态
      isLock.value = false
      // 清空锁屏密码
      lockPassword.value = ''
      // 注意：不清空工作台标签页，等下次登录时根据用户判断
      // 移除iframe路由缓存
      sessionStorage.removeItem('iframeRoutes')
      // 清空主页路径
      useMenuStore().setHomePath('')
      // 重置路由状态
      resetRouterState(500)
      // 委托 admin 清 token + 跳登录页
      const authStore = useAuthStore()
      authStore.logout(false)
    }

    /**
     * 检查并清理工作台标签页
     * 如果不是同一用户登录，清空工作台标签页
     * 应在登录成功后调用
     */
    const checkAndClearWorktabs = () => {
      const lastUserId = localStorage.getItem(StorageConfig.LAST_USER_ID_KEY)
      const currentUserId = info.value.userId

      // 无法获取当前用户 ID，跳过检查
      if (!currentUserId) return

      // 首次登录或缓存已清除，保留现有标签页
      if (!lastUserId) {
        return
      }

      // 不同用户登录，清空工作台标签页
      if (String(currentUserId) !== lastUserId) {
        const worktabStore = useWorktabStore()
        worktabStore.opened = []
        worktabStore.keepAliveExclude = []
      }

      // 清除临时存储
      localStorage.removeItem(StorageConfig.LAST_USER_ID_KEY)
    }

    return {
      language,
      isLogin,
      isLock,
      lockPassword,
      info,
      userInfo,
      searchHistory,
      accessToken,
      refreshToken,
      getUserInfo,
      getSettingState,
      getWorktabState,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      logOut,
      checkAndClearWorktabs
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage
    }
  }
)
