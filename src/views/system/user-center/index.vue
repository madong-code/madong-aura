<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img
            class="absolute top-0 left-0 w-full h-50 object-cover"
            src="@imgs/user/bg.webp"
          />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            src="@imgs/user/avatar.webp"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo?.user_name || "" }}</h2>
          <p class="mt-5 text-sm">{{ userInfo.signed || "专注于用户体验跟视觉设计" }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.email || "未设置邮箱" }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:phone-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{
                userInfo.mobile_phone || "未设置联系电话"
              }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:building-2-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{
                userInfo?.depts?.name ?? "未分配部门"
              }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">标签</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in lableList"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">
            {{ $t("system.user.profile.base_setting.title") }}
          </h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="profileFormRef"
            :rules="profileRules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem
                :label="$t('system.user.form.modal.real_name')"
                prop="real_name"
              >
                <el-input v-model="form.real_name" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem
                :label="$t('system.user.form.modal.sex')"
                prop="sex"
                class="ml-5"
              >
                <ElSelect v-model="form.sex" placeholder="Select" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem
                :label="$t('system.user.form.modal.nick_name')"
                prop="nike_name"
              >
                <ElInput v-model="form.nike_name" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem
                :label="$t('system.user.form.modal.email')"
                prop="email"
                class="ml-5"
              >
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem
                :label="$t('system.user.form.modal.mobile_phone')"
                prop="mobile_phone"
              >
                <ElInput v-model="form.mobile_phone" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="地址" prop="address" class="ml-5">
                <ElInput v-model="form.address" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem
              :label="$t('system.user.form.modal.signed')"
              prop="signed"
              :style="{ height: '130px' }"
            >
              <ElInput
                type="textarea"
                :rows="4"
                v-model="form.signed"
                :disabled="!isEdit"
              />
            </ElFormItem>

            <div class="el-form-item-right">
              <ElButton
                type="primary"
                style="width: 90px"
                v-ripple
                @click="handleProfileEdit"
              >
                {{ isEdit ? $t("common.save") : $t("common.edit") }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="info box-style" style="margin-top: 20px">
          <h1 class="title">{{ $t("system.user.profile.secure_setting.title") }}</h1>

          <ElForm
            :model="pwdForm"
            class="form"
            ref="pwdFormRef"
            :rules="pwdRules"
            label-width="86px"
            label-position="top"
          >
            <ElFormItem
              :label="$t('system.user.profile.secure_setting.old_password')"
              prop="password"
            >
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem
              :label="$t('system.user.profile.secure_setting.new_password')"
              prop="new_password"
            >
              <ElInput
                v-model="pwdForm.new_password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem
              :label="$t('system.user.profile.secure_setting.confirm_password')"
              prop="confirm_password"
            >
              <ElInput
                v-model="pwdForm.confirm_password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="el-form-item-right">
              <ElButton
                type="primary"
                style="width: 90px"
                v-ripple
                @click="handlePwdEdit"
              >
                {{ isEditPwd ? $t("common.save") : $t("common.edit") }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="info box-style" style="margin-top: 20px; margin-bottom: 20px">
          <h1 class="title">{{ $t("system.user.profile.online_device.table.title") }}</h1>
          <BasicCrud style="min-height: 300px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { AuthService } from "@/api/system/auth";
import ProfileService from "@/api/system/profile";
import { UserService } from "@/api/system/user";
import { useCrud } from "@/components/crud";
import { $t } from "@/locales";
import { useUserStore } from "@/store/modules/user";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
import { crudSchema } from "./schemas";

defineOptions({ name: "UserCenter" });

const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);

// 基本设置表单相关
const isEdit = ref(false);
const profileFormRef = ref<FormInstance>();
const form = ref({
  real_name: "",
  nike_name: "",
  email: "",
  mobile_phone: "",
  signed: "",
  sex: 0,
  address: "",
});

  /**
   * 用户标签列表
   */
   const lableList: Array<string> = ['专注设计', '很有想法', '辣~', '大长腿', '川妹子', '海纳百川']

const options= reactive([
  {value:1,label:'男'},
  {value:2,label:'女'},
  {value:0,label:'未知'},
])

const profileRules = reactive<FormRules>({
  real_name: [
    { required: true, message: "请输入真实姓名", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  nike_name: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 30, message: "长度在 2 到 30 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] }
  ],
  mobile_phone: [
    { required: true, message: "请输入手机号码", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
  ],
  sex: [
    { required: true, message: "请选择性别", trigger: "change" }
  ]
});

// 密码修改表单相关
const isEditPwd = ref(false);
const pwdFormRef = ref<FormInstance>();
const pwdForm = reactive({
  password: "",
  new_password: "",
  confirm_password: ""
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== pwdForm.new_password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const pwdRules = reactive<FormRules>({
  password: [
    { required: true, message: "请输入当前密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在6到20个字符", trigger: "blur" }
  ],
  new_password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在6到20个字符", trigger: "blur" },
    // {
    //   pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
    //   message: "密码需包含大小写字母和数字",
    //   trigger: "blur"
    // }
  ],
  confirm_password: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" }
  ]
});

// 加载用户信息
async function loadProfile() {
  try {
    const resp = await AuthService.userInfo() as any;
    form.value = {
      real_name: resp.real_name || "",
      nike_name: resp.nike_name || "",
      email: resp.email || "",
      mobile_phone: resp.mobile_phone || "",
      signed: resp.signed || "",
      sex: resp.sex || 0,
      address: resp.address || "",
    };
  } catch (error) {
    console.error("加载用户信息失败:", error);
    ElMessage.error("加载用户信息失败");
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
    await ElMessageBox.confirm("确定要保存个人信息吗？", "确认操作", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    // 提交API
    const loading = ElMessage.info({
      message: "正在保存...",
      duration: 0
    });

    //更新用户数据
    await ProfileService.updateInfo(form.value as any);
    //获取新的用户数据
    const newUser = await UserService.getUserInfo() as any

    // 更新store中的用户信息
    const userStore = useUserStore()
    userStore.setUserInfo(newUser);

    ElMessage.success("个人信息更新成功");
    isEdit.value = false;
  } catch (error) {
    if (error !== "cancel") {
      console.error("保存失败:", error);
      ElMessage.error("保存失败，请稍后重试");
    }
  } finally {
    ElMessage.closeAll();
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
    await ElMessageBox.confirm("确定要修改密码吗？", "确认操作", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    // 调用修改密码API
    const loading = ElLoading.service({
      lock: true,
      text: "正在修改密码...",
      background: "rgba(0, 0, 0, 0.7)"
    });

  try {

    await ProfileService.updatePwd({
      old_password: pwdForm.password,
      new_password: pwdForm.new_password
    });



    // 显示成功消息并开始倒计时
    let seconds = 5;
    const message = ElMessage.success({
      message: `密码修改成功，${seconds}秒后将自动跳转到登录页面`,
      duration: 0,
      showClose: true
    });

    // 倒计时定时器
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        message.close();
        // 强制重新登录
        const userStore = useUserStore();
        userStore.logOut();
      } else {
        message.message = `密码修改成功，${seconds}秒后将自动跳转到登录页面`;
      }
    }, 1000);

    // 重置表单
    pwdForm.password = "";
    pwdForm.new_password = "";
    pwdForm.confirm_password = "";
    isEditPwd.value = false;

  } catch (error) {
    if (error !== "cancel") {
      console.log(error);
    }
  }finally{
    loading.close();
  }
};


const [BasicCrud, crudApi] = useCrud({
  ...crudSchema,
  // 左侧工具栏
  toolbarActions: [
    {
      label: $t("system.files.list.table.columns.actions.delete.label"),
      type: "danger",
      icon: "ant-design:delete-outlined",
      auth: "system:files:delete",
      ifShow: () => crudApi.getReadonlyState().selection.length > 0,
      confirm: {
        title: $t("system.files.list.table.columns.actions.delete.title"),
        content: $t("system.files.list.table.columns.actions.delete.confirm"),
        ok() {
          crudApi.removeByApi({});
        },
      },
    },
  ],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [
    {
      label: $t('system.user.profile.online_device.table.columns.actions.force_offline.label'),
      type: "danger",
      sort: 1020,
      link: true,
      icon: "ant-design:stop-outlined",
      auth: "system:recycle_bin:recover",
      onClick: (e: Event, record: any) => {
        ProfileService.kickoutByTokenValue(record.key)
        crudApi.refreshData()
      },
    }
  ],
  toolbarConfig:{
    fullscreen:false,
  },
  tableActionColumn:{
    fixed:false,
    width:120,
  },
  // 表格行操作-下拉菜单
  dropDownActions: [],
});


onMounted(() => {
  loadProfile();
});
</script>
