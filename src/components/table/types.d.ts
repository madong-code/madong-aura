export interface TableSchema {
  columns: TableColumn[]
}
export interface TableColumn {
  // 列标题
  label: string
  // 列属性名
  prop: string
  // 列宽度
  width?: number | string
  // 最小宽度
  minWidth?: number | string
  // 是否可排序
  sortable?: boolean
  // 是否固定列
  fixed?: boolean | 'left' | 'right'
  // 列对齐方式
  align?: 'left' | 'center' | 'right'
}
