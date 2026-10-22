---
slug: harness2-two-tier-agents
title: Harness² 不是递归自我改进：一套双层 Agent 的实测与分析
summary: 我们把 Google 开源的 Harness² 接入 Agent OS 作为进化引擎，在机械臂仿真与 LIBERO-Agent 上实测后将其剔除。本文说明它为何本质上是“外层强模型 Agent 优化内层弱模型 Agent”的双层结构，而不是递归自我改进，以及实测中暴露的问题。
date: '2026-10-22'
category: robotics
tags:
  - Agent OS
  - 自我改进
  - 实验分析
draft: false
---

Agent OS 的目标之一是让机器人 Agent 在使用中持续改进。上一阶段我们自建了一个改进闭环：由较强的模型读取失败记录、提出规则，再用仿真真值与留出任务决定是否采纳。这一阶段我们试用了 Google 开源的 Harness²（[论文](https://arxiv.org/abs/2610.14224)，[代码](https://github.com/google-research/harness2)）作为进化引擎。它在论文的三个专业基准上都取得了提升，并以“递归自我改进”（Recursive Self-Improvement，RSI）为研究动机。

接入并实测之后，我们决定将它移出系统。原因不只是分数没有提高，更在于它的结构：Harness² 本质上是一套双层 Agent，由外层（默认是更强的模型）去优化内层 Agent 的 harness，而不是一个系统在改进自身。

## Harness² 做了什么

Harness² 不改模型权重，改的是模型外面的 harness：系统提示、守则、长期记忆、工具说明、技能与脚本。它包含两层循环：

- **任务内：** 先用现有 harness 执行一次；外层的编辑 Agent 读取执行轨迹，提出两类修改（通用做法与领域知识），把两个修改各实际执行一次，再根据行为差异合成最终版本。全过程不看评分答案。
- **跨任务：** 每完成一个任务，就把采纳的 harness 和一段经验总结存入该领域的库，供后续同领域任务的编辑 Agent 参考。

## 为什么说它是双层 Agent，而不是 RSI

RSI 的核心不在于“把事情越做越好”，而在于改进的成果能提升“做改进”这件事本身：这一轮的提升，让下一轮的改进更快或更大。近期的综述（[arXiv 2607.07663](https://arxiv.org/abs/2607.07663)）把有界的自我精炼与开放式 RSI 区分开，前者收敛、可评估、已是工业常规做法；[ICLR 2026 的 RSI 研讨会](https://iclr.cc/virtual/2026/workshop/10000796)也强调，要关心“真的在变好、而且能证明”的循环。对照这一点，Harness² 有三个特征。

**第一，外层和内层是两个角色，默认配置下是两种不同强度的模型。** 论文的默认设置由 Claude Opus 4.8 担任 harness 编辑者，被优化的执行者是 Gemini 3.5 Flash 和 GLM-5。我们的接入方式也一样：外层用 deepseek-v4-pro，内层用 deepseek-flash。这种结构更接近“强模型通过上下文监督弱模型”：外层的判断力，经由 harness 文本与脚本转移给了内层。

**第二，被改进的只有内层，外层自身不变。** 跨任务的“递归”所积累的，是一个按领域索引的经验库，作为外层编辑 Agent 下次工作时的参考资料。论文在附录中也说明，当前的改进 harness 只是保留已采纳 harness 与经验的简单索引库，整理与修订它留作未来工作。外层的方法、判断标准与模型都没有因此改变，也没有实验表明后续任务上的改进速度在加快。

**第三，好坏由外层模型判断，不经真值检验。** 选择依据是执行行为的对比与模型判断，论文的局限性部分也写明：没有真值监督时，改进依赖行为对比和模型判断，不保证正确。外层判断错了，系统会带着信心朝错误方向优化。

需要公平地指出：论文还做了同一模型同时担任执行者与编辑者的实验，五个模型在各基准上都有提升，因此它并不只是“强模型教弱模型”。但即使是同一模型，它也是两个角色：外层多花了数倍的执行次数与推理，从更高的视角审视内层的轨迹。这更像是把额外的测试时计算换成了更好的 harness，仍不是系统在改进自己的改进能力。

## 我们的实测

执行 Agent 运行在开源 Agent 内核 [Pi](https://github.com/earendil-works/pi) 上，机器人能力经机器人框架 [dimOS](https://github.com/dimensionalOS/dimos) 接入；仿真与公开基准使用同一套接口。

**机械臂仿真：** 在低层控制构型上（Agent 自己控制末端位置与夹爪开合），我们选了唯一稳定失败的一类任务：目标物体宽于夹爪最大开口，正确行为是不动物体并说明原因。四个场景中，原始 harness 与 Harness² 采纳的版本都是 0/4。外层学到的结论是“夹不住就把它推进区域”，并为此写了一段条理清楚的论证。它看不到评分标准，所以无法知道这样做不被接受。

<video controls playsinline preload="metadata" style="aspect-ratio:1280/800" poster="/media/harness2-push-poster.jpg" aria-label="Harness² 采纳的 harness 下，Agent 把过宽的盒子推进目标区域">
  <source src="/media/harness2-push.mp4" type="video/mp4">
  <a href="/media/harness2-push.mp4">下载视频</a>
</video>

*Harness² 采纳的 harness 下的一局复现（约 40 秒）。指令为“把白色的大盒子放进绿色区域”，盒子宽于夹爪开口。Agent 闭合夹爪，把盒子分几次推进了区域，评测判定失败。*

**LIBERO-Agent：** 我们在公开的机械臂 Agent 基准 LIBERO-Agent（[论文](https://arxiv.org/abs/2609.39507)，[代码](https://github.com/dzj441/Libero-Agent)）的五个长时程高难度任务上实测（按完成的子目标阶段计分）。原始 harness 共完成 2/19 个阶段，Harness² 采纳的版本完成 1/19，两者都没有完全成功的任务。外层编辑共调用 23 次，花费约 9.3 美元、3.3 小时，另外多执行了 15 局，每局最长 30 分钟。

我们从数据中归纳出四个原因：

- **自我评价与真值背离。** 在一个需要按顺序轮换三只碗、且碗不得接触桌面的任务上，外层的经验总结写着改进版本“完成了 3 至 4 次移动”，评测器给出的完成度为 0（四个有序阶段一个都未完成）。
- **最小预算下没有真正的选择。** 每个任务只走一步时，最后只剩合成版本一个候选，于是总被采纳。唯一取得进展的一个探针版本（完成 25%）反而落选。
- **提议贴合单个场景。** 采纳的技能多以具体任务命名，例如开灶台、轮换碗，是针对单个场景的做法，不是对这一类任务通用的方法，下一个任务基本用不上。
- **信号被噪声淹没。** 这组任务对所用模型几乎处在地板上，同一任务三次运行的结果可能是 0、25% 与 100%。只执行一次的比较无法区分改进与运气。

<video controls playsinline preload="metadata" style="aspect-ratio:1024/512" poster="/media/harness2-libero-t25-poster.jpg" aria-label="LIBERO-Agent 轮换三只碗任务中，Harness² 采纳版本的一局">
  <source src="/media/harness2-libero-t25.mp4" type="video/mp4">
  <a href="/media/harness2-libero-t25.mp4">下载视频</a>
</video>

*LIBERO-Agent 轮换三只碗任务中，Harness² 采纳版本的一局（基准自带录像，约 31 秒；左为头部相机，右为腕部相机）。碗被多次移动，但没有按要求的顺序落到目标盘子上。外层把它总结为“完成了 3 至 4 次移动”，评测器记为 0。*

## 一个意外的收获

第一个实验虽然失败，却暴露了评测题目本身的缺陷：要求 Agent“不推动物体”，但 Agent 能看到的任何地方都没有写这条规则。我们把它补进通用的工作方法：不得为绕过限制而推、拖、拨动物体；请求本身要求、或物体本来就是这样活动的（抽屉、门）除外。

<video controls playsinline preload="metadata" style="aspect-ratio:1280/800" poster="/media/harness2-rule-decline-poster.jpg" aria-label="补入运行规则后，Agent 不触碰过宽的盒子并说明原因">
  <source src="/media/harness2-rule-decline.mp4" type="video/mp4">
  <a href="/media/harness2-rule-decline.mp4">下载视频</a>
</video>

*同一场景，补入运行规则后的一局（约 15 秒）。Agent 测量后判断盒子宽于夹爪开口，没有移动机械臂，直接说明无法执行，评测判定通过。*

同一模型下复测，低层控制构型的训练任务与留出任务都达到 52/52，此前分别是 49/52 与 50/52；高层构型的留出任务保持在 39/40，没有安全事件。这次改进来自有真值的评测与人工审查，不是来自 Harness²。

## 取舍与下一步

我们将 Harness² 移出了系统，保留一条可借鉴之处：它的提议过程会准确定位轨迹中的具体失误，再针对性地修改。这一点可以用来加强我们自己的提议环节，而采纳与否仍由仿真真值、多次重复与留出任务决定。

对机器人方向来说，物理世界与仿真器提供了不依赖模型判断的真实信号。我们认为更扎实的路径是：先把“有界、可评估、有真值把关”的自我改进做好，再用实验去测量递归性，也就是改进速度本身是否随代数提升。在拿出这样的证据之前，不宜把它称为 RSI。

最后说明本文的局限：我们的场景是机器人操作，所用模型、预算（每个任务只走一步）与样本量都与论文不同。本文的结论针对我们的设置与它的结构，并不否定 Harness² 在论文基准上报告的结果。

## 参考

- Harness²: Recursive Agent Harnessing for an Open World. [arXiv 2610.14224](https://arxiv.org/abs/2610.14224)，代码 [google-research/harness2](https://github.com/google-research/harness2)
- LIBERO-Agent: Evaluating General-Purpose Agents for Direct Embodied Manipulation. [arXiv 2609.39507](https://arxiv.org/abs/2609.39507)，代码 [dzj441/Libero-Agent](https://github.com/dzj441/Libero-Agent)
- Recursive Self-Improvement in AI: From Bounded Self-Refinement to Autonomous Research Loops. [arXiv 2607.07663](https://arxiv.org/abs/2607.07663)
- [ICLR 2026 Workshop on AI with Recursive Self-Improvement](https://iclr.cc/virtual/2026/workshop/10000796)
- Agent 内核 [earendil-works/pi](https://github.com/earendil-works/pi)；机器人框架 [dimensionalOS/dimos](https://github.com/dimensionalOS/dimos)
