<template>
  <Dialog>
    <div class="tree-toolbar">
      <ElDropdown @command="handleExpandCommand">
        <ElButton type="primary">
          <template #icon>
            <Icon icon="ant-design:folder-open-outlined" />
          </template>
          展开/折叠<ElIcon class="el-icon--right"
            ><Icon icon="ant-design:down-outlined"
          /></ElIcon>
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="expandAll">展开所有</ElDropdownItem>
            <ElDropdownItem command="expandLevel1">展开一级</ElDropdownItem>
            <ElDropdownItem command="expandLevel2">展开二级</ElDropdownItem>
            <ElDropdownItem command="collapseAll">折叠所有</ElDropdownItem>
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
          {{ data.title }}
          <el-tag
            :style="{
              marginLeft: '8px',
              backgroundColor: getTagColor(data.type),
              color: 'white',
              border: 'none',
            }"
            size="small"
          >
            {{ getTagName(data.type) }}
          </el-tag>
        </span>
      </template>
    </el-tree>
  </Dialog>
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";
import { CrudMethods } from "@/components/crud";
import { MenuService } from "@/app/api/system/menu";
import { AuthService } from "@/app/api/system/auth";
import { getTreeLeafNodeIds } from "@/utils/tool";
import { Icon } from "@/components/icon";
import { UserService } from "@/app/api/system/user";
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
    1: "目录",
    2: "菜单",
    3: "按钮",
    4: "权限",
  };
  return typeConfig[type] || "未知";
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
  title: "授权菜单",
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
    AuthService.saveRoleMenu({
      role_id: record.value.id,
      menu_id: submitKeys,
    })
      .then(() => {
        ElMessage.success("授权成功");
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
      title: `【${data.name}】授权菜单`,
    });

    crudApi.value = getCrudApi();
    dialogApi.open();
    nextTick(() => {
      AuthService.getUserMenus().then((res) => {
        treeData.value = res;
        leafNodeIds.value = getTreeLeafNodeIds(treeData.value);
        AuthService.roleMenuIds({
          role_id: data.id,
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
