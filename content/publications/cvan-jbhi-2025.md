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
keywords: [Sleep Staging, Cross-View Alignment]
isCoFirst: true
coFirstAuthors: ["Zhanjiang Yang","Meiyu Qiu"]
summary: "Sleep staging from physiological recordings by aligning temporal and time-frequency features across scales before classification."
featuredImage: /media/publications/cvan.webp
featuredImageFull: /media/publications/cvan.png
featuredImageAlt: "cVAN architecture with temporal and spectral branches, cross-view alignment, common-feature learning, and a sleep-stage classifier."
featuredImageCaption: "Temporal and spectral views are aligned at multiple feature scales."
links:
  paper: https://doi.org/10.1109/JBHI.2024.3413081
  code: https://github.com/Fibonaccirabbit/cVAN
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:u5HHmVD_uO8C
---

Sleep staging uses physiological recordings to identify different stages of sleep. cVAN models each recording through two complementary views: temporal signals and time-frequency images. A residual-like branch extracts spectral features, while a Transformer-like branch captures temporal patterns. Scale-aware attention aligns the two views across feature scales before they are combined for classification. Common-feature learning is also used to support cross-domain generalization. The paper evaluates the method on three public sleep datasets, examining how cross-view alignment and multi-scale features contribute to classification performance.
