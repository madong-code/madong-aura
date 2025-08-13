<template>
  <div>
    <el-radio-group v-model="labelPosition">
      <el-radio-button value="left">左对齐</el-radio-button>
      <el-radio-button value="right">右对齐</el-radio-button>
      <el-radio-button value="top">顶部对齐</el-radio-button>
    </el-radio-group>
    <BasicForm style="margin-top: 12px" @change="handleChange" />
    <code>
      <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
    </code>
  </div>
</template>
<script setup lang="ts">
  import { useForm } from '@/components/form'
  import { UserService } from '@/api/sys/userApi'
  const labelPosition = ref<'left' | 'right' | 'top'>('right')
  const options = ref([
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
    { label: '选项三', value: '3' }
  ])
  const formState = ref({})
  const handleChange = (val: any) => {
    formState.value = val
  }
  watch(
    () => labelPosition.value,
    (val) => {
      formApi.setState({
        labelPosition: val
      })
    }
  )
  const [BasicForm, formApi] = useForm({
    labelPosition: labelPosition.value,
    labelWidth: '120px',
    schema: [
      {
        prop: 'Input',
        label: '单行文本',
        component: 'Input',
        colSpan: 8
      },
      {
        prop: 'password',
        label: '密码框',
        component: 'Input',
        colSpan: 8,
        componentProps: { type: 'password', showPassword: true }
      },
      {
        prop: 'InputNumber',
        label: '数字输入框',
        component: 'InputNumber',
        colSpan: 8,
        componentProps: { style: { width: '100%' } }
      },
      {
        prop: 'Select',
        label: '下拉选择(单选)',
        component: 'Select',
        colSpan: 6,
        defaultValue: '1',
        componentProps: {
          options: options.value,
          clearable: true
        }
      },
      {
        prop: 'Select-multiple',
        label: '下拉选择(多选)',
        component: 'Select',
        colSpan: 6,
        defaultValue: ['1', '2'],
        componentProps: {
          options: options.value,
          clearable: true,
          multiple: true
        }
      },
      {
        prop: 'RadioGroup',
        label: '单选框',
        component: 'RadioGroup',
        colSpan: 6,
        defaultValue: '1',
        componentProps: {
          options: options.value
        }
      },
      {
        prop: 'CheckboxGroup',
        label: '多选框',
        component: 'CheckboxGroup',
        colSpan: 6,
        defaultValue: ['1'],
        componentProps: {
          options: options.value
        }
      },
      {
        prop: 'ApiSelect',
        label: '远程下拉框(单选)',
        component: 'ApiSelect',
        colSpan: 12,
        componentProps: {
          api: UserService.select
        }
      },
      {
        prop: 'ApiSelect-multiple',
        label: '远程下拉框(多选)',
        component: 'ApiSelect',
        colSpan: 12,
        componentProps: {
          api: UserService.select,
          multiple: true
        }
      }
    ]
  })
</script>
<style lang="scss" scoped></style>
