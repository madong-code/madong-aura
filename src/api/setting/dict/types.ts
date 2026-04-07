
export interface DictRow {
    id: string;
    group_code: string;
    name: string;
    code: string;
    data_type: string;
    description: string;
    enabled: number;
    sort: number;
    created_by: string;
    updated_by: string;
    updated_at: string;
}

export interface DictOptions extends DictItemRow {
    label: string;
    value: string | number;
}

export type ApiResponse<T> = Promise<{
    code: number;
    data: T;
    msg: string;
}>;


export interface DictItemRow {
    label: string;
    value: string | number;
    id?: string | number;
    dict_id: string | number;
    code: string;
    sort: number;
    enabled: number;
    color: string;
    other_class: string;
    is_default?: number;
    created_by: string | number;
    updated_by: string | number;
    created_at: string | number;
    updated_at: string | number;
    remark: string;
}
