# 哆哆猫咪手账

## 风格与来源

参考 [Cat On Chair 官方介绍](https://catonchair.app/en/) 与其 [App Store 截图](https://apps.apple.com/us/app/cat-on-chair-pomodoro-timer/id6746562271) 的温暖手绘氛围。本项目重新绘制自己的图标、小猫与书桌插画，没有使用该应用的猫、椅子、家具或其他原始美术资源。参考截图仅留在本地，未纳入 Git 或小程序包。

采用奶油方格纸、铅笔棕线条、稍不对称的圆角、胶带和淡彩便签。保留“哆哆记账”、粉色猫爪、原厨房三猫与“呼噜厨房出品”，现有收支、账户、照片、左滑删除、日期选择和数据迁移逻辑保持原有行为。

## 图标与插画

- 24 个支出类别和 5 个收入类别，各自具有可辨识的手绘物件。
- 9 类资产：钱包、存钱罐、纸币、银行卡、支付手机、投资种子、旅行箱、应急盾牌、家庭爱心屋。
- 4 个导航图标、1 个设置图标、1 个未知类别回退图标，以及 1 幅原创小猫记账插画。
- `sources/` 保存生成的可编辑 SVG；实际页面全部使用 `assets/doodles/` 中的透明 PNG，避免依赖原生 SVG 解码。图标输出为 192×192，插画宽 900px。

`scripts/build-handdrawn.cjs` 保存所有手绘路径和配色。开发环境安装或提供 `sharp` 后运行即可重建 SVG、PNG 和 manifest；运行小程序无需安装图形依赖。

## 字体

来源：[LXGW Marker Gothic v1.004](https://github.com/lxgw/LxgwMarkerGothic/releases/tag/v1.004)，基于 Tanugo 的马克笔风格中文字体，遵循 SIL OFL 1.1。完整版权与许可位于 `assets/fonts/OFL.txt`；保留授权文件随小程序分发。

`Dodo Journal Hand` 是本项目的子集家族名称，字形轮廓未重新设计。覆盖 GB2312 中文、拉丁字符、标点和界面文本，超出字集的字使用系统回退。字体以 WOFF2 base64 嵌入 `theme/handwriting.wxss`，不请求远程地址，不读取手机上安装的自定义字体。

重建：将发行版 ZIP 解压到 `design/references/font-source/marker/`，确保其中包含 `LXGWMarkerGothic-Regular.ttf` 和 `OFL.txt`。为 Python 提供 `fonttools`、`brotli` 后运行 `scripts/build-handwriting.py`。脚本也会查找 `design/references/font-tools/` 中的开发依赖。原始大字体、ZIP 和构建依赖均不上传到小程序。

## 检查

`npm test` 包含全部类别及资产 PNG、未知类别回退、字体签名与哈希、许可证、离线加载方式和运行源文件体积检查。`scripts/capture-ui.cjs` 检查十个页面在 320、393、430 三种屏宽下的布局，确认字体实际加载，并复查日期按钮、键盘第四列、删除按钮及照片。

浏览器预览只近似原生页面；手机微信仍需确认字体渲染、原生日期弹窗、授权和安全区。运行源文件体积小于 2 MiB，最终上传体积以微信开发者工具为准。
