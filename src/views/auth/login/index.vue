<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t("login.title") }}</h3>
          <p class="sub-title">{{ $t("login.subTitle") }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <!-- <ElFormItem prop="account">
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
            </ElFormItem> -->
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

            <!-- 验证码 -->
            <ElFormItem prop="captcha">
              <div class="flex items-center gap-2" style="width: 100%;">
                <ElInput
                  class="custom-height"
                  :placeholder="$t('login.placeholder.captcha')"
                  v-model.trim="formData.captcha"
                  style="flex: 1; min-width: 0;"
                />
                <div class="relative" style="width: 120px; height: 40px; flex-shrink: 0;">
                  <img
                    :src="captchaUrl"
                    alt="验证码"
                    class="w-full h-full object-cover rounded-md cursor-pointer"
                    @click="refreshCaptcha"
                    style="cursor: pointer"
                  />
                </div>
              </div>
            </ElFormItem>

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t("login.rememberPwd")
              }}</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                $t("login.forgetPwd")
              }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t("login.btnText") }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>{{ $t("login.noAccount") }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                $t("login.register")
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppConfig from '@/config'
import { useUserStore } from '@/store/modules/user'
import { getCssVar } from '@/utils/ui'
import { useI18n } from 'vue-i18n'
import { HttpError } from '@/utils/http/error'
import { UserService } from '@/api/system/user'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { useSettingStore } from '@/store/modules/setting'
import JSEncrypt from 'jsencrypt'
import { AuthService } from '@/api/system/auth'
import { DictService } from '@/api/core/dict-api'
import { useDictStore } from '@/store/modules/dict'

const dictStore = useDictStore();


defineOptions({ name: 'Login' })
const fetchLogin = UserService
const settingStore = useSettingStore()
const { isDark } = storeToRefs(settingStore)
const { t, locale } = useI18n()
const formKey = ref(0)

// 监听语言切换，重置表单
watch(locale, () => {
  formKey.value++
})

type AccountKey = 'super' | 'admin' | 'user'

export interface Account {
  key: AccountKey
  label: string
  userName: string
  password: string
  roles: string[]
}



const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const captchaUrl = ref('')
const captchaUuid = ref('')

const systemName = AppConfig.systemInfo.name
const formRef = ref<FormInstance>()

const formData = reactive({
  account: '',
  username: '',
  password: '',
  captcha: '',
  rememberPassword: true
})

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
  captcha: [{ required: true, message: t('login.placeholder.captcha'), trigger: 'blur' }]
}))

const loading = ref(false)

onMounted(() => {
  refreshCaptcha()
})

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    const response = await AuthService.getCaptcha() as any;
    if (response?.base64) {
      // 将 base64 编码的图片数据转换为可显示的图片 URL
      captchaUrl.value = response.base64;
      // 存储验证码 uuid
      if (response.uuid) {
        captchaUuid.value = response.uuid;
      }
    }
  } catch (error) {
    console.error('获取验证码失败:', error);
    ElMessage.error('获取验证码失败，请稍后重试');
  }
}


// 登录
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;

    // 登录请求
    const { username, password } = formData;

    //获取公钥
    const { public_key, key_id } = (await AuthService.getPublicKey()) as any;

    if (!public_key) {
      throw new Error("Missing public key or key_id for encryption");
    }

    //密码加密
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);
    const encryptedPassword = encrypt.encrypt(password);
    if (!encryptedPassword) {
      throw new Error("RSA encryption failed");
    }

    const { access_token, refresh_token, expires_time } = (await AuthService.login({
      user_name: username,
      password: encryptedPassword,
      key_id,
      code: formData.captcha,
      uuid: captchaUuid.value
    })) as any;

    // 验证token
    if (!access_token) {
      throw new Error("Login failed - no token received");
    }

    // 存储token和用户信息，包含过期时间
    userStore.setToken(access_token, refresh_token, expires_time);
    userStore.setLoginStatus(true);
    // 这里可以一次性初始化所有字典
    dictStore.initAllDicts(DictService.getAllDict);

    // 登录成功处理
    showLoginSuccessNotice();
    router.push("/");
  } catch (error) {
    // 处理 HttpError
    if (error instanceof HttpError) {
      // console.log(error.code)
    } else {
      // 处理非 HttpError
      ElMessage.error("登录失败，请稍后重试");
      console.error("[Login] Unexpected error:", error);
    }
  } finally {
    loading.value = false;
    // 刷新验证码
    refreshCaptcha();
  }
};





// 登录成功提示
const showLoginSuccessNotice = () => {
  setTimeout(() => {
    ElNotification({
      title: t('login.success.title'),
      type: 'success',
      duration: 2500,
      zIndex: 10000,
      message: `${t('login.success.message')}, ${systemName}!`
    })
  }, 1000)
}
</script>

<style scoped>
@import "./style.css";
</style>

<style lang="scss" scoped>
:deep(.el-select__wrapper) {
  height: 40px !important;
}
</style>
