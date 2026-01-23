<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>DummyClassName管理</span>
          <el-button type="primary" size="small" @click="handleAdd">
            <i class="el-icon-plus"></i> 新增
          </el-button>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="mb20">
        <el-form-item label="ID">
          <el-input v-model="searchForm.id" placeholder="请输入ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <i class="el-icon-search"></i> 搜索
          </el-button>
          <el-button @click="resetForm">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="loading"
        :data="listData"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row.id)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="total > 0"
        :current-page="searchForm.page"
        :page-size="searchForm.limit"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="ID" prop="id">
          <el-input v-model="formData.id" placeholder="请输入ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getList, getInfo, add, edit, del } from '@/api/DummyModuleName';

export default {
  name: 'DummyClassNameList',
  data() {
    return {
      loading: false,
      listData: [],
      total: 0,
      searchForm: {
        id: '',
        page: 1,
        limit: 10
      },
      dialogVisible: false,
      dialogTitle: '',
      formData: {
        id: 0
      },
      rules: {
        id: [
          { required: true, message: '请输入ID', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取列表
    getList() {
      this.loading = true;
      getList(this.searchForm)
        .then(res => {
          this.listData = res.data.list;
          this.total = res.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 搜索
    handleSearch() {
      this.searchForm.page = 1;
      this.getList();
    },
    // 重置
    resetForm() {
      this.searchForm = {
        id: '',
        page: 1,
        limit: 10
      };
      this.getList();
    },
    // 分页
    handleCurrentChange(page) {
      this.searchForm.page = page;
      this.getList();
    },
    handleSizeChange(limit) {
      this.searchForm.limit = limit;
      this.searchForm.page = 1;
      this.getList();
    },
    // 新增
    handleAdd() {
      this.dialogTitle = '新增DummyClassName';
      this.formData = {
        id: 0
      };
      this.dialogVisible = true;
    },
    // 编辑
    handleEdit(id) {
      this.dialogTitle = '编辑DummyClassName';
      getInfo(id)
        .then(res => {
          this.formData = res.data;
          this.dialogVisible = true;
        });
    },
    // 删除
    handleDelete(id) {
      this.$confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          del(id)
            .then(() => {
              this.$message.success('删除成功');
              this.getList();
            });
        })
        .catch(() => {
          this.$message.info('已取消删除');
        });
    },
    // 提交
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const request = this.formData.id ? edit(this.formData.id, this.formData) : add(this.formData);
          request
            .then(() => {
              this.$message.success(this.formData.id ? '编辑成功' : '新增成功');
              this.dialogVisible = false;
              this.getList();
            });
        }
      });
    }
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb20 {
  margin-bottom: 20px;
}
</style>