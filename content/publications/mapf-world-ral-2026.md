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
keywords: [World Models, Multi-Agent Path Finding]
isCoFirst: true
coFirstAuthors: ["Zhanjiang Yang","Yueming Li"]
summary: "A world model for decentralized multi-agent path finding that predicts nearby changes while generating actions, helping agents coordinate in crowded maps."
featuredImage: /media/publications/mapf-world.webp
featuredImageFull: /media/publications/mapf-world.png
featuredImageAlt: "MAPF-World architecture with a shared encoder, an action branch, a world branch, and spatio-agent positional encoding."
featuredImageCaption: "Action generation and local future prediction share the same backbone."
links:
  paper: https://doi.org/10.1109/LRA.2026.3726342
  arxiv: https://arxiv.org/abs/2508.12087
  code: https://github.com/Fibonaccirabbit/MAPF-World
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:Tyk-4Ss8FVUC
---

In decentralized multi-agent path finding, each agent makes decisions from a limited local view. Reacting only to the current observation can lead to congestion and deadlocks. MAPF-World combines action generation with short-horizon predictions of local observations and neighboring agents' intentions. Its action and world branches share a Transformer backbone, with positional encoding that represents both spatial structure and agent states. The paper evaluates coordination and generalization across simulated map layouts and agent densities, and includes a pipeline for constructing test maps from real-world road networks.
