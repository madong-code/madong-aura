// 基础设置类型
export interface BasicConfig {
    tableName: string
    tableComment: string
    plugin: string
    moduleName: string
    className: string
    packageName: string
    author: string
    remark: string
}

// 字段配置类型
export interface FieldConfig {
    columnName: string
    columnComment: string
    dataType: string
    columnLength: number
    isPrimaryKey: boolean
    isRequired: boolean
    defaultValue?: string
    javaType?: string
    htmlType?: string
}

// 生成配置类型
export interface GenerateConfig {
    deleteType: 'logical' | 'physical'
    editMode: 'dialog' | 'page'
    sortField: string
    sortOrder: 'asc' | 'desc'
    parentMenu: string[]
    generateFiles: string[]
}

// 关联配置类型
export interface RelationConfig {
    relationTable: string
    relationType: 'oneToOne' | 'oneToMany' | 'manyToMany'
    relationField: string
    targetField: string
}

// 完整的代码生成配置
export interface CodeGenerateData {
    basic: BasicConfig
    fields: FieldConfig[]
    config: GenerateConfig
    relations: RelationConfig[]
}

// API响应类型
export interface GenerateResult {
    success: boolean
    message: string
    data?: {
        filePaths: string[]
        downloadUrl?: string
    }
}

export interface TableInfo {
    tableName: string
    tableComment: string
    createTime: string
    updateTime: string
}

export interface ColumnInfo {
    columnName: string
    dataType: string
    columnComment: string
    columnKey: string
    isNullable: string
    columnDefault: string
    extra: string
}
