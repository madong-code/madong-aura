<template>
  <div class="page-content user">
    <div class="content">
      <div class="left-wrap">
        <div class="user-wrap box-style">
          <img class="bg" src="@imgs/user/bg.webp" />
          <img class="avatar" src="@imgs/user/avatar.webp" />
          <h2 class="name">{{ userInfo?.user_name || "" }}</h2>
          <p class="des">{{ userInfo.signed }}</p>

          <div class="outer-info">
            <div>
              <i class="iconfont-sys">&#xe734;</i>
              <span>{{ userInfo.real_name || "" }}</span>
            </div>
            <div>
              <i class="iconfont-sys">&#xe70d;</i>
              <span>{{ userInfo.mobile_phone || "" }}</span>
            </div>
            <div>
              <i class="iconfont-sys">&#xe72e;</i>
              <span>{{ userInfo.email || "" }}</span>
            </div>
            <div>
              <i class="iconfont-sys">&#xe831;</i>
              <span>{{ userInfo?.depts?.name ?? "未分配部门" }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right-wrap">
        <div class="info box-style">
          <h1 class="title">{{ $t("system.user.profile.base_setting.title") }}</h1>

          <ElForm
            :model="form"
            class="form"
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
                class="right-input"
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
                class="right-input"
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
  sex: 0
});

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
      sex: resp.sex || 0
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

<style lang="scss">
.user {
  .icon {
    width: 1.4em;
    height: 1.4em;
    overflow: hidden;
    vertical-align: -0.15em;
    fill: currentcolor;
  }
}
</style>

<style lang="scss" scoped>
:deep(.art-table-card) {
  margin-top: 0px;
}
.page-content {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;

  $box-radius: calc(var(--custom-radius) + 4px);

  .box-style {
    border: 1px solid var(--art-border-color);
  }

  .content {
    position: relative;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    .left-wrap {
      width: 450px;
      margin-right: 25px;

      .user-wrap {
        position: relative;
        height: 600px;
        padding: 35px 40px;
        overflow: hidden;
        text-align: center;
        background: var(--art-main-bg-color);
        border-radius: $box-radius;

        .bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .avatar {
          position: relative;
          z-index: 10;
          width: 80px;
          height: 80px;
          margin-top: 120px;
          object-fit: cover;
          border: 2px solid #fff;
          border-radius: 50%;
        }

        .name {
          margin-top: 20px;
          font-size: 22px;
          font-weight: 400;
        }

        .des {
          margin-top: 20px;
          font-size: 14px;
        }

        .outer-info {
          width: 300px;
          margin: auto;
          margin-top: 30px;
          text-align: left;

          > div {
            margin-top: 10px;

            span {
              margin-left: 8px;
              font-size: 14px;
            }
          }
        }

        .lables {
          margin-top: 40px;

          h3 {
            font-size: 15px;
            font-weight: 500;
          }

          > div {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 15px;

            > div {
              padding: 3px 6px;
              margin: 0 10px 10px 0;
              font-size: 12px;
              background: var(--art-main-bg-color);
              border: 1px solid var(--art-border-color);
              border-radius: 2px;
            }
          }
        }
      }

      .gallery {
        margin-top: 25px;
        border-radius: 10px;

        .item {
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    .right-wrap {
      flex: 1;
      overflow: hidden;
      border-radius: $box-radius;

      .info {
        background: var(--art-main-bg-color);
        border-radius: $box-radius;

        .title {
          padding: 15px 25px;
          font-size: 20px;
          font-weight: 400;
          color: var(--art-text-gray-800);
          border-bottom: 1px solid var(--art-border-color);
        }

        .form {
          box-sizing: border-box;
          padding: 30px 25px;

          > .el-row {
            .el-form-item {
              width: calc(50% - 10px);
            }

            .el-input,
            .el-select {
              width: 100%;
            }
          }

          .right-input {
            margin-left: 20px;
          }

          .el-form-item-right {
            display: flex;
            align-items: center;
            justify-content: end;

            .el-button {
              width: 110px !important;
            }
          }
        }
      }
    }
  }
}

@media only screen and (max-width: $device-ipad-vertical) {
  .page-content {
    .content {
      display: block;
      margin-top: 5px;

      .left-wrap {
        width: 100%;
      }

      .right-wrap {
        width: 100%;
        margin-top: 15px;
      }
    }
  }
}
</style>
