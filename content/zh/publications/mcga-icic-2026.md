---
id: mcga-icic-2026
title: "MCGA: Mixture of Codebooks Hyperspectral Reconstruction via Grayscale-Aware Attention"
authors: [Zhanjiang Yang, Lijun Sun, Jiawei Dong, Xiaoxin An, Yang Liu, Yu Lu, Meng Li]
venue: ICIC
venueType: conference
year: 2026
month: July
status: published
isFirstAuthor: true
keywords: [高光谱重建, 混合码本, 灰度感知注意力]
isCoFirst: true
coFirstAuthors: ["Zhanjiang Yang","Lijun Sun"]
summary: "结合学习得到的光谱码本与灰度感知对齐，从 RGB 图像重建高光谱图像，并处理光照变化。"
featuredImage: /media/publications/mcga.webp
featuredImageFull: /media/publications/mcga.png
featuredImageAlt: "MCGA 总览：光谱码本学习、RGB 特征对齐和测试时自适应。"
featuredImageCaption: "先学习光谱先验，再将其与 RGB 观测对齐。"
links:
  paper: https://doi.org/10.1007/978-981-92-3513-1_23
  arxiv: https://arxiv.org/abs/2507.09885
  projectPage: https://github.com/Fibonaccirabbit/MCGA
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:zYLM7Y9cAGgC
---

RGB 图像提供的光谱测量远少于高光谱图像，因此重建问题存在多种可能解。MCGA 不只学习直接的 RGB 到光谱映射，而是通过混合码本表示光谱先验，再用灰度感知注意力将这些先验与 RGB 特征对齐。框架还包含推理阶段的自适应步骤，用于处理输入分布变化。论文在两个数据集上比较光谱重建结果，分析计算效率，并测试不同光照条件下的表现。
