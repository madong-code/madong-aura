<template>
  <div class="user-page art-full-height">
    <BasicCrud @toolbarToolClick="handleToolbarToolClick" />
    <OnlineUserDetail ref="onlineUserDetailRef" />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { getRelativeTime } from "@/utils/tool";
import { UserService } from "@/app/api/system/user";
import { ElTag } from "element-plus";
import OnlineUserDetail from "./online-user-detail.vue";
const dataSource = ref<any>([]);
const onlineUserDetailRef = ref();
const handlePage = (params: any) => {
  const { pageNum, pageSize, keywords } = params;

  // 1. 从dataSource获取所有数据
  let filteredData = [...dataSource.value];

  // 2. 如果有关键词，进行过滤（匹配id、userName或realName）
  if (keywords) {
    const keywordStr = keywords.toString().toLowerCase();
    filteredData = filteredData.filter(
      (item: any) =>
        item.id?.toString().toLowerCase().includes(keywordStr) ||
        item.userName?.toLowerCase().includes(keywordStr) ||
        item.realName?.toLowerCase().includes(keywordStr)
    );
  }

  // 3. 返回分页结果
  return Promise.resolve({
    recordCount: filteredData.length,
    totalPage: Math.ceil(filteredData.length / pageSize),
    rows: filteredData.slice((pageNum - 1) * pageSize, pageNum * pageSize),
  });
};
const [BasicCrud, crudApi] = useCrud({
  useCrud: false,
  api: (params: any) => {
    return handlePage(params);
  },
  immediate: false,
  toolbarConfig: {
    // 禁用表格右上角工具栏刷新按钮
    refresh: false,
    tools: [
      // 添加自定义按钮
      {
        auth: "refresh",
        icon: "&#xe614;",
      },
    ],
  },
  searchFormSchema: {
    labelWidth: "120px",
    schema: [
      {
        prop: "keywords",
        label: "关键字",
        component: "Input",
        componentProps: {
          placeholder: "请输入账户ID、用户名、姓名",
          allowClear: true,
        },
      },
    ],
  },
  columns: [
    {
      prop: "id",
      label: "账户ID",
      align: "left",
    },
    {
      prop: "user_name",
      label: "账户信息（用户名/姓名）",
      align: "left",
      formatter: (row: any) => {
        return `${row.userName}（${row.realName}）`;
      },
    },
    {
      prop: "login_time",
      label: "会话创建于",
      align: "center",
      formatter: (row: any) => {
        return h("div", { class: "text-center" }, [
          h("span", `${row.loginTime} - `),
          h(
            "span",
            {
              style: {
                color: "green",
              },
            },
            getRelativeTime(row.loginTime)
          ),
        ]);
      },
    },
    {
      prop: "expire_time",
      label: "会话失效于",
      align: "center",
      formatter: (row: any) => {
        return h("div", { class: "text-center" }, [
          h("span", `${row.expireTime} - `),
          h(
            "span",
            {
              style: {
                color: "green",
              },
            },
            getRelativeTime(row.expireTime)
          ),
        ]);
      },
    },
    {
      prop: "tokenList",
      label: "登录设备",
      align: "left",
      formatter: (row: any) => {
        return h(
          ElTag,
          {
            type: "primary",
            class: "cursor-pointer",
            onClick: () => handleDetail(row),
          },
          () => `${row.tokenList ? row.tokenList.length : 0}个客户端`
        );
      },
    },
  ],
  // hasAdd: true,
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [
    {
      label: "踢下线",
      type: "primary",
      link: true,
      confirm: {
        title: "提示",
        content: "确定踢下线吗？",
        ok: (row: any) => {
          handleDelete(row, "kickoutByLoginId");
        },
      },
      dynamicProps(row) {
        return {
          disabled: row.isCurrentUser || row.superAdmin,
        };
      },
      auth: "sys:user:kickoutByLoginId",
    },
    {
      label: "强制注销",
      type: "primary",
      link: true,
      confirm: {
        title: "提示",
        content: "确定强制注销吗？",
        ok: (row: any) => {
          handleDelete(row, "logoutByLoginId");
        },
      },
      dynamicProps(row) {
        return {
          disabled: row.isCurrentUser || row.superAdmin,
        };
      },
      auth: "sys:user:logoutByLoginId",
    },
  ],
  // 表格行操作-下拉菜单
  dropDownActions: [],
});
const requestData = () => {
  UserService.onlineUserList({}).then((res) => {
    dataSource.value = res;
    crudApi.reload();
  });
};
const handleDetail = (row: any) => {
  onlineUserDetailRef.value?.show({
    data: row,
    crudApi,
  });
};
const handleDelete = (record: any, type: string) => {
  const ids = [];
  if (record && record.id) {
    ids.push(record.id);
  }
  const api =
    type === "logoutByLoginId"
      ? UserService.logoutByLoginId
      : UserService.kickoutByLoginId;
  const msg = type === "logoutByLoginId" ? "强制注销成功" : "踢下线成功";
  api({
    ids,
  }).then(() => {
    ElMessage.success(msg);
    requestData();
  });
};
const handleToolbarToolClick = (code: string) => {
  if (code === "refresh") {
    requestData();
  }
};
onMounted(() => {
  requestData();
});
</script>
<style lang="scss" scoped>
.text-center {
  text-align: center;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
