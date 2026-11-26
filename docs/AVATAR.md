# 虚拟形象实时交互

## 已实现

“回声”是由几何体生成的内置 3D 测试角色，无外部素材请求。通过 Three.js 渲染，嘴部、眼睛、头部和手臂分离驱动。另用 three-vrm 支持本地 VRM 文件；已用 VRM Consortium 仓库的 VRM1_Constraint_Twist_Sample v1.0.1 进行实际浏览器验证。

| 输入 | 形象行为 |
| --- | --- |
| 后端连接就绪 | 待机、眨眼和轻微呼吸 |
| 新文字轮次 | 思考状态，嘴部闭合 |
| 附图轮次 | 看画面状态，嘴部闭合 |
| text.delta | 回应状态；不假装在发声 |
| 浏览器实际播放 PCM | 音频 RMS 包络驱动嘴部开合 |
| 后端生成完成但仍有播放 | 继续发声状态，直到播放器队列清空 |
| 静音、打断、错误或新会话 | 立即关闭嘴部目标与本地队列，下一渲染帧闭合 |
| 鼠标在形象区域移动 | 有界、平滑的头部跟随 |
| 点击／键盘打招呼 | 挥手；按钮另支持点头 |

形象状态与 render driver 分离。AvatarFrame 包含 mood、mouth、blink、gaze、breath、gesture 等字段；未来 Live2D 可映射这些字段到 Cubism 参数，而无需改写后端事件流。

## 音频边界

采样来自现有 PcmPlayer 的 AnalyserNode，在实际 GainNode 后取 RMS。小于噪声阈值不张嘴，开合使用约 25 ms attack 和 70 ms release。关闭播放时直接归零，不依靠缓慢衰减。音量为零时不会驱动嘴部。

生成终态和播放终态分别处理。旧轮次完成、迟到音频、播放重置不能让已打断的形象重新开口。重播会显式重新进入允许音频驱动的状态。

DOM 的 data-mouth、data-mouth-peak 与 data-mood 是由实际渲染帧更新的诊断值，用于核验短测试音的口型活动；并非模型质量指标。

## VRM 边界

文件通过浏览器 File API 读取，最大 64 MB，必须为 GLB 容器内的 VRM 0.x 或 1.0。进入 GLTFLoader 前检查 JSON 和外部资源 URI；只支持自包含文件与内嵌 data 资源，不抓取旁文件、远端 URL 或任意后端路径。贴图使用浏览器临时 blob，CSP 只增加了本地 blob 连接许可。

模型加载失败保留原形象。切换或恢复默认会使旧载入任务失效，晚到模型被释放；旧几何体、材质和贴图也被释放。导入的模型不持久化到服务器或 localStorage。

形象驱动使用归一化骨骼，默认放下手臂。标准表情 `aa`、`blink`、`happy` 仅在模型具备时驱动。当前没有通用手指动画、VRMA 播放、语义情绪推断、人体追踪或音素级口型；Live2D 渲染器也未接入。

## 运行与验证

渲染上限 30 FPS，像素比上限 1.5。隐藏标签页时暂停；减少动态效果模式下关闭呼吸、鼠标跟随和自动眨眼，保留音频开合作为必要反馈。WebGL 失败不会阻塞文字对话。

纯状态测试覆盖文本不触发口型、音频尾部、取消、迟到状态、重播、静音／断线／新会话、动作与减少动态效果。文件测试覆盖合法容器、损坏描述和外部资源拒绝。

浏览器已验证内置形象显示、动作按钮、官方 VRM 导入、自然站姿、PCM 联动和恢复默认。一次官方 VRM 测试中，实际渲染的开合峰值为 0.401，播放结束为 0；该数字只证明驱动发生过，不代表声音或口型精度评分。第三方模型仍需逐个验证兼容性。

## 依赖与参考

- [Three.js](https://github.com/mrdoob/three.js) — MIT
- [three-vrm](https://github.com/pixiv/three-vrm) — MIT
- [验证用 VRM 来源](https://github.com/vrm-c/vrm-specification/tree/master/samples/VRM1_Constraint_Twist_Sample) — © 2022 pixiv Inc.，VRM Public License 1.0；仅留在本地 QA 文件夹，没有打包进应用。
