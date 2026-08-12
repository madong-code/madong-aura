/**
 * 返回模板字段
 */
export const templateField = function (groupCode: string) {
  const data: Record<string, string[]> = {
    local: ['root', 'dirname', 'domain', 'remark'],
    oss: [
      'accessKeyId',
      'accessKeySecret',
      'bucket',
      'domain',
      'endpoint',
      'dirname',
      'remark',
    ],
    cos: [
      'secretId',
      'secretKey',
      'bucket',
      'domain',
      'region',
      'dirname',
      'remark',
    ],
    qiniu: [
      'accessKey',
      'secretKey',
      'bucket',
      'domain',
      'region',
      'dirname',
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
