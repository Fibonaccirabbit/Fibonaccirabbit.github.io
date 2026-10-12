---
id: envpilot-tosem-2026
title: "EnvPilot: Systematic Design and Evaluation of an Experience-Augmented Agent for Software Environment Setup"
authors: [Hanwu Chen, Hanyu Lin, Zhanjiang Yang, Linhao Zhang, Aoyan Li, Jinxi Li, Meng Li, Yin Chen, Daoguang Zan]
venue: ACM TOSEM
venueType: journal
year: 2026
month: September
status: accepted
keywords: [智能体, 软件环境配置, 经验复用]
summary: "从以往环境配置过程中检索可复用经验，在容器中安装依赖、执行命令并验证项目运行情况。"
featuredImage: /media/publications/envpilot.webp
featuredImageFull: /media/publications/envpilot.png
featuredImageAlt: "EnvPilot 流程：代码仓库、轨迹经验记忆、上下文检索、容器执行环境和自动验证。"
featuredImageCaption: "检索历史配置经验，执行命令，再验证环境是否可用。"
links:
  arxiv: https://arxiv.org/abs/2609.07357
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:Y0pCki6q_DkC
---

配置软件环境往往不只是安装一份固定的依赖列表。EnvPilot 将以往配置尝试整理为可复用的轨迹经验记忆。智能体针对当前仓库检索相关记录，在容器中执行安装和配置命令，再检查项目能否构建、测试能否运行，形成执行、查看反馈与复用已验证策略的循环。论文在涵盖多种编程语言的 AES-Bench 上评估系统，并分析结构化记忆、检索机制和失败处理的作用。
