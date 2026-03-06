<template>
  <Dialog>
    <div class="question-detail">
      <!-- 问题基本信息 -->
      <div class="info-section">
        <h3>问题信息</h3>
        <el-descriptions :column="2" border label-class-name="desc-label">
          <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="提问者">{{ detail.member?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ detail.category?.name }}</el-descriptions-item>
          <el-descriptions-item label="标签">
            <el-tag
              v-for="tag in detail.tags"
              :key="tag.id"
              size="small"
              style="margin-right: 5px"
            >
              {{ tag.name }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="浏览数">{{ detail.view_count }}</el-descriptions-item>
          <el-descriptions-item label="评论数">{{ detail.comment_count }}</el-descriptions-item>
          <el-descriptions-item label="收藏数">{{ detail.like_count }}</el-descriptions-item>
          <el-descriptions-item label="是否置顶">
            <el-tag :type="detail.is_sticky === 1 ? 'warning' : 'info'">
              {{ detail.is_sticky === 1 ? "是" : "否" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(detail.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="问题标题" :span="2">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="问题内容" :span="2">
            <div class="content" v-html="detail.content"></div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <!-- <el-button type="danger" @click="handleDelete">删除问题</el-button> -->
        <el-button
          :type="detail.is_sticky === 1 ? 'warning' : 'default'"
          @click="handleSetSticky"
        >
          {{ detail.is_sticky === 1 ? "取消置顶" : "设置置顶" }}
        </el-button>
        <el-button
          :type="detail.is_excellent === 1 ? 'success' : 'default'"
          @click="handleSetExcellent"
        >
          {{ detail.is_excellent === 1 ? "取消精华" : "设置精华" }}
        </el-button>
      </div>

      <!-- 回答列表 -->
      <div class="section">
        <h3>回答列表</h3>
        <el-table :data="detail.answers || []" stripe>
          <el-table-column prop="member.nickname" label="回答者" width="120" />
          <el-table-column
            prop="content"
            label="回答内容"
            show-overflow-tooltip
            min-width="300"
          />
          <el-table-column prop="like_count" label="赞同" width="80" align="center" />
          <el-table-column prop="dislike_count" label="反对" width="80" align="center" />
          <el-table-column label="是否最佳" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_best === 1 ? 'success' : 'info'" size="small">
                {{ row.is_best === 1 ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="230" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleViewComments(row)"
              >
                查看评论
              </el-button>
              <el-button
                link
                :type="row.is_best === 1 ? 'warning' : 'success'"
                size="small"
                @click="handleSetBest(row)"
              >
                {{ row.is_best === 1 ? '取消最佳' : '设为最佳' }}
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteAnswer(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" width="200" align="center">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 评论查看对话框 -->
      <el-dialog v-model="commentDialogVisible" title="评论列表" width="70%">
        <el-table :data="currentComments || []" stripe>
          <el-table-column prop="user.nickname" label="评论者" width="120" />
          <el-table-column
            prop="content"
            label="评论内容"
            show-overflow-tooltip
            min-width="300"
          />
          <el-table-column prop="like_count" label="点赞" width="80" align="center" />
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteComment(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" width="200" align="center">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useDialog } from "@/components/dialog";
import { ref } from "vue";
import { formatDateTime } from "@/utils";
import { QuestionService, AnswerService } from "@/apps/official/api/ask/question";
import { ElMessage, ElMessageBox } from "element-plus";

const detail = ref<any>({});
const commentDialogVisible = ref(false);
const currentComments = ref<any[]>([]);
const currentAnswerId = ref<number | null>(null);

const [Dialog, dialogApi] = useDialog({
  title: "问题详情",
  width: "85%",
  modal: true,
  dialogType: "drawer",
  closeOnClickModal: true,
  destroyOnClose: true,
  draggable: true,
  footer: false,
});

defineExpose({
  async show({ data }: { data: any }) {
    const respon = await QuestionService.get(data.id);
    detail.value = respon;
    dialogApi.open();
  },
});

const formatDate = (date: string) => {
  return formatDateTime(date);
};

// 删除问题
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm("确定要删除这个问题吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await QuestionService.remove(detail.value.id);
    ElMessage.success("删除成功");
    dialogApi.close();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 设置置顶
const handleSetSticky = async () => {
  try {
    const isSticky = detail.value.is_sticky === 1 ? 0 : 1;
    await QuestionService.setSticky(detail.value.id, {
      is_sticky: isSticky,
      sticky_order: 0,
    });
    ElMessage.success(isSticky ? "设置置顶成功" : "取消置顶成功");
    detail.value.is_sticky = isSticky;
  } catch (error: any) {
    ElMessage.error(error.message || "操作失败");
  }
};

// 设置精华
const handleSetExcellent = async () => {
  try {
    const isExcellent = detail.value.is_excellent === 1 ? 0 : 1;
    await QuestionService.setExcellent(detail.value.id, { is_excellent: isExcellent });
    ElMessage.success(isExcellent ? "设置精华成功" : "取消精华成功");
    detail.value.is_excellent = isExcellent;
  } catch (error: any) {
    ElMessage.error(error.message || "操作失败");
  }
};

// 查看评论
const handleViewComments = (row: any) => {
  currentAnswerId.value = row.id;
  currentComments.value = row.comments || [];
  commentDialogVisible.value = true;
};

// 删除回答
const handleDeleteAnswer = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这个回答吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await AnswerService.remove(row.id);
    ElMessage.success("删除成功");
    // 刷新回答列表
    const respon = await QuestionService.get(detail.value.id);
    detail.value = respon;
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 删除评论
const handleDeleteComment = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这条评论吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    // TODO: 调用删除评论接口
    ElMessage.success("删除成功");
    commentDialogVisible.value = false;
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 设置最佳答案
const handleSetBest = async (row: any) => {
  try {
    const isBest = row.is_best === 1 ? 0 : 1;
    await AnswerService.setBest({ id: row.id, is_best: isBest });
    ElMessage.success(isBest ? "设置最佳答案成功" : "取消最佳答案成功");
    row.is_best = isBest;
  } catch (error: any) {
    ElMessage.error(error.message || "操作失败");
  }
};
</script>

<style lang="scss" scoped>
.question-detail {
  padding: 20px;

  :deep(.el-descriptions__label) {
    width: 120px;
    min-width: 120px;
  }

  .info-section {
    h3 {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .action-section {
    margin: 20px 0;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    gap: 10px;
  }

  .section {
    margin-top: 30px;

    h3 {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .content {
    line-height: 1.8;
    color: #606266;
    padding: 10px;
  }
}
</style>
