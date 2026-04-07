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
          :placeholder="$t('search.placeholder')"
        ></Input>
        <ElButton class="ml-2" type="primary" @click="handleSearch">{{
          $t("system.menu.api.search")
        }}</ElButton>
        <ElButton class="ml-2" type="info" @click="handleRefreshCache">{{
          $t("system.menu.api.refresh_cache")
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
              :props="{ label: 'label', children: 'children' }"
              :current-node-key="defaultSelectedKeys[0]"
              highlight-current
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
                  <p
                    style="
                      display: flex;
                      align-items: flex-start;
                      margin: 0;
                      padding: 4px 0;
                    "
                  >
                    <span style="flex-shrink: 0; margin-right: 8px"
                      >{{ $t("system.menu.api.route_info.name") }}：</span
                    >
                    <span class="ellipsis-text" :title="item.name">{{ item.name }}</span>
                  </p>
                  <p
                    style="
                      display: flex;
                      align-items: flex-start;
                      margin: 0;
                      padding: 4px 0;
                    "
                  >
                    <span style="flex-shrink: 0; margin-right: 8px"
                      >{{ $t("system.menu.api.route_info.method") }}：</span
                    >
                    <span class="ellipsis-text" :title="item.method">{{
                      item.method
                    }}</span>
                  </p>
                  <p
                    style="
                      display: flex;
                      align-items: flex-start;
                      margin: 0;
                      padding: 4px 0;
                    "
                  >
                    <span style="flex-shrink: 0; margin-right: 8px"
                      >{{ $t("system.menu.api.route_info.path") }}：</span
                    >
                    <span class="ellipsis-text" :title="item.path">{{ item.path }}</span>
                  </p>
                  <p
                    v-if="item.code"
                    style="
                      display: flex;
                      align-items: flex-start;
                      margin: 0;
                      padding: 4px 0;
                    "
                  >
                    <span style="flex-shrink: 0; margin-right: 8px"
                      >{{ $t("system.menu.api.route_info.code") }}：</span
                    >
                    <span class="ellipsis-text" :title="item.code">{{ item.code }}</span>
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
import { MenuService } from "@/api/system/menu";
import { HttpMethod, RuleService,type RouteRow } from "@/api/system/rule";
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
// 删除不再使用的 defaultProps

const emit = defineEmits<{
  success: [];
}>();


/**
 * 加载Tree数据（扫描模式）
 */
const getTree = async () => {
  //1.0清空选中路由列表
  selectedRoute.value = [];
  //2.0获取tree数据（扫描模式，基于tags）
  const result = await RuleService.cate();
  treeData.value = result || [];
  //3.0将第一个节点设为默认节点
  const firstNodeId = getFirstNodeId(treeData.value);
  if (firstNodeId) {
    defaultSelectedKeys.value = [firstNodeId];
    //4.0加载第一个分类的数据
    loadData(firstNodeId, null);
  }
};

/**
 * 加载列表数据（扫描模式）
 * @param cateId
 * @param name
 */
const loadData = async (cateId: any, name: any) => {
  const result = await RuleService.list({
    cate_id: cateId,
    keyword: name,
  });
  //@ts-ignore
  routeList.value = result || [];
};

/**
 * 搜索
 */
const handleSearch = () => {
  // 搜索时清空分类选中
  defaultSelectedKeys.value = [];
  loadData(null, keyword.value);
};

/**
 * 获取tree第一个节点ID
 * @param tree
 */
const getFirstNodeId = (tree: any): string | null => {
  if (!tree || tree.length === 0) {
    return null;
  }
  return tree[0].id;
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
 * 刷新缓存
 */
const handleRefreshCache = () => {
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
  // 更新选中的分类
  defaultSelectedKeys.value = [data?.id || null];
  loadData(data?.id || null, null);
};

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
 * 卡片点击事件（扫描模式）
 * @param item
 */
const handleCardClick = (item: RouteRow): void => {
  const normalizedMethod = normalizeMethod(item.method);
  //@ts-ignore
  const target: Pick<RouteRow, "path" | "method" | "title" | "type" | "methods" | "code"> = {
    path: item.path,
    method: item.method,
    methods: item.method,
    title: item.name,
    type: 4, //接口
    code: item.code,
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
  width: "75%",
  modal: true,
  dialogType:"drawer",
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
          crudApi?.value?.refreshCreate();
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

  // 不换行样式
  .ellipsis-text {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 卡片内容字体大小
  .route-info {
    font-size: 14px;
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
