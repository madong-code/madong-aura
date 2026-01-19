import BaseService from "@/app/api/core/base";
import type { DictItemRow } from "./dict-item-model";

const baseUrl = '/system/dict-item';

export const DictItemService = {
  ...BaseService<DictItemRow>({ baseUrl }),
};

export default DictItemService;
