# 喵扑记账 · 猫咪手账风格

## 风格与来源

参考 [Cat On Chair 官方介绍](https://catonchair.app/en/) 与其 [App Store 截图](https://apps.apple.com/us/app/cat-on-chair-pomodoro-timer/id6746562271) 的温暖手绘氛围。本项目重新绘制自己的图标、小猫与书桌插画，没有使用该应用的猫、椅子、家具或其他原始美术资源。参考截图仅留在本地，未纳入 Git 或小程序包。

采用奶油方格纸、铅笔棕线条、稍不对称的圆角、胶带和淡彩便签。保留“喵扑记账”、粉色猫爪与“呼噜厨房出品”，三处陪伴插画统一为三花猫喵扑。现有收支、账户、照片、左滑删除、日期选择和数据迁移逻辑保持原有行为。

`components/brand-wordmark/` 是账本页与个人页共用的品牌字标：“喵”的口字旁替换为粉色猫爪，右部使用“苗”，再接“扑记账”。默认与小号两种尺寸共用同一结构，辅助阅读名称为完整的“喵扑记账”。英文眉题为 MIAOPU BOOKKEEPING。预览见 [miaopu-wordmark.png](miaopu-wordmark.png)。

## 图标与插画

- 24 个支出类别和 5 个收入类别，各自具有可辨识的手绘物件。
- 10 类新增资产：钱包、存钱罐、娱乐电影票、教育学士帽与书本、养老摇椅与暖阳、住房房屋与钥匙、投资种子、旅行箱、应急盾牌、家庭爱心屋。纸币、银行卡、支付手机仅用于兼容已有账户。
- 4 个导航图标、1 个设置图标、1 个未知类别回退图标。账本、资产、记账页均为同一只三花猫，但重新设计三种姿态：低头写手账、眯眼抱金币、探头拍铅笔。每种由背景、尾巴、身体、两种眼神、前景道具和持物爪子七层组成，书本/宝箱遮挡腹部和后腿。原先两幅静态插画留作历史资源，页面不再引用。
- 左滑删除使用独立的手绘橡皮擦：淡粉色橡皮、奶油色纸套、铅笔棕描边与少量擦屑，透明背景，无底圈。
- `sources/` 保存生成的可编辑 SVG；实际页面全部使用 `assets/doodles/` 中的透明 PNG，避免依赖原生 SVG 解码。图标输出为 192×192，旧静态插画宽 900px，三花猫动画图层为 600×370px。

`scripts/build-handdrawn.cjs` 保存所有手绘路径和配色。开发环境安装或提供 `sharp` 后运行即可重建 SVG、PNG 和 manifest；运行小程序无需安装图形依赖。

随后运行 `scripts/build-calico.cjs`，从 `scripts/calico-scenes.cjs` 重建三个场景各自的图层、默认头像和 manifest。`components/calico-cat/` 用 CSS 动画分别驱动低头写字、满足抱金币、好奇探头与轻拍笔，各自有不同的尾巴动作和眨眼/单眼节奏；检测到减少动态效果偏好时停止全部动画。前景道具固定，爪子和手持物件一起运动，减少悬空或穿过道具的感觉，不需要 JavaScript 计时器。

动画演示见 [calico-motion.gif](calico-motion.gif)，静态对比见 [calico-scenes.png](calico-scenes.png)。运行预览构建后，可用 `scripts/capture-calico.cjs` 采集真实组件的 40 个动画帧，输出在 `design/preview/calico-frames/`。演示仅用于开发预览，不进入小程序包。

微信头像昵称流程参考 [微信官方组件](https://github.com/wechat-miniprogram/mp-user-avatar)。头像选择不会自动返回昵称；昵称使用 `input type="nickname"`，在支持审核事件的平台等待 `bindnicknamereview` 通过后保存，低版本兼容在完成编辑时保存。头像复用本项目的持久文件服务，避免临时头像路径失效。

头像显示改为独立的 116rpx 圆角正方形裁切层，图片使用 `aspectFill`，选择按钮透明覆盖；不再让图片依赖原生 button 的内部高度。账本陪伴卡英文为两行手写“Little notes, lovely days”，配轻微倾斜与弧形下划线。月度卡移除收入展示，预算/结余改为紧凑的一行。

## 字体

来源：[LXGW Marker Gothic v1.004](https://github.com/lxgw/LxgwMarkerGothic/releases/tag/v1.004)，基于 Tanugo 的马克笔风格中文字体，遵循 SIL OFL 1.1。完整版权与许可位于 `assets/fonts/OFL.txt`；保留授权文件随小程序分发。

`Dodo Journal Hand` 是本项目的子集家族名称，字形轮廓未重新设计。覆盖 GB2312 中文、拉丁字符、标点和界面文本，超出字集的字使用系统回退。字体以 WOFF2 base64 嵌入 `theme/handwriting.wxss`，不请求远程地址，不读取手机上安装的自定义字体。

重建：将发行版 ZIP 解压到 `design/references/font-source/marker/`，确保其中包含 `LXGWMarkerGothic-Regular.ttf` 和 `OFL.txt`。为 Python 提供 `fonttools`、`brotli` 后运行 `scripts/build-handwriting.py`。脚本也会查找 `design/references/font-tools/` 中的开发依赖。原始大字体、ZIP 和构建依赖均不上传到小程序。

## 检查

`npm test` 包含全部类别及资产 PNG、未知类别回退、字体签名与哈希、许可证、离线加载方式和运行源文件体积检查。`scripts/capture-ui.cjs` 检查十个页面在 320、393、430 三种屏宽下的布局，确认字体实际加载，并复查日期按钮、键盘第四列、删除按钮及照片。

浏览器预览只近似原生页面；手机微信仍需确认字体渲染、原生日期弹窗、授权和安全区。运行源文件体积小于 2 MiB，最终上传体积以微信开发者工具为准。
