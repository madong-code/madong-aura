/**
 * 返回模板字段
 */
export const templateField = function (groupCode: string) {
  const data: Record<string, string[]> = {
    // 本地存储无私有概念，不含 is_private
    local: ['root', 'dirname', 'domain', 'remark'],
    oss: [
      'accessKeyId',
      'accessKeySecret',
      'bucket',
      'domain',
      'endpoint',
      'dirname',
      // 私有空间（非公开读）：开启后由后端签发临时直链
      'is_private',
      'remark',
    ],
    cos: [
      'secretId',
      'secretKey',
      'bucket',
      'domain',
      'region',
      'dirname',
      'is_private',
      'remark',
    ],
    qiniu: [
      'accessKey',
      'secretKey',
      'bucket',
      'domain',
      'region',
      'dirname',
      'is_private',
      'remark',
    ],
    s3: [
      'key',
      'secret',
      'bucket',
      'dirname',
      'domain',
      'region',
      'version',
      'endpoint',
      'acl',
      'is_private',
      'remark',
    ],
  };
  return data[groupCode] || [];
};

export const convertStringNumbers = (
  obj: Record<string, any>,
): Record<string, any> => {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (
      typeof value === 'string' &&
      value.trim() !== '' &&
      !Number.isNaN(Number(value))
    ) {
      result[key] = Number(value);
    }
  });
  return result;
};
