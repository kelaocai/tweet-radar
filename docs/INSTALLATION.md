# 安装与使用指南

[返回首页](../README.md) · [English](#english)

## 普通用户：Chrome 侧载安装

当前版本尚未发布到 Chrome Web Store，需要手动加载一次。安装目录不要删除或移动，否则 Chrome 找不到扩展。

### 1. 获取文件

在 GitHub 项目页点 **Code → Download ZIP** 并解压，或在终端运行：

```bash
git clone https://github.com/kelaocai/x-jev-curator.git
```

确认解压目录里有 `extension/manifest.json`。

### 2. 加载扩展

1. 在 Chrome 地址栏打开 `chrome://extensions`。
2. 打开页面右上角的**开发者模式**。
3. 点击**加载已解压的扩展程序**。
4. 选择项目目录中的 `extension` 子目录（不要选仓库根目录）。
5. 可点击工具栏拼图图标，将 X Signal Lab 固定在工具栏。

### 3. 配置判断目标

点击工具栏里的扩展图标打开选项页，填写：

- **目标**：你要筛选什么，例如“寻找有实测过程与失败记录的开源数据库迁移经验”。
- **判断主体**：阅读者是谁、需要什么证据、哪些内容属于噪音。目标与画像越具体，判断越有区分度。
- **TypeSafe API key**：在 TypeSafe 官方账户中获取。密钥由你自行保管，不要贴到 issue、截图或聊天记录中。

保存后访问 `https://x.com/`。插件仅处理当前页面已经加载出的帖子；滚动页面后，新出现的帖子会分批判断。插件不会自动搜索或打开帖子；用户可通过精排结果定位帖子。右下角面板可查看状态、打开设置、精排当前候选或继续判断。

### 4. 理解高亮与精排

- 绿色：相关概率达到绿色阈值（默认 0.80）。
- 黄色：达到黄色阈值（默认 0.60）。
- 淡化：低于淡化阈值（默认 0.35）。
- “精排本页”：对达到入围阈值的最多 12 条做两两比较。12 条会产生 66 个比较问题。模型概率只是一种判断信号，不是正确率承诺。
- 达到每页上限后可点击“继续判断”放行下一批。扩大批次、候选数和页面上限会增加 API 用量。

### 5. 修改设置或卸载

- 点击扩展图标可重新打开选项。
- 在 `chrome://extensions` 中关闭开关可暂时停用。
- 点“移除”可卸载。插件记录的最近判断方案存放在浏览器本地；卸载扩展通常会一并移除其本地存储。
- 更新代码后回到 `chrome://extensions`，点击扩展卡片上的刷新按钮，并刷新 X 页面。

## 常见问题

**为什么没有出现高亮？** 确认扩展已启用、目标/画像/API key 已填写、当前网址是 `x.com` 或 `twitter.com`，并刷新页面。打开扩展卡片的“错误”或 DevTools Console 查看服务错误。

**提示 401/403？** 检查 TypeSafe key 是否有效、账户是否有可用额度，以及服务商账户权限。不要把 key 发给维护者排查。

**提示 429/503？** 服务可能限流或繁忙。稍后重试，并降低每页上限、批大小或精排候选数。

**X 改版后识别不到帖子？** 页面结构和选择器可能变化。可在项目中搜索 `SELECTORS`，按[贡献指南](../CONTRIBUTING.md)提交修复；不要在 issue 中贴私密帖子内容。

**插件会自动抓取 X 或保存帖子吗？** 不会主动请求 X 的接口或自动滚动；它读取页面 DOM 中当前已加载的帖子并在内存中缓存当前页面判断结果。用户点击精排结果时，插件会定位页面中的帖子；若帖子已离开页面 DOM，可能在新标签打开该帖子。判断目标历史、画像历史和 key 等设置保存在 Chrome 本地扩展存储中。帖子文本、目标和画像会发给 TypeSafe API，详见[安全说明](../SECURITY.md)。

## 开发者本地加载

```bash
git clone https://github.com/kelaocai/x-jev-curator.git
cd x-jev-curator
```

无需 `npm install`、构建步骤或编译。按上文加载 `extension/`。改动扩展文件后，在扩展管理页点刷新并重载 X 标签页。

## English

1. Download and extract the ZIP, or clone the repository.
2. Open `chrome://extensions`, enable **Developer mode**, then click **Load unpacked**.
3. Select the repository's `extension/` folder.
4. Open extension options and enter your goal, reader profile, and your own TypeSafe API key.
5. Visit X. The extension judges posts already loaded in the page. Use the floating panel to rank candidates.

No build tools or dependencies are required. The extension is not yet listed in the Chrome Web Store. See the Chinese sections above for detailed troubleshooting and uninstall instructions.
