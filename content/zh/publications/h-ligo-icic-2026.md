---
id: h-ligo-icic-2026
title: "H-LIGO: A Hierarchical Lidar-Inertial-GNSS Odometry SLAM System for Robust Indoor-Outdoor Navigation"
authors: [Jiawei Dong, Meng Li, Zhanjiang Yang, Yulu Zeng, Yu Lu]
venue: ICIC
venueType: conference
year: 2026
month: July
status: published
keywords: [SLAM, 激光雷达, 惯性导航, GNSS]
summary: "融合激光雷达、惯性传感和 GNSS，维持机器人跨越室内外区域时的定位与地图一致性。"
featuredImage: /media/publications/h-ligo.webp
featuredImageFull: /media/publications/h-ligo.png
featuredImageAlt: "H-LIGO 系统图：激光雷达、IMU 与 RTK-GNSS 接入 ESKF 前端和因子图后端。"
featuredImageCaption: "高频里程计前端与全局一致性后端协同工作。"
links:
  paper: https://doi.org/10.1007/978-981-92-3447-9_44
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:W7OEmFMy1HYC
---

机器人从室内走向室外时，不同传感器的可靠性会随场景变化。H-LIGO 通过分层估计系统融合激光雷达、惯性测量与 GNSS。紧耦合前端提供高频里程计更新，因子图后端维持全局一致性。系统检测几何退化、剔除不一致的 GNSS 测量，并利用回环约束修正漂移。论文在室内外混合的校园环境中评估轨迹和地图，覆盖缺少几何特征的走廊，以及卫星信号容易受干扰的过渡区域。
