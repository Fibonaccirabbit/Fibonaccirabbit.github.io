---
id: cvan-jbhi-2025
title: "cVAN: A Novel Sleep Staging Method via Cross-View Alignment Network"
authors: [Zhanjiang Yang, Meiyu Qiu, Xiaomao Fan, Genan Dai, Wenjun Ma, Xiaojiang Peng, Xianghua Fu, Ye Li]
venue: IEEE JBHI
venueType: journal
year: 2025
month: July
status: published
isFirstAuthor: true
keywords: [睡眠分期, 跨视图对齐]
isCoFirst: true
coFirstAuthors: ["Zhanjiang Yang","Meiyu Qiu"]
summary: "将生理信号的时序特征与时频图特征在不同尺度上对齐，再用于睡眠阶段分类。"
featuredImage: /media/publications/cvan.webp
featuredImageFull: /media/publications/cvan.png
featuredImageAlt: "cVAN 架构：时序与频谱分支、跨视图对齐、公共特征学习和睡眠阶段分类器。"
featuredImageCaption: "时序视图与频谱视图在多个特征尺度上进行对齐。"
links:
  paper: https://doi.org/10.1109/JBHI.2024.3413081
  code: https://github.com/Fibonaccirabbit/cVAN
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:u5HHmVD_uO8C
---

睡眠分期利用生理信号识别不同睡眠阶段。cVAN 将同一段记录表示为两种互补视图：原始时序信号与时频图像。残差式网络分支提取频谱特征，Transformer 式分支捕捉时间变化，再通过尺度感知注意力将两种视图的特征对齐，融合后进行分类。公共特征学习用于支持跨域泛化。论文在三个公开睡眠数据集上评估方法，并分析跨视图对齐与多尺度特征对分类表现的影响。
