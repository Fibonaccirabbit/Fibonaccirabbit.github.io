---
id: h-ligo-icic-2026
title: "H-LIGO: A Hierarchical Lidar-Inertial-GNSS Odometry SLAM System for Robust Indoor-Outdoor Navigation"
authors: [Jiawei Dong, Meng Li, Zhanjiang Yang, Yulu Zeng, Yu Lu]
venue: ICIC
venueType: conference
year: 2026
month: July
status: published
keywords: [SLAM, LiDAR, Inertial Navigation, GNSS]
summary: "Combining LiDAR, inertial sensing, and GNSS to maintain localization and map consistency when a robot moves between indoor and outdoor areas."
featuredImage: /media/publications/h-ligo.webp
featuredImageFull: /media/publications/h-ligo.png
featuredImageAlt: "H-LIGO system diagram connecting LiDAR, IMU and RTK-GNSS with an ESKF frontend and factor-graph backend."
featuredImageCaption: "A fast odometry frontend is paired with a global consistency backend."
links:
  paper: https://doi.org/10.1007/978-981-92-3447-9_44
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:W7OEmFMy1HYC
---

Indoor-outdoor transitions are difficult for localization because the quality of different sensors changes along the route. H-LIGO combines LiDAR, inertial measurements, and GNSS in a hierarchical estimation system. A tightly coupled frontend produces frequent odometry updates, while a factor-graph backend maintains global consistency. The system checks geometric degeneracy, rejects inconsistent GNSS measurements, and uses loop closures to correct drift. The paper evaluates trajectories and maps in a mixed indoor-outdoor campus environment, including feature-poor corridors and transition areas where satellite measurements can become unreliable.
