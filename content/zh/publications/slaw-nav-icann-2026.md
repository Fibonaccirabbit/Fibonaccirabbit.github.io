---
id: slaw-nav-icann-2026
title: "Sparse Latent Action World Model for Vision-Language Navigation"
authors: [Zhanjiang Yang, Yueming Li, Meng Li, Lijun Sun]
venue: ICANN
venueType: conference
year: 2026
month: September
status: published
isFirstAuthor: true
keywords: [世界模型, 视觉语言导航, 具身智能]
summary: "先预测候选动作可能带来的未来状态，再结合指令选择下一步；通过跨步预测减少逐步想象的开销。"
featuredImage: /media/publications/slaw-nav.webp
featuredImageFull: /media/publications/slaw-nav.png
featuredImageAlt: "SLAW 导航流程：RGB 观测、候选动作的未来状态预测，以及语言条件导航策略。"
featuredImageCaption: "执行动作前，先比较不同候选动作对应的未来状态。"
links:
  paper: https://doi.org/10.1007/978-3-032-38404-1_13
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:eQOLeE2rZwMC
---

视觉语言导航要求智能体按照自然语言指令，在陌生环境中找到目标。SLAW 为这一过程加入了前瞻判断：动作条件世界模型预测不同候选动作对应的未来状态，多模态语言模型策略再结合指令与观测选择动作。世界模型不逐步模拟所有中间过程，而是在潜在空间中直接预测数步后的状态，以减少冗余计算和误差累积。论文在 RGB 观测条件下评估指令跟随导航，并通过消融实验分析稀疏预测和反事实比较对决策行为的影响。
