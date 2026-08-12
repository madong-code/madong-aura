# Locale Loader

统一加载框架语言包、应用语言包和插件语言包，合并后注入 vue-i18n。

## 目录结构

```
src/
├── lang/                        # 框架语言包（文件名作前缀 key）
│   ├── zh-CN/
│   │   └── common.json
│   └── en-US/
│       └── common.json
├── locales/
│   ├── langs/                   # 应用语言包（文件名作前缀 key，不支持子目录）
│   │   ├── zh-CN/
│   │   │   ├── page.json
│   │   │   └── demos.json
│   │   └── en-US/
│   │       ├── page.json
│   │       └── demos.json
│   └── loader/                  # 本模块
└── plugins/
    └── test/                    # 插件语言包（插件名 + 文件名作前缀）
        └── lang/
            ├── zh-CN/
            │   ├── demo.json
            │   └── menu.json
            └── en-US/
                └── demo.json
```

## 三种加载模式

### 1. 应用语言包 — `locales/langs/`

文件名作为命名空间前缀，**不支持子目录层级**（文件必须直接放在语言目录下）。

```jsonc
// locales/langs/zh-CN/page.json
{
  "auth": { "login": "登录" },
  "dashboard": { "title": "概览" },
}
```

使用：`$t('page.auth.login')` → `登录`

```jsonc
// locales/langs/zh-CN/demos.json
{
  "title": "演示",
  "localeTest": { "title": "语言包测试" },
}
```

使用：`$t('demos.title')` → `演示`

### 2. 框架语言包 — `lang/`

文件名作为命名空间前缀，文件名中的 `.` 会创建嵌套层级。

```jsonc
// lang/zh-CN/common.json
{
  "button": { "confirm": "确认" },
  "message": { "success": "操作成功" },
}
```

使用：`$t('common.button.confirm')` → `确认`

带点的文件名示例：

```
lang/zh-CN/test.ss.json
```

使用：`$t('test.ss.*')`

### 3. 插件语言包 — `plugins/*/lang/`

插件目录名 + 文件名作为前缀，文件名中的 `.` 同样创建嵌套层级。

```jsonc
// plugins/test/lang/zh-CN/demo.json
{
  "greeting": "你好！欢迎使用插件语言包测试",
  "menu": { "home": "首页" },
}
```

使用：`$t('test.demo.greeting')` → `你好！欢迎使用插件语言包测试`

```
plugins/test/lang/zh-CN/menu.json
```

使用：`$t('test.menu.*')`

## Key 规则汇总

| 目录              | Key 格式                | 示例                          |
| ----------------- | ----------------------- | ----------------------------- |
| `locales/langs/`  | `文件名.层级key`        | `$t('page.auth.login')`       |
| `lang/`           | `文件名.层级key`        | `$t('common.button.confirm')` |
| `plugins/*/lang/` | `插件名.文件名.层级key` | `$t('test.demo.greeting')`    |

## 加载顺序

1. `locales/langs/` — 文件名前缀（不支持子目录层级）
2. `lang/` — 文件名前缀
3. `plugins/*/lang/` — 插件名 + 文件名前缀

后加载的同名 key 会覆盖先加载的。

## 新增插件语言包

1. 在 `src/plugins/<插件名>/lang/` 下创建 `zh-CN/` 和 `en-US/` 目录
2. 添加 JSON 文件，内容即为翻译键值对
3. 无需修改 loader 代码，自动扫描加载

## 语言目录映射

| 输入                                 | 映射到  |
| ------------------------------------ | ------- |
| `zh` / `zh-CN` / `zh_CN` / `zh-Hans` | `zh-CN` |
| `en` / `en-US` / `en_US` / `en-GB`   | `en-US` |
