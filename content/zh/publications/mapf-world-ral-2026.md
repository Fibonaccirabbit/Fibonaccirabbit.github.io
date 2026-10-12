---
id: mapf-world-ral-2026
title: "MAPF-World: Action World Model for Multi-Agent Path Finding"
authors: [Zhanjiang Yang, Yueming Li, Yang Shen, Meng Li, Lijun Sun]
venue: IEEE RA-L
venueType: journal
year: 2026
month: October
status: published
isFirstAuthor: true
keywords: [世界模型, 多智能体路径规划]
isCoFirst: true
coFirstAuthors: ["Zhanjiang Yang","Yueming Li"]
summary: "在局部观测下同时生成动作、预测附近环境变化，帮助多个智能体在拥挤地图中协调通行。"
featuredImage: /media/publications/mapf-world.webp
featuredImageFull: /media/publications/mapf-world.png
featuredImageAlt: "MAPF-World 架构：共享编码器、动作分支、世界模型分支和空间智能体位置编码。"
featuredImageCaption: "动作生成与局部未来预测共用同一个骨干网络。"
links:
  paper: https://doi.org/10.1109/LRA.2026.3726342
  arxiv: https://arxiv.org/abs/2508.12087
  code: https://github.com/Fibonaccirabbit/MAPF-World
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:Tyk-4Ss8FVUC
---

去中心化多智能体路径规划中，每个智能体只能看到附近区域。仅根据当前观测选择动作，容易在拥挤地图中出现堵塞和死锁。MAPF-World 将动作生成与短时局部预测结合起来，预测附近环境变化和其他智能体的动作意图。动作分支与世界模型分支共用 Transformer 骨干网络，并通过位置编码同时表示空间结构和智能体状态。论文在不同地图与智能体密度的仿真环境中评估协同能力和泛化表现，同时提供基于真实道路数据构造测试地图的流程。
