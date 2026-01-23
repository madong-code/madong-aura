import { ElMessage } from 'element-ui';

/**
 * DummyClassName表单验证规则
 */
export const formRules = {
  id: [
    { required: true, message: '请输入ID', trigger: 'blur' },
    { type: 'number', message: 'ID必须是数字', trigger: 'blur' }
  ]
};

/**
 * 搜索表单验证规则
 */
export const searchRules = {
  id: [
    { type: 'number', message: 'ID必须是数字', trigger: 'blur' }
  ]
};

/**
 * 表单默认值
 */
export const defaultFormData = {
  id: 0
};

/**
 * 搜索表单默认值
 */
export const defaultSearchData = {
  id: '',
  page: 1,
  limit: 10
};
