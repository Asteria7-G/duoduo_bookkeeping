# 哆哆猫咪手账

## 风格与来源

参考 [Cat On Chair 官方介绍](https://catonchair.app/en/) 与其 [App Store 截图](https://apps.apple.com/us/app/cat-on-chair-pomodoro-timer/id6746562271) 的温暖手绘氛围。本项目重新绘制自己的图标、小猫与书桌插画，没有使用该应用的猫、椅子、家具或其他原始美术资源。参考截图仅留在本地，未纳入 Git 或小程序包。

采用奶油方格纸、铅笔棕线条、稍不对称的圆角、胶带和淡彩便签。保留“哆哆记账”、粉色猫爪与“呼噜厨房出品”，三处陪伴插画统一为三花猫哆哆。现有收支、账户、照片、左滑删除、日期选择和数据迁移逻辑保持原有行为。

## 图标与插画

- 24 个支出类别和 5 个收入类别，各自具有可辨识的手绘物件。
- 10 类新增资产：钱包、存钱罐、娱乐电影票、教育学士帽与书本、养老摇椅与暖阳、住房房屋与钥匙、投资种子、旅行箱、应急盾牌、家庭爱心屋。纸币、银行卡、支付手机仅用于兼容已有账户。
- 4 个导航图标、1 个设置图标、1 个未知类别回退图标。账本、资产、记账页的小猫统一为同一只三花猫：共用身体、尾巴、睁眼和闭眼四个 PNG 图层，只替换书本、金币宝箱、笔记与茶杯等场景物件。原先两幅静态插画留作历史资源，页面不再引用。
- 左滑删除使用独立的手绘橡皮擦：淡粉色橡皮、奶油色纸套、铅笔棕描边与少量擦屑，透明背景，无底圈。
- `sources/` 保存生成的可编辑 SVG；实际页面全部使用 `assets/doodles/` 中的透明 PNG，避免依赖原生 SVG 解码。图标输出为 192×192，插画宽 900px。

`scripts/build-handdrawn.cjs` 保存所有手绘路径和配色。开发环境安装或提供 `sharp` 后运行即可重建 SVG、PNG 和 manifest；运行小程序无需安装图形依赖。

随后运行 `scripts/build-calico.cjs`，重建统一三花猫的图层、三个场景和方形默认头像，并补充 manifest。`components/calico-cat/` 用 CSS 动画驱动呼吸、摇尾及眨眼，不需要 JavaScript 计时器；检测到减少动态效果偏好时停止动画。动画演示见 [calico-motion.gif](calico-motion.gif)，它来自实际组件的动画帧截图，仅用于开发预览，不进入小程序包。

微信头像昵称流程参考 [微信官方组件](https://github.com/wechat-miniprogram/mp-user-avatar)。头像选择不会自动返回昵称；昵称使用 `input type="nickname"`，在支持审核事件的平台等待 `bindnicknamereview` 通过后保存，低版本兼容在完成编辑时保存。头像复用本项目的持久文件服务，避免临时头像路径失效。

头像显示改为独立的 116rpx 圆角正方形裁切层，图片使用 `aspectFill`，选择按钮透明覆盖；不再让图片依赖原生 button 的内部高度。账本陪伴卡英文为两行手写“Little notes, lovely days”，配轻微倾斜与弧形下划线。月度卡移除收入展示，预算/结余改为紧凑的一行。

## 字体

来源：[LXGW Marker Gothic v1.004](https://github.com/lxgw/LxgwMarkerGothic/releases/tag/v1.004)，基于 Tanugo 的马克笔风格中文字体，遵循 SIL OFL 1.1。完整版权与许可位于 `assets/fonts/OFL.txt`；保留授权文件随小程序分发。

`Dodo Journal Hand` 是本项目的子集家族名称，字形轮廓未重新设计。覆盖 GB2312 中文、拉丁字符、标点和界面文本，超出字集的字使用系统回退。字体以 WOFF2 base64 嵌入 `theme/handwriting.wxss`，不请求远程地址，不读取手机上安装的自定义字体。

重建：将发行版 ZIP 解压到 `design/references/font-source/marker/`，确保其中包含 `LXGWMarkerGothic-Regular.ttf` 和 `OFL.txt`。为 Python 提供 `fonttools`、`brotli` 后运行 `scripts/build-handwriting.py`。脚本也会查找 `design/references/font-tools/` 中的开发依赖。原始大字体、ZIP 和构建依赖均不上传到小程序。

## 检查

`npm test` 包含全部类别及资产 PNG、未知类别回退、字体签名与哈希、许可证、离线加载方式和运行源文件体积检查。`scripts/capture-ui.cjs` 检查十个页面在 320、393、430 三种屏宽下的布局，确认字体实际加载，并复查日期按钮、键盘第四列、删除按钮及照片。

浏览器预览只近似原生页面；手机微信仍需确认字体渲染、原生日期弹窗、授权和安全区。运行源文件体积小于 2 MiB，最终上传体积以微信开发者工具为准。
