<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  ElButton,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElRow,
  ElSelect,
} from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { ProfileService } from '#/api/auth/profile';
import { Avatar } from '#/components/form';
import Icon from '#/components/icon/index.vue';
import { Page } from '#/components/page';
import { useUserStore } from '#/core/stores';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';

import { useCrudSchema } from './schemas';

defineOptions({ name: 'UserCenter' });

const userStore = useUserStore();

// 接口返回的个人资料（字段形态与后端一致：user_name / real_name / depts / roles ...）
// 登录态下的 store 由守卫映射成驼峰结构，仅作为兜底，避免刷新后展示缺字段
const profile = ref<Record<string, any>>({});

const userInfo = computed<Record<string, any>>(() => {
  const merged: Record<string, any> = {
    ...((userStore.userInfo as null | Record<string, any>) ?? {}),
  };
  // 接口为权威数据，但空值不覆盖 store 兜底值
  for (const [key, value] of Object.entries(profile.value)) {
    if (value !== null && value !== undefined) {
      merged[key] = value;
    }
  }
  return merged;
});

// 头像地址：优先取接口/最新上传结果，空值交由 Avatar 组件回落默认头像
const avatarUrl = computed<string>(() => (userInfo.value.avatar as string) || '');

// 格式化部门信息（兼容 [{ name }] 与 ['name'] 两种返回结构）
const formatDepts = (depts: any[] | undefined): string => {
  if (!depts || depts.length === 0) return '';
  return depts
    .map((dept) => (typeof dept === 'string' ? dept : dept?.name))
    .filter(Boolean)
    .join(', ');
};

// 角色可能为 ['admin'] 或 [{ id, name }]，统一取展示名
const getRoleName = (role: any): string =>
  typeof role === 'string' ? role : role?.name || '';

const getRoleKey = (role: any, index: number): number | string =>
  typeof role === 'string' ? `${role}-${index}` : role?.id ?? index;

// 头像上传成功回调
// 上传接口（PUT /auth/profile/avatar）已落库并返回相对路径，
// 此处仅同步本地状态，避免再走 PUT /auth/profile 触发整表单校验失败
const handleAvatarSuccess = (newAvatarUrl: string) => {
  if (!newAvatarUrl) return;
  profile.value = { ...profile.value, avatar: newAvatarUrl };
  // 同步到基本设置表单，防止后续保存资料时用旧值覆盖头像
  form.value.avatar = newAvatarUrl;

  const currentUser = userStore.userInfo;
  if (currentUser) {
    userStore.setUserInfo({
      ...(currentUser as any),
      avatar: newAvatarUrl,
    } as any);
  }

  ElMessage.success('头像更新成功');
};

// 基本设置表单相关
const isEdit = ref(false);
const profileFormRef = ref<FormInstance>();
const form = ref({
  real_name: '',
  nick_name: '',
  email: '',
  mobile_phone: '',
  signed: '',
  sex: 0,
  address: '',
  avatar: '',
});

const options = reactive([
  { value: 1, label: '男' },
  { value: 2, label: '女' },
  { value: 0, label: '未知' },
]);

const profileRules = reactive<FormRules>({
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  nick_name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['blur', 'change'],
    },
  ],
  mobile_phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
});

// 密码修改表单相关
const isEditPwd = ref(false);
const pwdFormRef = ref<FormInstance>();
const pwdForm = reactive({
  password: '',
  new_password: '',
  confirm_password: '',
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === pwdForm.new_password) {
    callback();
  } else {
    callback(new Error('两次输入的密码不一致'));
  }
};

const pwdRules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' },
    // {
    //   pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
    //   message: "密码需包含大小写字母和数字",
    //   trigger: "blur"
    // }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
});

// 加载用户信息
async function loadProfile() {
  try {
    const resp = (await ProfileService.getProfile()) as any;
    profile.value = resp ?? {};
    form.value = {
      real_name: resp.real_name || '',
      nick_name: resp.nick_name || '',
      email: resp.email || '',
      mobile_phone: resp.mobile_phone || '',
      signed: resp.signed || '',
      sex: resp.sex || 0,
      address: resp.address || '',
      avatar: resp.avatar || '',
    };
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.error('加载用户信息失败');
  }
}

// 基本设置表单处理
const handleProfileEdit = async () => {
  if (!isEdit.value) {
    isEdit.value = true;
    return;
  }

  try {
    // 表单验证
    await profileFormRef.value?.validate();

    // 确认提交
    await ElMessageBox.confirm('确定要保存个人信息吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 更新用户数据
    await ProfileService.updateProfile(form.value as any);

    // 重新拉取最新资料，保证卡片展示与后端一致
    const newUser = (await ProfileService.getProfile()) as any;
    profile.value = newUser ?? {};

    // store 中为守卫映射后的驼峰结构，只同步必要字段，避免破坏其他组件的读取约定
    const currentUser = userStore.userInfo;
    if (currentUser) {
      userStore.setUserInfo({
        ...(currentUser as any),
        avatar: newUser?.avatar || (currentUser as any).avatar || '',
        email: newUser?.email || (currentUser as any).email || '',
      } as any);
    }

    ElMessage.success('个人信息更新成功');
    isEdit.value = false;
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败:', error);
      ElMessage.error('保存失败，请稍后重试');
    }
  }
};

// 密码修改表单处理
const handlePwdEdit = async () => {
  if (!isEditPwd.value) {
    isEditPwd.value = true;
    return;
  }
  // 表单验证
  await pwdFormRef.value?.validate();
  // 确认提交
  await ElMessageBox.confirm('确定要修改密码吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });

  // 调用修改密码API
  const loading = ElLoading.service({
    lock: true,
    text: '正在修改密码...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    await ProfileService.updatePassword({
      old_password: pwdForm.password,
      new_password: pwdForm.new_password,
      confirm_password: pwdForm.confirm_password,
    });

    // 显示成功消息并开始倒计时
    let seconds = 5;
    let messageHandler: any = null;

    const updateMessage = () => {
      if (messageHandler) {
        messageHandler.close();
      }
      messageHandler = ElMessage.success({
        message: `密码修改成功，${seconds}秒后将自动跳转到登录页面`,
        duration: 0,
        showClose: true,
      });
    };

    updateMessage();

    // 倒计时定时器
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        if (messageHandler) {
          messageHandler.close();
        }
        // 强制重新登录
        const authStore = useAuthStore();
        authStore.logout();
      } else {
        updateMessage();
      }
    }, 1000);

    // 重置表单
    pwdForm.password = '';
    pwdForm.new_password = '';
    pwdForm.confirm_password = '';
    isEditPwd.value = false;
  } catch (error) {
    if (error !== 'cancel') {
      // noop
    }
  } finally {
    loading.close();
  }
};

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  // 左侧工具栏（在线设备列表无删除接口，仅支持下线）
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [
    {
      // 函数形式：切换语言时按钮文案才能跟随重渲染
      label: () =>
        $t(
          'system.user.center.online_device.table.columns.actions.force_offline.label',
        ),
      type: 'danger',
      sort: 1020,
      link: true,
      icon: 'ant-design:stop-outlined',
      // auth: "system:recycle_bin:recover",
      onClick: async (_e: Event, record: any) => {
        try {
          await ElMessageBox.confirm(
            $t(
              'system.user.center.online_device.table.columns.actions.force_offline.confirm',
              [record.browser || record.ip || ''],
            ),
            $t('common.tips'),
            {
              confirmButtonText: $t('common.confirm'),
              cancelButtonText: $t('common.cancel'),
              type: 'warning',
            },
          );
          await ProfileService.kickoutSession(record.jti);
          ElMessage.success('该设备已强制下线');
          // 下线完成后再刷新，避免请求时序导致列表仍是旧数据
          crudApi.reload();
        } catch (error) {
          if (error !== 'cancel') {
            ElMessage.error('强制下线失败，请稍后重试');
          }
        }
      },
    },
  ],
  // 工具栏：关闭缩放（全屏）按钮，字段名为 zoom
  toolbarConfig: {
    zoom: false,
  },
  // 操作列固定在右侧，避免内容区变窄时被横向滚动挤出视野
  tableActionColumn: {
    fixed: 'right',
    width: 110,
  },
  // 表格行操作-下拉菜单
  dropDownActions: [],
});

onMounted(() => {
  loadProfile();
});
</script>

<template>
  <Page>
    <div class="flex h-full gap-5 p-5 max-md:flex-col" v-if="userInfo">
      <!-- 左侧用户信息卡片 -->
      <div class="w-80 shrink-0 max-md:w-full">
        <div class="app-card-sm relative p-6 pb-6 overflow-hidden text-center">
          <div
            class="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600"
          ></div>
          <!-- 头像上传 -->
          <div class="relative z-10 mt-24 mx-auto">
            <Avatar
              :model-value="avatarUrl"
              shape="circle"
              class="border-2 border-white overflow-hidden shadow-lg"
              @success="handleAvatarSuccess"
            />
          </div>
          <h2 class="mt-4 text-lg font-semibold">
            {{ userInfo?.user_name || '' }}
          </h2>
          <p class="mt-2 text-sm text-gray-500">
            {{ userInfo?.signed || '专注于用户体验跟视觉设计' }}
          </p>

          <div class="w-full mx-auto mt-6 text-left space-y-3">
            <div class="flex items-center">
              <Icon icon="ri:mail-line" class="text-blue-500 w-5 h-5" />
              <span class="ml-2 text-sm text-gray-600">{{
                userInfo?.email || '未设置邮箱'
              }}</span>
            </div>
            <div class="flex items-center">
              <Icon icon="ri:phone-line" class="text-green-500 w-5 h-5" />
              <span class="ml-2 text-sm text-gray-600">{{
                userInfo?.mobile_phone || '未设置联系电话'
              }}</span>
            </div>
            <div class="flex items-center">
              <Icon icon="ri:building-2-line" class="text-purple-500 w-5 h-5" />
              <span class="ml-2 text-sm text-gray-600">{{
                formatDepts(userInfo?.depts) || '未分配部门'
              }}</span>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-700">角色标签</h3>
            <div class="flex flex-wrap justify-center mt-3 gap-2">
              <div
                v-for="(role, index) in userInfo?.roles || []"
                :key="getRoleKey(role, index)"
                class="py-1 px-3 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full"
              >
                {{ getRoleName(role) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="flex-1 min-w-0 overflow-auto">
        <!-- 基本设置 -->
        <div class="app-card-sm mb-5">
          <h1 class="p-4 text-lg font-semibold border-b border-gray-200 mb-4">
            {{ $t('system.user.center.base_setting.title') }}
          </h1>

          <ElForm
            :model="form"
            class="p-4"
            ref="profileFormRef"
            :rules="profileRules"
            label-width="100px"
            label-position="left"
          >
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem
                  :label="$t('system.user.form.modal.real_name')"
                  prop="real_name"
                >
                  <ElInput v-model="form.real_name" :disabled="!isEdit" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  :label="$t('system.user.form.modal.sex')"
                  prop="sex"
                >
                  <ElSelect
                    v-model="form.sex"
                    placeholder="请选择"
                    :disabled="!isEdit"
                  >
                    <ElOption
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem
                  :label="$t('system.user.form.modal.nick_name')"
                  prop="nick_name"
                >
                  <ElInput v-model="form.nick_name" :disabled="!isEdit" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem
                  :label="$t('system.user.form.modal.email')"
                  prop="email"
                >
                  <ElInput v-model="form.email" :disabled="!isEdit" />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem
                  :label="$t('system.user.form.modal.mobile_phone')"
                  prop="mobile_phone"
                >
                  <ElInput v-model="form.mobile_phone" :disabled="!isEdit" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="地址" prop="address">
                  <ElInput v-model="form.address" :disabled="!isEdit" />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElFormItem
              :label="$t('system.user.form.modal.signed')"
              prop="signed"
            >
              <ElInput
                type="textarea"
                :rows="4"
                v-model="form.signed"
                :disabled="!isEdit"
              />
            </ElFormItem>

            <ElFormItem>
              <ElButton type="primary" @click="handleProfileEdit">
                {{ isEdit ? $t('common.save') : $t('common.edit') }}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <!-- 安全设置 -->
        <div class="app-card-sm mb-5">
          <h1 class="p-4 text-lg font-semibold border-b border-gray-200 mb-4">
            {{ $t('system.user.center.secure_setting.title') }}
          </h1>

          <ElForm
            :model="pwdForm"
            class="p-4"
            ref="pwdFormRef"
            :rules="pwdRules"
            label-width="100px"
            label-position="left"
          >
            <ElFormItem
              :label="$t('system.user.center.secure_setting.old_password')"
              prop="password"
            >
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
                placeholder="请输入当前密码"
              />
            </ElFormItem>

            <ElFormItem
              :label="$t('system.user.center.secure_setting.new_password')"
              prop="new_password"
            >
              <ElInput
                v-model="pwdForm.new_password"
                type="password"
                :disabled="!isEditPwd"
                show-password
                placeholder="请输入新密码"
              />
            </ElFormItem>

            <ElFormItem
              :label="$t('system.user.center.secure_setting.confirm_password')"
              prop="confirm_password"
            >
              <ElInput
                v-model="pwdForm.confirm_password"
                type="password"
                :disabled="!isEditPwd"
                show-password
                placeholder="请再次输入新密码"
              />
            </ElFormItem>

            <ElFormItem>
              <ElButton type="primary" @click="handlePwdEdit">
                {{ isEditPwd ? $t('common.save') : $t('common.edit') }}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <!-- 在线设备 -->
        <div class="app-card-sm">
          <h1 class="p-4 text-lg font-semibold border-b border-gray-200 mb-4">
            {{ $t('system.user.center.online_device.table.title') }}
          </h1>
          <div class="p-4">
            <BasicCrud style="min-height: 300px" />
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>
