<template>
  <Dialog>
    <div class="tree-toolbar">
      <ElDropdown @command="handleExpandCommand">
        <ElButton type="primary">
          <template #icon>
            <Icon icon="ant-design:folder-open-outlined" />
          </template>
          {{ $t("member.tag.auth.expand.title")
          }}<ElIcon class="el-icon--right"
            ><Icon icon="ant-design:down-outlined"
          /></ElIcon>
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="expandAll">{{
              $t("member.tag.auth.expand.expand_all")
            }}</ElDropdownItem>
            <ElDropdownItem command="expandLevel1">{{
              $t("member.tag.auth.expand.expand_level1")
            }}</ElDropdownItem>
            <ElDropdownItem command="expandLevel2">{{
              $t("member.tag.auth.expand.expand_level2")
            }}</ElDropdownItem>
            <ElDropdownItem command="collapseAll">{{
              $t("member.tag.auth.expand.collapse_all")
            }}</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
    <el-tree
      ref="treeRef"
      node-key="id"
      :data="treeData"
      :props="defaultProps"
      show-checkbox
    >
      <!-- 使用插槽自定义节点内容 -->
      <template #default="{ node, data }">
        <span>
          {{ data.name }}
          <el-tag
            :style="{
              marginLeft: '8px',
              backgroundColor: getTagColor(data.category),
              color: 'white',
              border: 'none',
            }"
            size="small"
          >
            {{ getTagName(data.category) }}
          </el-tag>
          <el-tag
            v-if="data.code"
            :style="{
              marginLeft: '4px',
              backgroundColor: '#F56C6C',
              color: 'white',
              border: 'none',
            }"
            size="small"
          >
            {{ $t("member.tag.auth.tag.auth") }}
          </el-tag>
          <el-tag
            v-if="!data.code"
            :style="{
              marginLeft: '4px',
              backgroundColor: '#909399',
              color: 'white',
              border: 'none',
            }"
            size="small"
          >
            {{ $t("member.tag.auth.tag.public") }}
          </el-tag>
        </span>
      </template>
    </el-tree>
  </Dialog>
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";
import { CrudMethods } from "@/components/crud";
import { MenuService } from "@/api/web/menu";
import { AuthService } from "@/api/member/auth";
import { getTreeLeafNodeIds } from "@/utils/tool";
import { Icon } from "@/components/icon";
import { UserService } from "@/api/system/user";
import { $t } from "@/locales";
const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const treeData = ref<any>([]);
const treeRef = ref();
const checkedKeys = ref<any>([]);
const leafNodeIds = ref<any>([]);
const defaultProps = ref({
  label: (data: any) => {
    return `${data.title}| ${data.name}`;
  },
});

// 获取类型对应的标签名称
const getTagName = (type: number) => {
  const typeConfig: Record<number, string> = {
    1: $t("member.tag.auth.tag.nav_menu"),
    2: $t("member.tag.auth.tag.member_menu"),
  };
  return typeConfig[type] || $t("member.tag.auth.tag.unknown");
};

// 获取类型对应的标签颜色
const getTagColor = (type: number) => {
  const colorConfig: Record<number, string> = {
    1: "#409EFF",
    2: "#67C23A",
    3: "#909399",
    4: "#E6A23C",
  };
  return colorConfig[type] || "#F56C6C";
};

const [Dialog, dialogApi] = useDialog({
  title: $t("member.tag.auth.title"),
  width: "50%",
  dialogType: "drawer",
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm() {
    const checkedKeys = treeRef.value.getCheckedKeys();
    // 提交时，除了勾选节点外，半选节点也可提交，半选为非叶子节点
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys();
    const submitKeys = [...checkedKeys, ...halfCheckedKeys];
    dialogApi.setState({
      confirmLoading: true,
      loading: true,
    });
    AuthService.saveTagMenu({
      tag_id: record.value.id,
      menu_id: submitKeys,
    })
      .then(() => {
        ElMessage.success($t("member.tag.auth.message.auth_success"));
      })
      .finally(() => {
        dialogApi.setState({
          confirmLoading: false,
          loading: false,
        });
      });
  },
});

// 处理展开命令
const handleExpandCommand = (command: string) => {
  switch (command) {
    case "expandAll":
      expandAll();
      break;
    case "expandLevel1":
      expandToLevel(1);
      break;
    case "expandLevel2":
      expandToLevel(2);
      break;
    case "collapseAll":
      collapseAll();
      break;
  }
};

// 展开所有节点
const expandAll = () => {
  if (treeData.value && treeData.value.length > 0) {
    treeData.value.forEach((node: any) => {
      if (treeRef.value.store.nodesMap[node.id]) {
        treeRef.value.store.nodesMap[node.id].expanded = true;
        expandNodeChildren(node);
      }
    });
  }
};

// 展开到指定层级
const expandToLevel = (level: number) => {
  collapseAll(); // 先折叠所有
  if (treeData.value && treeData.value.length > 0) {
    treeData.value.forEach((node: any) => {
      if (treeRef.value.store.nodesMap[node.id]) {
        if (level >= 1) {
          treeRef.value.store.nodesMap[node.id].expanded = true;
          if (level >= 2 && node.children && node.children.length > 0) {
            node.children.forEach((child: any) => {
              if (treeRef.value.store.nodesMap[child.id]) {
                treeRef.value.store.nodesMap[child.id].expanded = true;
              }
            });
          }
        }
      }
    });
  }
};

// 折叠所有节点
const collapseAll = () => {
  if (treeData.value && treeData.value.length > 0) {
    treeData.value.forEach((node: any) => {
      if (treeRef.value.store.nodesMap[node.id]) {
        treeRef.value.store.nodesMap[node.id].expanded = false;
        collapseNodeChildren(node);
      }
    });
  }
};

// 递归展开节点的子节点
const expandNodeChildren = (node: any) => {
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      if (treeRef.value.store.nodesMap[child.id]) {
        treeRef.value.store.nodesMap[child.id].expanded = true;
        expandNodeChildren(child);
      }
    });
  }
};

// 递归折叠节点的子节点
const collapseNodeChildren = (node: any) => {
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      if (treeRef.value.store.nodesMap[child.id]) {
        treeRef.value.store.nodesMap[child.id].expanded = false;
        collapseNodeChildren(child);
      }
    });
  }
};

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    dialogApi.setState({
      title: $t("member.tag.auth.auth_manage", { name: data.name }),
    });

    crudApi.value = getCrudApi();
    dialogApi.open();
    nextTick(() => {
      AuthService.getMemberAllPermission().then((res) => {
        treeData.value = res;
        leafNodeIds.value = getTreeLeafNodeIds(treeData.value);
        AuthService.tagMenuIds({
          tag_id: data.id,
        }).then((res: any) => {
          // 只能设置叶子节点，原因是当勾选父节点时，子节点也会被勾选
          checkedKeys.value = res.filter((id: any) => leafNodeIds.value.includes(id));
          treeRef.value.setCheckedKeys(checkedKeys.value);
        });
      });
    });
  },
});
</script>
<style lang="scss" scoped>
.tree-toolbar {
  padding: 10px;
}
</style>
