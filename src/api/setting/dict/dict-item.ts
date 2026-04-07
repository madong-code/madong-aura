import BaseService from "@/api/core/base";
import type { DictItemRow } from "./types";

const baseUrl = '/system/dict-item';

export const DictItemService = {
  ...BaseService<DictItemRow>({ baseUrl }),
};

export default DictItemService;
