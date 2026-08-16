# SZY工具集

SZY工具集是由 SZY创新工作室 开发的多功能工具集合，提供网页版与安卓版两个版本，功能保持一致。

网页端在线使用地址：[https://tools.szystudio.cn](https://tools.szystudio.cn)

网页版基于原生 HTML、CSS、JavaScript 实现，不依赖构建工具与前端框架，部署至任意静态环境即可使用。安卓版基于 HBuilderX 的 HTML5+（5+ App）技术封装，页面与网页版同源，并通过 H5+ API 扩展原生能力，包括图片保存至相册、应用内更新、外链调用系统浏览器等。

## 功能

内置 60 余个工具，按用途分为 13 类：

- 加密（encryptor）：个性暗语、AES、哈希、Base64、三码等
- 编码（encode）：URL、HTML 实体、Hex、ASCII、摩斯电码、进制转换
- 格式化（format）：JS、TS、CSS、HTML、XML、YAML、SQL，以及 CSS 压缩
- 转换（convert）：Markdown 转 HTML、Less 转 CSS、图片转 Base64
- 文本（text）：大小写转换、驼峰命名、字数统计、行号、随机文本、ASCII 艺术字、XSS 向量
- 图片（image）：格式转换、圆角、锐化、切分、像素化、取色器、颜色转换
- 生成器（generator）：随机数、随机邮箱、随机 IP、随机 UA、UUID、倒计时、htpasswd、人生进度、吃什么
- 开发（dev）：代码 diff、目录树、Docker 命令、Git 命令、Hex 编辑器、水印
- 其他：JSON 工具、Markdown 编辑器、二维码生成与解码、图表绘制、H5+ 前端工具

除图表库通过 CDN 加载外，其余工具均在浏览器本地运行，不向服务器上传数据。

## 目录结构

```
SZY工具集源码/
├── SZY工具集-网页版/    # 网页版（纯 HTML/CSS/JS）
└── SZY工具集-手机版/    # 安卓版（HBuilderX 5+ App）
```

两个目录下的页面结构基本一致，手机版额外包含 `manifest.json`、`back.js`、`update.html`、`androidPrivacy.json` 等移动端文件。

## 网页版

### 运行

项目无依赖、无构建步骤，可通过以下任一方式运行：

1. 直接使用浏览器打开 `SZY工具集-网页版/index.html`
2. 通过本地静态服务器运行：

```bash
cd SZY工具集-网页版
python -m http.server 8000
```

随后访问 http://localhost:8000

3. 部署至任意静态托管平台（Nginx、Apache、GitHub Pages、Vercel、Netlify 等），上传 `SZY工具集-网页版` 目录下的全部内容即可

### 说明

- 图表工具通过 CDN 加载 Chart.js，使用时需保持网络连接
- 二维码、加密、格式化、文本、图片等核心功能均为本地实现，不依赖后端服务

## 安卓版

安卓版为 HBuilderX 的 5+ App 项目，页面与网页版共用同一套 HTML/CSS/JS，通过 H5+ API 调用系统能力。

### 导入与运行

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 在 HBuilderX 中依次点击 文件 -> 导入 -> 从本地目录导入，选择 `SZY工具集-手机版` 目录
3. 连接安卓真机（开启 USB 调试）或启动模拟器
4. 依次点击 运行 -> 运行到手机或模拟器

### 打包

1. 打开 `manifest.json`，确认应用名称、图标、权限等配置（仓库内已配置完整）
2. 依次点击 发行 -> 原生 App 云打包，选择 Android，配置签名证书后开始打包
3. 打包完成后，安装包输出至 `unpackage/release/` 目录

首次打包需登录 DCloud 账号，并生成或上传签名证书，证书文件存放于 `unpackage/cache/cloudcertificate/` 目录。

### 用到的 H5+ API

- `plus.runtime.openURL`：外链统一交由系统浏览器打开，避免在 WebView 内跳转
- `plus.gallery.save`、`plus.nativeObj.Bitmap`：二维码、图表等导出图片保存至系统相册
- `plus.downloader`：App 内下载更新安装包
- `plus.key.addEventListener`：拦截系统返回键，优先返回上一页
- `plus.runtime`：读取版本号、运行环境等信息

## 技术栈

- 网页版：原生 HTML / CSS / JavaScript
- 安卓版：HBuilderX、HTML5+（H5+ API）
- 图表：Chart.js（CDN 引入）

## 许可证
```License
MIT License

Copyright (c) 2026 SZY创新工作室

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
## 版权

SZY工具集由 SZY创新工作室 开发与维护。
