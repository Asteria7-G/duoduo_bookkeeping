# UI 设计与审核参考

核查日期：2026-10-19。以下为 GitHub 当时返回的 star 数，会随时间变化。

| 项目 | Star 快照 | 用途 | 本地目录 | 协议 |
| --- | ---: | --- | --- | --- |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 137,312 | 层级、配色、触控、数字排版与移动布局 | references/ui-ux-pro-max | MIT |
| [Impeccable](https://github.com/pbakaus/impeccable) | 82,781 | 设计审视、字体层级、原生界面审核、适配与精修 | references/impeccable | Apache-2.0 |
| [TDesign Miniprogram](https://github.com/Tencent/tdesign-miniprogram) | 1,779 | 微信小程序的间距、字体、圆角及组件状态参考 | references/tdesign-miniprogram | MIT |

三个项目均已 shallow + sparse clone，保留源仓库历史指针与许可证。UI UX Pro Max 拉取 src；Impeccable 拉取 skill；TDesign 拉取组件基础样式目录。版本见 references-lock.json。可在对应目录使用 git sparse-checkout set 扩展需要的目录，或 git sparse-checkout disable 拉取完整工作树。

这里只借鉴设计方法与平台规范。小程序依然使用原生 WXML/WXSS，不依赖这些项目运行，不需要安装它们的 CLI、执行远程安装脚本或新增全局技能。参考仓库、预览、测试和原始图片不进入小程序上传包。

## 参考图的使用

- prototype/mmexport1792372170154.jpg → assets/brand/kitchen-cats.jpg，逐字节复制，保留三只小猫、厨师帽和食物的原画；展示窗口只显示插画区域。
- prototype/mmexport1792372175586.jpg → assets/brand/whisk-purr.jpg，逐字节复制；个人页展示英文与中文手绘标识，通过容器排除底部日期。
- 由第二张图提取奶油纸色、粉色猫爪和手绘轮廓的设计语言。后续手账改版保留粉色猫爪，导航改用原创手绘 PNG，正文与金额改用离线中文手写字体。
- 产品名仍为“哆哆记账”；“呼噜厨房 / Whisk & Purr”是参考图品牌细节。

## 设计约定

- 当前纸色背景 #F5EFDF；内容面 #FFFAF0；主文字 #55483D；次文字 #796A5A。背景使用细方格纸纹。
- 主操作 #697957；月度总览用淡黄便签 #F2DDA1；资产总览用淡绿；猫爪用柔粉。
- 全局使用马克笔风格手写字体；金额保持阿拉伯数字，允许大额换行；正文 28rpx；说明 22–24rpx；标题 30–46rpx；金额 48–76rpx。
- 主页面统一 30rpx 水平留白、稍不对称的 14–26rpx 圆角和铅笔色边线；每个页面保留清晰的主操作。
- 月度总览采用实际支出、实际预算计算进度；没有预算时显示“本月结余”。
- 顶部给微信胶囊留位；底部避开 home indicator；记账弹层的详情区独立滚动，键盘保持可见。

## 手账风格补充来源

- [Cat On Chair](https://catonchair.app/en/)：借鉴温暖手绘氛围，未复制其美术素材。原创图形与字体说明见 [handdrawn/README.md](handdrawn/README.md)。
- [LXGW Marker Gothic v1.004](https://github.com/lxgw/LxgwMarkerGothic/releases/tag/v1.004)：SIL OFL 1.1，作为本地手写字体的子集来源，完整授权随 `assets/fonts/` 分发。
