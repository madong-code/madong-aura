<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础表单" name="form">
        <el-radio-group v-model="labelPosition">
          <el-radio-button value="left">左对齐</el-radio-button>
          <el-radio-button value="right">右对齐</el-radio-button>
          <el-radio-button value="top">顶部对齐</el-radio-button>
        </el-radio-group>
        <BasicForm style="margin-top: 12px" @change="handleChange" />
        <code>
          <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
        </code>
      </el-tab-pane>
      <el-tab-pane label="详情表单" name="detailForm">
        <el-radio-group v-model="labelPosition">
          <el-radio-button value="left">左对齐</el-radio-button>
          <el-radio-button value="right">右对齐</el-radio-button>
          <el-radio-button value="top">顶部对齐</el-radio-button>
        </el-radio-group>
        <DetailForm :model="detailData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
  import { FormItemSchema, useForm, useDetailForm } from '@/components/form'
  const activeTab = ref('form')
  const labelPosition = ref<'left' | 'right' | 'top'>('right')
  const options = ref([
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
    { label: '选项三', value: '3' }
  ])
  const formState = ref({})
  const handleChange = (val: any) => {
    formState.value = val
    detailData.value = val
  }
  watch(
    () => labelPosition.value,
    (val) => {
      formApi.setState({
        labelPosition: val
      })
      detailFormApi.setState({
        labelPosition: val
      })
    }
  )
  const schema: FormItemSchema[] = [
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
        api: '/sys/user/select'
      }
    },
    {
      prop: 'ApiSelect-multiple',
      label: '远程下拉框(多选)',
      component: 'ApiSelect',
      colSpan: 12,
      componentProps: {
        api: '/sys/user/select',
        multiple: true
      }
    },
    {
      prop: 'ApiRadioGroup',
      label: '远程单选框',
      component: 'ApiRadioGroup',
      colSpan: 12,
      componentProps: {
        api: '/sys/user/select'
      }
    },
    {
      prop: 'ApiCheckboxGroup',
      label: '远程多选框',
      component: 'ApiCheckboxGroup',
      colSpan: 12,
      componentProps: {
        api: '/sys/user/select'
      }
    },
    {
      prop: 'ApiTreeSelect',
      label: '远程树选择框(单选)',
      component: 'ApiTreeSelect',
      colSpan: 12,
      componentProps: {
        api: '/sys/dept/tree'
      }
    },
    {
      prop: 'ApiTreeSelect-multiple',
      label: '远程树选择框(多选)',
      component: 'ApiTreeSelect',
      colSpan: 12,
      componentProps: {
        api: '/sys/dept/tree',
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
        api: '/sys/dept/tree'
      }
    },
    {
      prop: 'divider-dict',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '字典组件'
      }
    },
    {
      prop: 'ApiDict-sex-Select',
      label: '字典组件',
      helpMessage: 'renderType="Select"',
      component: 'ApiDict',
      colSpan: 12,
      componentProps: {
        code: 'sex'
      }
    },
    {
      prop: 'ApiDict-sex-Select-multiple',
      label: '字典组件',
      helpMessage: ['renderType="Select"', 'multiple=true'],
      component: 'ApiDict',
      colSpan: 12,
      componentProps: {
        code: 'sex',
        // 多选
        multiple: true
      }
    },
    {
      prop: 'ApiDict-sex-RadioGroup',
      label: '字典组件',
      helpMessage: 'renderType="RadioGroup"',
      component: 'ApiDict',
      colSpan: 12,
      componentProps: {
        code: 'sex',
        renderType: 'RadioGroup'
      }
    },
    {
      prop: 'ApiDict-sex-RadioGroup-btn',
      label: '字典组件',
      helpMessage: ['renderType="RadioGroup"', 'isBtn=true'],
      component: 'ApiDict',
      colSpan: 12,
      componentProps: {
        code: 'sex',
        renderType: 'RadioGroup',
        isBtn: true
      }
    },
    {
      prop: 'ApiDict-sex-CheckboxGroup',
      label: '字典组件',
      helpMessage: 'renderType="CheckboxGroup"',
      component: 'ApiDict',
      colSpan: 12,
      componentProps: {
        code: 'sex',
        renderType: 'CheckboxGroup'
      }
    },
    {
      prop: 'ApiDict-sex-CheckboxGroup-btn',
      label: '字典组件',
      helpMessage: ['renderType="CheckboxGroup"', 'isBtn=true'],
      component: 'ApiDict',
      colSpan: 12,
      componentProps: {
        code: 'sex',
        renderType: 'CheckboxGroup',
        isBtn: true
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
      label: '单日期',
      helpMessage: ['type="date"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'date'
      }
    },
    {
      prop: 'DatePicker-datetime',
      label: '日期时间',
      helpMessage: ['type="datetime"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'datetime'
      }
    },
    {
      prop: 'DatePicker-daterange',
      label: '日期范围',
      helpMessage: ['type="daterange"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'daterange'
      }
    },
    {
      prop: 'DatePicker-datetimerange',
      label: '日期时间范围',
      helpMessage: ['type="datetimerange"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'datetimerange'
      }
    },
    {
      prop: 'DatePicker-month',
      label: '月份',
      helpMessage: ['type="month"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'month'
      }
    },
    {
      prop: 'DatePicker-monthrange',
      label: '月份范围',
      helpMessage: ['type="monthrange"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'monthrange'
      }
    },
    {
      prop: 'DatePicker-year',
      label: '年份',
      component: 'DatePicker',
      helpMessage: ['type="year"'],
      colSpan: 8,
      componentProps: {
        type: 'year'
      }
    },
    {
      prop: 'DatePicker-yearrange',
      label: '年份范围',
      helpMessage: ['type="yearrange"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'yearrange'
      }
    },
    {
      prop: 'DatePicker-week',
      label: '周',
      helpMessage: ['type="week"'],
      component: 'DatePicker',
      colSpan: 8,
      componentProps: {
        type: 'week'
      }
    },
    {
      prop: 'divider-liandong',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '联动'
      }
    },
    {
      prop: 'ApiDict-sex',
      label: '性别',
      component: 'ApiDict',
      colSpan: 6,
      defaultValue: 1,
      componentProps: {
        code: 'sex',
        renderType: 'RadioGroup',
        isBtn: true
      }
    },
    {
      prop: 'ApiDict-sex-1',
      labelWidth: '180px',
      label: '选【男】时显示此字段',
      component: 'Input',
      colSpan: 18,
      componentProps: {},
      // show: (values) => {
      // 这个是css来控制的，不删除dom
      //   return values['ApiDict-sex'] == 1
      // },
      ifShow: (values) => {
        // 这个函数是js来控制的，直接删除dom
        return values['ApiDict-sex'] == 1
      },
      ifDetail: (values) => {
        return values['ApiDict-sex'] == 1
      }
    },
    {
      prop: 'ApiDict-sex-2',
      labelWidth: '180px',
      label: '选【女】时显示此字段',
      component: 'Input',
      colSpan: 18,
      componentProps: {},
      ifShow: (values) => {
        return values['ApiDict-sex'] == 2
      },
      ifDetail: (values) => {
        return values['ApiDict-sex'] == 2
      }
    },
    {
      prop: 'ApiDict-sex-3',
      labelWidth: '180px',
      label: '选【未知】时显示此字段',
      component: 'Input',
      colSpan: 18,
      componentProps: {},
      ifShow: (values) => {
        return values['ApiDict-sex'] == 3
      },
      ifDetail: (values) => {
        return values['ApiDict-sex'] == 3
      }
    },
    {
      prop: 'divider-disabled',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '动态disabled'
      }
    },
    {
      prop: 'ApiDict-sex-11',
      label: '性别',
      component: 'ApiDict',
      colSpan: 6,
      defaultValue: 1,
      componentProps: {
        code: 'sex',
        renderType: 'RadioGroup',
        isBtn: true
      }
    },
    {
      prop: 'ApiDict-sex-13',
      labelWidth: '160px',
      label: '未知时可编辑',
      component: 'Input',
      colSpan: 18,
      componentProps: (values) => {
        return {
          disabled: values['ApiDict-sex-11'] != 3
        }
      }
    },
    {
      prop: 'divider-upload',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '上传文件'
      }
    },
    {
      prop: 'Upload-1',
      label: '文件上传',
      helpMessage: 'listType="text"',
      component: 'Upload',
      colSpan: 24,
      componentProps: {
        // text/picture/picture-card
        listType: 'text'
      }
    },
    {
      prop: 'Upload-2',
      label: '文件上传',
      helpMessage: 'listType="picture"',
      component: 'Upload',
      colSpan: 24,
      componentProps: {
        // text/picture/picture-card
        listType: 'picture'
      }
    },
    {
      prop: 'Upload-3',
      label: '文件上传',
      helpMessage: 'listType="picture-card"',
      component: 'Upload',
      colSpan: 24,
      componentProps: {
        // text/picture/picture-card
        listType: 'picture-card'
      }
    },
    {
      prop: 'Upload-4',
      label: '分片上传',
      component: 'Upload',
      colSpan: 24,
      componentProps: {
        multipart: true
      }
    },
    {
      prop: 'divider-other',
      label: '',
      labelWidth: '0px',
      component: 'Divider',
      colSpan: 24,
      componentProps: {
        title: '其他组件'
      }
    },
    {
      prop: 'IconPicker-unicode',
      label: '图标选择器',
      helpMessage: 'iconType="unicode"',
      component: 'IconPicker',
      colSpan: 12,
      componentProps: {
        iconType: 'unicode'
      }
    },
    {
      prop: 'IconPicker-className',
      label: '图标选择器',
      helpMessage: 'iconType="className"',
      component: 'IconPicker',
      colSpan: 12,
      componentProps: {
        iconType: 'className'
      }
    },
    {
      prop: 'Editor',
      label: '富文本',
      component: 'Editor',
      colSpan: 24,
      componentProps: {}
    }
  ]
  const [BasicForm, formApi] = useForm({
    labelPosition: labelPosition.value,
    labelWidth: '150px',
    schema: schema
  })
  const detailData = ref({})
  const [DetailForm, detailFormApi] = useDetailForm({
    labelPosition: labelPosition.value,
    labelWidth: '150px',
    schema: schema
  })
</script>
<style lang="scss" scoped></style>
