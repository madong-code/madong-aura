/**
 * 构建配置数据
 * @param data
 * @param skipFields
 * @param extraFields
 */
export const transformData = function (
  data: { [s: string]: unknown } | ArrayLike<unknown>,
  skipFields: string[] = [],
  allowedKeys: string[] = [], // 添加允许的键集合
  extraFields: Record<string, string> = {},
  filedlink: Record<string, string> = {}
) {
  return Object.entries(data)
    .filter(
      ([key]) =>
        !skipFields.includes(key) && (allowedKeys.length === 0 || allowedKeys.includes(key)) // 过滤跳过字段和不在允许集合中的字段
    )
    .map(([key, value]) => {
      const transformedObject = {
        code: key,
        content: value !== undefined ? value : '',
        name: filedlink[key]
      }

      Object.assign(transformedObject, extraFields)
      return transformedObject
    })
}

/**
 * 返回模板字段
 * @param groupCode
 * @returns
 */
export const templateField = function (groupCode: string) {
  const data = {
    local: ['root', 'dirname', 'domain', 'remark'],
    oss: ['accessKeyId', 'accessKeySecret', 'bucket', 'domain', 'endpoint', 'dirname', 'remark'],
    cos: ['secretId', 'secretKey', 'bucket', 'domain', 'region', 'dirname', 'remark'],
    qiniu: ['accessKey', 'secretKey', 'bucket', 'domain', 'region', 'dirname', 'remark'],
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
      'remark'
    ]
  }
  //@ts-ignore
  return data[groupCode] || []
}

export const convertStringNumbers = (obj: Record<string, any>): Record<string, any> => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      obj[key] = Number(value)
    }
  })
  return obj
}
