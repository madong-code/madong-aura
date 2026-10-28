<!-- 顶部栏 -->
<template>
  <div
    class="w-full bg-[var(--default-bg-color)]"
    :class="[
      tabStyle === 'tab-card' || tabStyle === 'tab-google' ? 'mb-5 max-sm:mb-3 !bg-box' : ''
    ]"
  >
    <div
      class="relative box-border flex-b h-15 leading-15 select-none"
      :class="[
        tabStyle === 'tab-card' || tabStyle === 'tab-google'
          ? 'border-b border-[var(--app-card-border)]'
          : ''
      ]"
    >
      <div class="flex-c flex-1 min-w-0 leading-15" style="display: flex">
        <!-- 系统信息  -->
        <div class="flex-c c-p" @click="toHome" v-if="isTopMenu">
          <AppLogo class="pl-4.5" />
          <p v-if="width >= 1400" class="my-0 mx-2 ml-2 text-lg">{{ preferences.app.name }}</p>
        </div>

        <AppLogo
          class="!hidden pl-3.5 overflow-hidden align-[-0.15em] fill-current"
          @click="toHome"
        />

        <!-- 菜单按钮 -->
        <AppIconButton
          v-if="isLeftMenu && shouldShowMenuButton"
          icon="ri:menu-2-fill"
          class="ml-3 max-sm:ml-[7px]"
          @click="visibleMenu"
        />

        <!-- 刷新按钮 -->
        <AppIconButton
          v-if="shouldShowRefreshButton"
          icon="ri:refresh-line"
          class="!ml-3 refresh-btn max-sm:!hidden"
          :style="{ marginLeft: !isLeftMenu ? '10px' : '0' }"
          @click="reload"
        />

        <!-- 快速入口 -->
        <AppFastEnter v-if="shouldShowFastEnter && width >= headerBarFastEnterMinWidth">
          <AppIconButton icon="ri:function-line" class="ml-3" />
        </AppFastEnter>

        <!-- 面包屑 -->
        <AppBreadcrumb
          v-if="(shouldShowBreadcrumb && isLeftMenu) || (shouldShowBreadcrumb && isDualMenu)"
        />

        <!-- 顶部菜单 -->
        <AppHorizontalMenu v-if="isTopMenu" :list="menuList" />

        <!-- 混合菜单-顶部 -->
        <AppMixedMenu v-if="isTopLeftMenu" :list="menuList" />
      </div>

      <div class="flex-c gap-2.5">
        <!-- 搜索 -->
        <div
          v-if="shouldShowGlobalSearch"
          class="flex-cb w-40 h-9 px-2.5 c-p border border-g-400 rounded-custom-sm max-md:!hidden"
          @click="openSearchDialog"
        >
          <div class="flex-c">
            <AppSvgIcon icon="ri:search-line" class="text-sm text-g-500" />
            <span class="ml-1 text-xs font-normal text-g-500">{{ $t('topBar.search.title') }}</span>
          </div>
          <div class="flex-c h-5 px-1.5 text-g-500/80 border border-g-400 rounded">
            <AppSvgIcon v-if="isWindows" icon="vaadin:ctrl-a" class="text-sm" />
            <AppSvgIcon v-else icon="ri:command-fill" class="text-xs" />
            <span class="ml-0.5 text-xs">k</span>
          </div>
        </div>

        <!-- 全屏按钮 -->
        <AppIconButton
          v-if="shouldShowFullscreen"
          :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'"
          :class="[!isFullscreen ? 'full-screen-btn' : 'exit-full-screen-btn', 'ml-3']"
          class="max-md:!hidden"
          @click="toggleFullScreen"
        />

        <!-- 国际化按钮 -->
        <ElDropdown
          @command="changeLanguage"
          popper-class="langDropDownStyle"
          v-if="shouldShowLanguage"
        >
          <AppIconButton icon="ri:translate-2" class="language-btn text-[19px]" />
          <template #dropdown>
            <ElDropdownMenu>
              <div v-for="item in languageOptions" :key="item.value" class="lang-btn-item">
                <ElDropdownItem
                  :command="item.value"
                  :class="{ 'is-selected': locale === item.value }"
                >
                  <span class="menu-txt">{{ item.label }}</span>
                  <AppSvgIcon icon="ri:check-fill" v-if="locale === item.value" />
                </ElDropdownItem>
              </div>
            </ElDropdownMenu>
          </template>
        </ElDropdown>

        <!-- 通知按钮（madong 消息中心抽屉，未读数实时红点） -->
        <AppIconButton
          v-if="shouldShowNotification"
          icon="ri:notification-2-line"
          class="notice-button relative"
          @click="openMessageDrawer"
        >
          <span
            v-if="notifyStore.unreadCount.total > 0"
            class="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-4 text-white"
          >
            {{ notifyStore.unreadCount.total > 99 ? '99+' : notifyStore.unreadCount.total }}
          </span>
        </AppIconButton>

        <!-- 记事本（草稿）抽屉 -->
        <AppIconButton
          v-if="shouldShowNotification"
          icon="ri:file-text-line"
          title="记事本"
          class="notepad-button"
          @click="openNotepadDrawer"
        />

        <!-- 命令终端（仅超级管理员可见，排在记事本之后） -->
        <AppIconButton
          v-if="showTerminalButton"
          icon="ri:terminal-box-line"
          title="命令终端"
          class="terminal-button"
          @click="openTerminalDialog"
        />

        <!-- 聊天按钮 -->
        <AppIconButton
          v-if="shouldShowChat"
          icon="ri:message-3-line"
          class="chat-button relative"
          @click="openChat"
        >
          <div class="breathing-dot absolute top-2 right-2 size-1.5 !bg-success rounded-full"></div>
        </AppIconButton>

        <!-- 设置按钮 -->
        <div v-if="shouldShowSettings">
          <ElPopover :visible="showSettingGuide" placement="bottom-start" :width="190" :offset="0">
            <template #reference>
              <div class="flex-cc">
                <AppIconButton icon="ri:settings-line" class="setting-btn" @click="openSetting" />
              </div>
            </template>
            <template #default>
              <p
                >{{ $t('topBar.guide.title')
                }}<span :style="{ color: systemThemeColor }"> {{ $t('topBar.guide.theme') }} </span
                >、 <span :style="{ color: systemThemeColor }"> {{ $t('topBar.guide.menu') }} </span
                >{{ $t('topBar.guide.description') }}
              </p>
            </template>
          </ElPopover>
        </div>

        <!-- 主题切换按钮 -->
        <AppIconButton
          v-if="shouldShowThemeToggle"
          @click="themeAnimation"
          :icon="isDark ? 'ri:sun-fill' : 'ri:moon-line'"
        />

        <!-- 用户头像、菜单 -->
        <AppUserMenu />
      </div>
    </div>

    <!-- 标签页 -->
    <AppWorkTab />

    <!-- madong 消息中心 / 记事本（草稿）抽屉 -->
    <MessageDrawer ref="messageDrawerRef" />
    <NotepadDrawer ref="notepadDrawerRef" />

    <!-- 命令终端弹窗（仅超级管理员挂载，避免无权限时仍发起 commands/config 请求） -->
    <TerminalDialog v-if="showTerminalButton" />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useFullscreen, useWindowSize } from '@vueuse/core'
  import { LanguageEnum, MenuTypeEnum } from '@/enums/appEnum'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useMenuStore } from '@/store/modules/menu'
  import { preferences } from '#/core/preferences'
  import { changeLocale, languageOptions } from '@/locales'
  import { mittBus } from '#/core/utils/event-bus'
  import { themeAnimation } from '#/core/utils/ui/animation'
  import { useCommon } from '#/core/composables/use-common'
  import { useHeaderBar } from '#/core/composables/use-header-bar'
  import { useNotifyStore } from '@/store/modules/notify'
  import { useUserStore as useCoreUserStore } from '#/core/stores'
  import { useTerminalStore } from '#/store'
  import MessageDrawer from '@/views/content/message/notify/components/message-drawer.vue'
  import NotepadDrawer from '@/views/content/notepad/components/notepad-drawer.vue'
  import TerminalDialog from '@/views/devtools/terminal/index.vue'
  import AppUserMenu from './widget/AppUserMenu.vue'

  defineOptions({ name: 'AppHeaderBar' })

  // 检测操作系统类型
  const isWindows = navigator.userAgent.includes('Windows')

  const router = useRouter()
  const { locale } = useI18n()
  const { width } = useWindowSize()

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 顶部栏功能配置
  const {
    shouldShowMenuButton,
    shouldShowRefreshButton,
    shouldShowFastEnter,
    shouldShowBreadcrumb,
    shouldShowGlobalSearch,
    shouldShowFullscreen,
    shouldShowNotification,
    shouldShowChat,
    shouldShowLanguage,
    shouldShowSettings,
    shouldShowThemeToggle,
    fastEnterMinWidth: headerBarFastEnterMinWidth
  } = useHeaderBar()

  const { menuOpen, systemThemeColor, showSettingGuide, menuType, isDark, tabStyle } =
    storeToRefs(settingStore)

  const { language } = storeToRefs(userStore)
  const { menuList } = storeToRefs(menuStore)

  // madong 消息中心 / 记事本（草稿）
  const notifyStore = useNotifyStore()
  const terminalStore = useTerminalStore()
  const messageDrawerRef = ref<InstanceType<typeof MessageDrawer> | null>(null)
  const notepadDrawerRef = ref<InstanceType<typeof NotepadDrawer> | null>(null)

  const openMessageDrawer = (): void => {
    messageDrawerRef.value?.open()
  }

  const openNotepadDrawer = (): void => {
    notepadDrawerRef.value?.open()
  }

  /**
   * 打开命令终端
   */
  const openTerminalDialog = (): void => {
    terminalStore.toggle(true)
  }

  /** 是否显示终端按钮：超级管理员（userInfo 存放在 core-user store） */
  const coreUserStore = useCoreUserStore()
  const showTerminalButton = computed(() => {
    const info = coreUserStore.userInfo as null | Record<string, any>
    return Number(info?.is_super) === 1
  })

  // 菜单类型判断
  const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT)
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)
  const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  onMounted(() => {
    initLanguage()
    // 建立消息推送（SSE）并拉取未读数；内部有 isInitialized 守卫
    notifyStore.initPush()
  })

  /**
   * 切换全屏状态
   */
  const toggleFullScreen = (): void => {
    toggleFullscreen()
  }

  /**
   * 切换菜单显示/隐藏状态
   */
  const visibleMenu = (): void => {
    settingStore.setMenuOpen(!menuOpen.value)
  }

  const { homePath } = useCommon()
  const { refresh } = useCommon()

  /**
   * 跳转到首页
   */
  const toHome = (): void => {
    router.push(homePath.value)
  }

  /**
   * 刷新页面
   * @param {number} time - 延迟时间，默认为0毫秒
   */
  const reload = (time: number = 0): void => {
    setTimeout(() => {
      refresh()
    }, time)
  }

  /**
   * 初始化语言设置
   */
  const initLanguage = (): void => {
    locale.value = language.value
  }

  /**
   * 切换系统语言
   * @param {LanguageEnum} lang - 目标语言类型
   */
  const changeLanguage = async (lang: LanguageEnum): Promise<void> => {
    if (locale.value === lang) return
    // 主动加载目标语言消息后再切短码 locale，避免文案回退成原始 key
    await changeLocale(lang)
    userStore.setLanguage(lang)
  }

  /**
   * 打开设置面板
   */
  const openSetting = (): void => {
    mittBus.emit('openSetting')

    // 隐藏设置引导提示
    if (showSettingGuide.value) {
      settingStore.hideSettingGuide()
    }
  }

  /**
   * 打开全局搜索对话框
   */
  const openSearchDialog = (): void => {
    mittBus.emit('openSearchDialog')
  }

  /**
   * 打开聊天窗口
   */
  const openChat = (): void => {
    mittBus.emit('openChat')
  }
</script>

<style lang="scss" scoped>
  /* Custom animations */
  @keyframes rotate180 {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(180deg);
    }
  }

  @keyframes shake {
    0% {
      transform: rotate(0);
    }

    25% {
      transform: rotate(-5deg);
    }

    50% {
      transform: rotate(5deg);
    }

    75% {
      transform: rotate(-5deg);
    }

    100% {
      transform: rotate(0);
    }
  }

  @keyframes expand {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.1);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes shrink {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(0.9);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes moveUp {
    0% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-3px);
    }

    100% {
      transform: translateY(0);
    }
  }

  @keyframes breathing {
    0% {
      opacity: 0.4;
      transform: scale(0.9);
    }

    50% {
      opacity: 1;
      transform: scale(1.1);
    }

    100% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }

  /* Hover animation classes */
  .refresh-btn:hover :deep(.app-svg-icon) {
    animation: rotate180 0.5s;
  }

  .language-btn:hover :deep(.app-svg-icon) {
    animation: moveUp 0.4s;
  }

  .setting-btn:hover :deep(.app-svg-icon) {
    animation: rotate180 0.5s;
  }

  .full-screen-btn:hover :deep(.app-svg-icon) {
    animation: expand 0.6s forwards;
  }

  .exit-full-screen-btn:hover :deep(.app-svg-icon) {
    animation: shrink 0.6s forwards;
  }

  .notice-button:hover :deep(.app-svg-icon) {
    animation: shake 0.5s ease-in-out;
  }

  .chat-button:hover :deep(.app-svg-icon) {
    animation: shake 0.5s ease-in-out;
  }

  .terminal-button:hover :deep(.app-svg-icon) {
    animation: moveUp 0.4s;
  }

  /* Breathing animation for chat dot */
  .breathing-dot {
    animation: breathing 1.5s ease-in-out infinite;
  }

  /* iPad breakpoint adjustments */
  @media screen and (width <= 768px) {
    .logo2 {
      display: block !important;
    }
  }

  @media screen and (width <= 640px) {
    .btn-box {
      width: 40px;
    }
  }
</style>
