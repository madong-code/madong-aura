import type {
  CrudApiInstance,
  CrudSchema,
} from '#/components/crud/components/types';

import { ElImage, ElMessage, ElMessageBox } from 'element-plus';

import { FilesService } from '#/api/system';
import { DictEnum } from '#/enums/dict-enum';
import { $t } from '#/locales';
import { buildStaticUrl } from '#/utils/url/static-resource';

/** 行数据主键 */
const ROW_KEY = 'id';

/** 可内联预览的图片扩展名 */
const IMAGE_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
]);

/** 是否为图片资源（扩展名或 content_type 命中） */
export function isImageFile(row: Record<string, any>): boolean {
  const ext = String(row?.ext ?? '')
    .toLowerCase()
    .replace(/^\./, '');
  if (IMAGE_EXTENSIONS.has(ext)) {
    return true;
  }
  return String(row?.content_type ?? '')
    .toLowerCase()
    .startsWith('image/');
}

/** 资源访问地址（公开空间拼接访问域名，私有空间由 buildStaticUrl 换取签名直链） */
export function fileUrl(row: Record<string, any>): string {
  return buildStaticUrl(String(row?.base_path || row?.url || ''));
}

/**
 * 删除前校验当前登录管理员密码
 *
 * @returns 校验通过的密码；用户取消输入时返回 null
 */
async function requestAdminPassword(count: number): Promise<null | string> {
  try {
    const { value } = await ElMessageBox.prompt(
      $t('system.files.delete.content', [String(count)]),
      $t('system.files.delete.title'),
      {
        type: 'warning',
        inputType: 'password',
        inputPlaceholder: $t('system.files.delete.password_placeholder'),
        confirmButtonText: $t('system.files.delete.confirm'),
        cancelButtonText: $t('system.files.delete.cancel'),
        inputValidator: (val: string) =>
          val ? true : $t('system.files.delete.password_required'),
      },
    );
    return value ?? null;
  } catch {
    // 用户取消
    return null;
  }
}

export const useCrudSchema = (
  getCrudApi?: () => CrudApiInstance | undefined,
  actions: {
    onDetail?: (row: Record<string, any>) => void;
    onUpload?: () => void;
  } = {},
): CrudSchema => {
  /**
   * 删除附件（单条 / 批量）
   *
   * 后端会在删除记录的同时清理对应的云 / 本地物理资源，不可恢复，
   * 因此必须先校验当前登录管理员密码。
   */
  async function handleRemove(ids: (number | string)[]) {
    if (!ids.length) {
      ElMessage.warning($t('components.crud.message.no_selection'));
      return;
    }

    const password = await requestAdminPassword(ids.length);
    if (!password) {
      return;
    }

    const crudApi = getCrudApi?.();
    try {
      crudApi?.setLoading(true);
      await FilesService.removeWithPassword(ids, password);
      ElMessage.success(
        $t('system.files.delete.success', [String(ids.length)]),
      );
      const state = crudApi?.getReadonlyState();
      if (state) {
        state.selection = [];
      }
      crudApi?.getGridInstance()?.clearCheckboxRow();
      crudApi?.refreshRemove();
    } finally {
      crudApi?.setLoading(false);
    }
  }

  const columns: CrudSchema['columns'] = [
    { type: 'checkbox', width: 60 },
    {
      field: 'base_path',
      title: $t('system.files.table.columns.preview'),
      width: 80,
      align: 'center',
      vxeColumn: {
        showOverflow: false,
        slots: {
          default: ({ row }: { row: Record<string, any> }) =>
            isImageFile(row) ? (
              <ElImage
                src={fileUrl(row)}
                previewSrcList={[fileUrl(row)]}
                previewTeleported
                fit="cover"
                style="width: 40px; height: 40px; border-radius: 4px;"
              />
            ) : (
              <span>-</span>
            ),
        },
      },
    },
    {
      field: 'filename',
      title: $t('system.files.table.columns.filename'),
      minWidth: 200,
      align: 'left',
    },
    {
      field: 'original_filename',
      title: $t('system.files.table.columns.original_filename'),
      width: 200,
      align: 'left',
    },
    {
      field: 'size_info',
      title: $t('system.files.table.columns.size_info'),
      minWidth: 100,
      align: 'left',
    },
    {
      field: 'ext',
      title: $t('system.files.table.columns.ext'),
      width: 80,
    },
    {
      field: 'platform',
      title: $t('system.files.table.columns.platform'),
      minWidth: 100,
    },
    {
      field: 'created_date',
      title: $t('system.files.table.columns.created_date'),
      width: 170,
    },
    {
      field: 'createds.created_name',
      title: $t('system.files.table.columns.created_name'),
      minWidth: 100,
      formatter: ({ row }: any) => row.createds?.created_name || '-',
    },
  ];

  return {
    crudApi: {
      list: FilesService.list,
      add: FilesService.create,
      edit: FilesService.update,
      remove: FilesService.delete,
      batchRemove: FilesService.remove,
      view: FilesService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: false,
    hasEdit: false,
    hasView: false,
    hasRemove: false,
    permissions: {
      remove: 'upload:files:delete',
      view: 'upload:files:read',
    },
    columns,
    tableActionColumn: { width: 140 },
    // 行内「详情」：打开文件详情抽屉（预览 + 基础信息 + 文件链接）
    tableActions: [
      {
        key: 'detail',
        label: $t('system.files.detail.action'),
        type: 'primary',
        link: true,
        icon: 'ant-design:eye-outlined',
        auth: 'upload:files:read',
        onClick: (_action: any, record: any) => {
          actions.onDetail?.(record);
        },
      },
    ],
    // 覆盖默认删除按钮：删除需先校验管理员密码，并同步清理物理资源
    toolbarActions: [
      {
        key: 'upload',
        label: $t('system.files.upload.action'),
        type: 'primary',
        icon: 'ant-design:cloud-upload-outlined',
        auth: 'upload:files:upload_image',
        onClick: () => {
          actions.onUpload?.();
        },
      },
      {
        key: 'batchRemove',
        label: $t('components.crud.action.batch_delete'),
        type: 'danger',
        icon: 'ant-design:delete-outlined',
        auth: 'upload:files:delete',
        ifShow: () => (getCrudApi?.()?.getRowSelection()?.length ?? 0) > 0,
        onClick: () => {
          const ids = (getCrudApi?.()?.getRowSelection() ?? []).map(
            (item: any) => item[ROW_KEY],
          );
          void handleRemove(ids);
        },
      },
    ],
    dropDownActions: [
      {
        key: 'remove',
        label: $t('components.crud.action.delete'),
        type: 'danger',
        icon: 'ant-design:delete-outlined',
        size: 'small',
        auth: 'upload:files:delete',
        onClick: (_action: any, record: any) => {
          void handleRemove([record?.[ROW_KEY]]);
        },
      },
    ],
    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_filename',
          label: $t('system.files.table.search.filename'),
        },
        {
          component: 'Input',
          fieldName: 'LIKE_original_filename',
          label: $t('system.files.table.search.original_filename'),
        },
        {
          component: 'Input',
          fieldName: 'LIKE_ext',
          label: $t('system.files.table.search.ext'),
        },
        {
          component: 'ApiDict',
          fieldName: 'IN_platform',
          label: $t('system.files.table.search.platform'),
          componentProps: {
            code: DictEnum.SYS_CLOUD_STORAGE,
            multiple: true,
            clearable: true,
            placeholder: $t('system.files.table.search.platform_placeholder'),
          },
        },
      ],
    },
    formDialog: { enabled: true, schema: [] },
  };
};
