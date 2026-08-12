<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="account">
              <ElSelect v-model="formData.account" @change="setupAccount">
                <ElOption
                  v-for="account in accounts"
                  :key="account.key"
                  :label="account.label"
                  :value="account.key"
                >
                  <span>{{ account.label }}</span>
                </ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem prop="username">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.username')"
                v-model.trim="formData.username"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <!-- 推拽验证 -->
            <div class="relative pb-5 mt-6">
              <div
                class="relative z-[2] overflow-hidden select-none rounded-lg border border-transparent tad-300"
                :class="{ '!border-[#FF4E4F]': !isPassing && isClickPass }"
              >
                <ArtDragVerify
                  ref="dragVerify"
                  v-model:value="isPassing"
                  :text="$t('login.sliderText')"
                  textColor="var(--art-gray-700)"
                  :successText="$t('login.sliderSuccessText')"
                  progressBarBg="var(--main-color)"
                  :background="isDark ? '#26272F' : '#F1F1F4'"
                  handlerBg="var(--default-box-color)"
                />
              </div>
              <p
                class="absolute top-0 z-[1] px-px mt-2 text-xs text-[#f56c6c] tad-300"
                :class="{ 'translate-y-10': !isPassing && isClickPass }"
              >
                {{ $t('login.placeholder.slider') }}
              </p>
            </div>

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">
                {{ $t('login.rememberPwd') }}
              </ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">
                {{ $t('login.forgetPwd') }}
              </RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>{{ $t('login.noAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">
                {{ $t('login.register') }}
              </RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '#/core/shared/art-utils/http/error'
  import { loginApi } from '#/api/auth/login'
  import { useUserStore } from '#/core/stores/modules/user'
  import { useSettingStore } from '#/core/stores/modules/setting'

  defineOptions({ name: 'Login' })

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)
  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  type AccountKey = 'super' | 'admin' | 'user'

  interface Account {
    key: AccountKey
    label: string
    userName: string
    password: string
    roles: string[]
  }

  const accounts = computed<Account[]>(() => [
    {
      key: 'super',
      label: t('login.roles.super'),
      userName: 'admin',
      password: '123456',
      roles: ['R_SUPER']
    },
    {
      key: 'admin',
      label: t('login.roles.admin'),
      userName: 'admin',
      password: '123456',
      roles: ['R_ADMIN']
    },
    {
      key: 'user',
      label: t('login.roles.user'),
      userName: 'user',
      password: '123456',
      roles: ['R_USER']
    }
  ])

  const dragVerify = ref()

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  const formRef = ref<FormInstance>()

  const formData = reactive({
    account: '' as AccountKey | '',
    username: '',
    password: '',
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
  }))

  const loading = ref(false)

  onMounted(() => {
    setupAccount('super')
  })

  // 设置账号
  const setupAccount = (key: AccountKey) => {
    const selectedAccount = accounts.value.find((account: Account) => account.key === key)
    formData.account = key
    formData.username = selectedAccount?.userName ?? ''
    formData.password = selectedAccount?.password ?? ''
  }

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      // 拖拽验证
      if (!isPassing.value) {
        isClickPass.value = true
        return
      }

      loading.value = true

      // 登录请求（art-admin 后端实际 key：请求 user_name，响应 access_token/refresh_token）
      const { username, password } = formData

      const { access_token, refresh_token } = await loginApi({
        user_name: username,
        password
      })

      // 验证token
      if (!access_token) {
        throw new Error('Login failed - no token received')
      }

      // 存储 token 和登录状态
      userStore.setToken(access_token, refresh_token)
      userStore.setLoginStatus(true)

      // 登录成功处理
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // 处理错误
      } else {
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
      resetDragVerify()
    }
  }

  // 重置拖拽验证
  const resetDragVerify = () => {
    dragVerify.value?.reset()
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}`
      })
    }, 1000)
  }
</script>

<style lang="scss" scoped>
  /* 授权页右侧区域 */
  .auth-right-wrap {
    position: absolute;
    inset: 0;
    width: 440px;
    height: 650px;
    padding: 5px;
    margin: auto;
    overflow: hidden;
    animation: slideInRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;

    @media only screen and (width <= 768px) {
      padding: 0 28px;
      width: 100%;
      animation: none;
    }

    .form {
      height: 100%;
      padding: 40px 0;
    }

    .title {
      font-size: 2rem;
      font-weight: 600;
      color: var(--art-gray-900, #1a1a1a);
      line-height: 1.2;

      @media only screen and (width <= 768px) {
        font-size: 1.5rem;
        padding-top: 40px;
      }
    }

    .sub-title {
      margin-top: 10px;
      font-size: 14px;
      color: var(--art-gray-600, #666);
    }

    .custom-height {
      height: 40px !important;
    }
  }

  /* 滑入动画 */
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* 移动端隐藏左侧大图，由 LoginLeftView 内部 media query 处理 */
  @media only screen and (width <= 1180px) {
    :deep(.login-left-view) {
      width: auto;
      height: auto;
      padding: 0;
      background: transparent;

      .left-img,
      .text-wrap,
      .geometric-decorations,
      .logo {
        display: none;
      }
    }

    .auth-right-wrap {
      animation: none;
    }
  }
</style>
