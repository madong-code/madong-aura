import request from "@/utils/http";

export class DictService {
  // 获取所有字典
  static getAllDict() {
    return request.get<any>({
      url: "/system/dict/enum-dict-list",
      showErrorMessage: false, // 不显示错误消息
    });
  }
}
