import type { BasicUserInfo } from '#/core/shared/types';

export interface Props {
  title?: string;
  userInfo: BasicUserInfo | null;
  tabs: {
    label: string;
    value: string;
  }[];
}

export interface FormSchemaItem {
  description: string;
  fieldName: string;
  label: string;
  value: boolean;
}

export interface SettingProps {
  formSchema: FormSchemaItem[];
}
