<template>
  <Dialog>
    <div style="padding: 20px">
      <p>{{ $t("system.menu.api.tips.1") }}</p>
      <p>{{ $t("system.menu.api.tips.2") }}</p>
      <p>{{ $t("system.menu.api.tips.3") }}</p>
      <div class="button-row">
        <Input
          class="mt-2"
          style="width: 250px; margin-right: 2px"
          v-model:value="keyword"
          placeholder="{{ $t('search.placeholder') }}"
        ></Input>
        <ElButton class="ml-2" type="primary" @click="handleSearch">{{
          $t("system.menu.api.search")
        }}</ElButton>
        <ElButton class="ml-2" @click="handleSync">{{
          $t("system.menu.api.sync")
        }}</ElButton>
      </div>

      <div class="tree-container">
        <div class="left-sidebar">
          <ElCard
            class="art-table-card"
            shadow="never"
            style="margin-top: 0; max-height: 80vh"
          >
            <el-tree
              ref="treeRef"
              node-key="id"
              :data="treeData"
              :props="defaultProps"
              @node-click="handleNodeClick"
            />
          </ElCard>
        </div>

        <div class="right-content" style="margin-left: 5px">
          <el-row :gutter="20">
            <el-col
              v-for="(item, index) in routeList"
              :key="index"
              :xs="24"
              :sm="12"
              :md="12"
              :lg="12"
            >
              <el-card
                class="cursor-pointer transition-all duration-300"
                :class="{
                  'selected-route-card': isSelected(item),
                  'hover:shadow-md': !isSelected(item),
                }"
                @click.native="handleCardClick(item)"
                style="margin-bottom: 5px"
              >
                <div class="route-info">
                  <p>
                    <strong>{{ $t("system.menu.api.routeInfo.name") }}：</strong>
                    <span>{{ item.name }}</span>
                  </p>
                  <p>
                    <strong>{{ $t("system.menu.api.routeInfo.method") }}：</strong>
                    <span>
                      {{ item.method }}
                    </span>
                  </p>
                  <p>
                    <strong>{{ $t("system.menu.api.routeInfo.path") }}：</strong>
                    <span>{{ item.path }}</span>
                  </p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { MenuService } from "@/app/api/system/menu";
import { HttpMethod, RuleService,type RouteRow } from "@/app/api/system/rule";
import { CrudMethods } from "@/components/crud";
import { useDialog } from "@/components/dialog";
import { $t } from '@/locales'

const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const cateList = ref<any>([]);
const keyword = ref("");
const treeData = ref<any>([]);
const defaultSelectedKeys = ref<(string | number)[]>([]);
const selectedRoute = ref<Pick<RouteRow, "path" | "method">[]>([]);
const routeList = ref<RouteRow[]>([]);
const defaultProps = ref({
  label: (data: any) => {
    return `${data.name}`;
  },
});

const emit = defineEmits<{
  success: [];
}>();


/**
 * 加载Tree数据
 */
const getTree = async () => {
  //1.0清空选中路由列表
  selectedRoute.value = [];
  //2.0获取tree数据
  const result = await RuleService.cate({ page: 1, limit: 9999, format: "tree" });
  treeData.value = result || [];
  //3.0将第一个子级第一个节点设为默认节点
  defaultSelectedKeys.value = getFirstLeafKeys(treeData.value);
};

/**
 * 加载列表数据
 * @param cateId
 * @param name
 */
const loadData = async (cateId: any, name: any) => {
  const result = await RuleService.list({
    page: 1,
    limit: 9999,
    cate_id: cateId,
    LIKE_name: name,
  });
  //@ts-ignore
  routeList.value = result?.items || [];
};

/**
 * 搜索
 */
const handleSearch = () => {
  loadData(defaultSelectedKeys.value[0] || null, keyword.value);
};

/**
 * 获取tree第一个子节点
 * @param tree
 */
 const getFirstLeafKeys = (tree: any) => {
  //@ts-ignore
  const findLeafKeys = (nodes: any) => {
    const keys = [];
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        // 如果有子节点，递归查找
        keys.push(...findLeafKeys(node.children));
      } else {
        // 如果没有子节点，是叶子节点，加入 keys
        keys.push(node.id);
      }
    }
    return keys;
  };
  const allLeafKeys = findLeafKeys(tree);
  return allLeafKeys.length > 0 ? [allLeafKeys[0]] : [];
}

/**
 * 路由同步
 */
const handleSync = () => {
  dialogApi.setState({ loading: true, confirmLoading: true });
  RuleService.sync({})
    .then(() => {
      getTree();
      ElMessage({
        message:$t("common.message.success"),
        type:'success'
    })



    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
};


/**
 * 点击树
 * @param data
 */
const handleNodeClick = (data: any) => {
  loadData(data?.value|| null, null)
}

// 统一方法类型格式
const normalizeMethod = (method: string): HttpMethod => {
  const lowerMethod = method.toLowerCase() as HttpMethod;
  if (!["get", "post", "put", "delete", "patch"].includes(lowerMethod)) {
    throw new Error(`非标准HTTP方法: ${method}`);
  }
  return lowerMethod;
};

/**
 * 路由列表选中判断
 * @param item
 */
const isSelected = (item: RouteRow): boolean => {
  return selectedRoute.value.some(
    (selected) =>
      selected.path === item.path &&
      normalizeMethod(selected.method) === normalizeMethod(item.method)
  );
};

/**
 * 卡片点击事件
 * @param item
 */
const handleCardClick = (item: RouteRow): void => {
  const normalizedMethod = normalizeMethod(item.method);
  //@ts-ignore
  const target: Pick<RouteItem, "path" | "method" | "title" | "type" | "methods"> = {
    path: item.path,
    method: item.method,
    methods: item.method,
    title: item.name,
    type: 4, //接口
  };

  const existIndex = selectedRoute.value.findIndex(
    (selected) =>
      selected.path === target.path &&
      normalizeMethod(selected.method) === normalizedMethod
  );

  existIndex > -1
    ? selectedRoute.value.splice(existIndex, 1)
    : selectedRoute.value.push(target);
};

/**
 * 为二维数组中的每个对象添加键值对
 * @param matrix 二维数组（每个元素必须是对象数组）
 * @param keyValuePairs 需合并的键值对
 */
const mergePropertiesToRoutes = (routes: any, propertiesToMerge: any): RouteRow[] => {
  return routes.map((route: any) => ({
    ...route,
    ...propertiesToMerge, // 批量合并属性
  }));
};


const [Dialog, dialogApi] = useDialog({
  title: $t("system.menu.api.title"),
  width: "70%",
  modal: true,
  draggable: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm() {
    if (selectedRoute.value.length !== 0) {
      dialogApi.setState({ loading: true, confirmLoading: true });
      const data = mergePropertiesToRoutes(selectedRoute.value, { pid: record.value.id });
      MenuService.batchStore({ menus: data })
        .then(() => {
          ElMessage.success($t('common.message.success'));
          emit('success');
          dialogApi.close();
        })
        .finally(() => {
          dialogApi.setState({ loading: false, confirmLoading: false });
        });
    }
  },
});


defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    dialogApi.setState({
      title: `选择接口`,
    });
    crudApi.value = getCrudApi();
    dialogApi.open();
    nextTick(async () => {
      await getTree();
      loadData(defaultSelectedKeys.value[0] || null, null);
    });
  },
});
</script>
<style lang="scss" scoped>
.tree-container {
  box-sizing: border-box;
  display: flex;
  height: 100%;
  margin-top: 5px;
  // gap: 16px;
  .left-sidebar {
    flex-shrink: 0;
    width: 280px;
    height: 100%;
  }

  .right-content {
    flex-grow: 1;
    min-width: 0;
    height: 100%;
  }

  .art-table-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  //卡片样式
  .cursor-pointer {
    cursor: pointer;
  }
  .transition-all {
    transition-duration: 0.15s;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  .duration-300 {
    animation-duration: 0.3s;
  }
  .selected-route-card {
    background-color: #1890ff1a;
    border-color: #1890ff80;
    transition: all 0.3s;
  }
  :hover.shadow-md {
    background-color: #1890ff1a;
    border-color: #1890ff80;
  }
}

@media screen and (max-width: 800px) {
  .tree-container {
    display: block;
    gap: 0;
    height: auto;

    .left-sidebar {
      width: 100%;
      height: auto;
      margin-bottom: 20px;
    }
  }
}
</style>
