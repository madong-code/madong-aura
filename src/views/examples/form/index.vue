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
  import { DeptService } from '@/api/sys/deptApi'
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
    labelWidth: '150px',
    schema: [
      {
        prop: 'divider-input',
        label: '',
        labelWidth: '0px',
        component: 'Divider',
        colSpan: 24,
        componentProps: {
          title: '文本输入框'
        }
      },
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
        prop: 'Textarea',
        label: '多行文本',
        component: 'Input',
        colSpan: 24,
        componentProps: { type: 'textarea', rows: 4 }
      },
      {
        prop: 'divider-select',
        label: '',
        labelWidth: '0px',
        component: 'Divider',
        colSpan: 24,
        componentProps: {
          title: '下拉、单选框、多选框'
        }
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
        prop: 'divider-api',
        label: '',
        labelWidth: '0px',
        component: 'Divider',
        colSpan: 24,
        componentProps: {
          title: '远程下拉、单选框、多选框'
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
      },
      {
        prop: 'ApiRadioGroup',
        label: '远程单选框',
        component: 'ApiRadioGroup',
        colSpan: 12,
        componentProps: {
          api: UserService.select
        }
      },
      {
        prop: 'ApiCheckboxGroup',
        label: '远程多选框',
        component: 'ApiCheckboxGroup',
        colSpan: 12,
        componentProps: {
          api: UserService.select
        }
      },
      {
        prop: 'ApiTreeSelect',
        label: '远程树选择框(单选)',
        component: 'ApiTreeSelect',
        colSpan: 12,
        componentProps: {
          api: DeptService.tree
        }
      },
      {
        prop: 'ApiTreeSelect-multiple',
        label: '远程树选择框(多选)',
        component: 'ApiTreeSelect',
        colSpan: 12,
        componentProps: {
          api: DeptService.tree,
          showCheckbox: true,
          multiple: true
        }
      },
      {
        prop: 'ApiCascader',
        label: '远程级联选择',
        component: 'ApiCascader',
        colSpan: 12,
        componentProps: {
          api: DeptService.tree
        }
      },
      {
        prop: 'divider-date',
        label: '',
        labelWidth: '0px',
        component: 'Divider',
        colSpan: 24,
        componentProps: {
          title: '日期选择'
        }
      },
      {
        prop: 'DatePicker-date',
        label: '单日期(date)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'date'
        }
      },
      {
        prop: 'DatePicker-datetime',
        label: '日期时间(datetime)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'datetime'
        }
      },
      {
        prop: 'DatePicker-daterange',
        label: '日期范围(daterange)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'daterange'
        }
      },
      {
        prop: 'DatePicker-datetimerange',
        label: '日期时间范围(datetimerange)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'datetimerange'
        }
      },
      {
        prop: 'DatePicker-month',
        label: '月份(month)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'month'
        }
      },
      {
        prop: 'DatePicker-monthrange',
        label: '月份范围(monthrange)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'monthrange'
        }
      },
      {
        prop: 'DatePicker-year',
        label: '年份(year)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'year'
        }
      },
      {
        prop: 'DatePicker-yearrange',
        label: '年份范围(yearrange)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'yearrange'
        }
      },
      {
        prop: 'DatePicker-week',
        label: '周(week)',
        component: 'DatePicker',
        colSpan: 8,
        componentProps: {
          type: 'week'
        }
      }
    ]
  })
</script>
<style lang="scss" scoped></style>
