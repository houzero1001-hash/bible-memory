# Bible Memory

简体和合本与 KJV 中英经文背诵 PWA。双语合为一个任务，支持离线背诵、间隔复习、本地持久存储与 JSON 备份。

无需注册或 API Key。用户收藏和进度只保存在浏览器，不上传 GitHub。

## 开发与部署

需要 Node.js 24，无第三方依赖。

```sh
npm test
npm run build
```

GitHub Pages 发布 main 分支 docs/ 目录。更新时将最新 dist/ 内容同步至 docs/ 后提交，保留 docs/.nojekyll。请勿上传本地备份、密钥或个人经文库。

## iPhone 安装

使用 Safari 打开 Pages 网站 → 分享 → 添加到主屏幕。首次联网加载后可离线使用。不同浏览器和设备的数据不自动同步，可导出/导入 JSON 迁移。
